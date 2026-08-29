# Taking an OTA while rooted

:::warning Decide whether to update before you read how
Updating is not neutral on this device. Newer firmware patches the exploits the unlock depends on, and the practical cost is losing **EDL** — the only write path these phones have. Read [what updating actually costs you today](/rm10pro/known-issues#what-updating-costs) first. This page assumes you have made that decision and covers the mechanics only.
:::

RedMagic ships **delta** OTAs. `update_engine` does not write the new firmware from scratch — it reconstructs it from what is already on your active slot, using `SOURCE_COPY` and `BROTLI_BSDIFF` operations. Before each operation it hashes the source bytes and compares them against a value baked into the payload. Any partition you have modified fails that check, and the whole update aborts:

```
ErrorCode::kDownloadStateInitializationError
```

A patched `init_boot` is the obvious offender, but it is rarely the only one. The update restarts its download from zero on every attempt, so discovering modified partitions one failure at a time is slow and wastes gigabytes of traffic.

## Find every modified partition in one pass {#find-modified}

This is the part worth doing properly. `ro.vendor.build.ab_ota_partitions` lists exactly what the payload will source from:

```bash
adb shell getprop ro.vendor.build.ab_ota_partitions | tr ',' '\n'
```

Hash every one of those on your **active** slot and compare against a genuine pre-root backup. Skip the dynamic partitions — `odm`, `vendor`, `system_dlkm`, `vendor_dlkm` live inside `super` and are handled through VABC snapshots, not sourced as raw block devices.

```bash
# on the device, for each partition name from the list above
adb shell su -c 'sha256sum /dev/block/by-name/init_boot_a'
```

Compare each against the same-named image in your backup. Anything that differs must be restored before the update will start.

:::tip You need a real pre-root backup for this
The comparison is only meaningful against images captured **before** you rooted. See [keep a copy of your pre-patch partitions](/rm10pro/known-issues#keep-prepatch-images). Without one, your options are the other slot — valid *only* if it holds the same build — or extracting stock images from a full firmware package.
:::

## Restore them

With an unlocked bootloader, `dd` from a rooted shell is enough; nothing needs fastboot:

```bash
adb push init_boot_a.img /data/local/tmp/
adb shell su -c 'sha256sum /data/local/tmp/init_boot_a.img'   # confirm the transfer
adb shell su -c 'dd if=/data/local/tmp/init_boot_a.img of=/dev/block/by-name/init_boot_a bs=1M'
adb shell su -c 'sync'
```

**Overwriting `init_boot` does not drop your root.** KernelSU's LKM is already loaded in the running kernel; the partition only decides what the *next* boot does. You keep a rooted shell for the rest of this procedure, which is what makes the whole thing work in one pass.

On a locked bootloader you cannot `dd` a signed partition safely — restore through [EDL](/rm10pro/edl-9008) instead.

## Turn on logging first {#logging}

The ROM ships with `log.tag=S`, so a failing update prints nothing at all. Lift it before you start, or you will be debugging blind:

```bash
adb shell su -c 'setprop log.tag V'    # runtime only, resets on reboot
adb shell su -c 'logcat -d | grep update_engine'
```

## Reading the failure {#reading-the-error}

A source mismatch looks like this:

```
E update_engine: [ERROR:verified_source_fd.cc(54)] Unable to open ECC source partition
                 /dev/block/bootdevice/by-name/recovery_a: No such file or directory (2)
E update_engine: [ERROR:partition_writer.cc(315)] The hash of the source data on disk for this
                 operation doesn't match the expected value.
E update_engine: [ERROR:partition_writer.cc(320)] Expected:   sha256|hex = 5C46252400...
E update_engine: [ERROR:partition_writer.cc(323)] Calculated: sha256|hex = C914183BDA...
E update_engine: [ERROR:partition_writer.cc(334)] Operation source (offset:size) in blocks: 0:1,4850:1
E update_engine: [ERROR:delta_performer.cc(194)] Failed to perform BROTLI_BSDIFF operation 3657,
                 which is the operation 0 in partition "recovery"
```

Three things to read out of it:

- **The partition name** on the `Failed to perform` line is what you have to restore.
- **The extents** — `0:1,4850:1` — are the only blocks checked, in **4096-byte** units. You can verify a fix against just those, which is far faster than hashing a 100 MB partition. Concatenate them in the order listed:

  ```bash
  adb shell su -c 'dd if=/dev/block/by-name/recovery_a bs=4096 skip=0    count=1' >  blk.bin
  adb shell su -c 'dd if=/dev/block/by-name/recovery_a bs=4096 skip=4850 count=1' >> blk.bin
  sha256sum blk.bin      # must equal the logged "Expected" value
  ```

- **The ECC line is noise.** The device has no error-correction partition, so `update_engine` always fails to open one after a mismatch. The hash mismatch below it is the real fault.

The progress line `delta_performer.cc(108) Completed N/M operations, X/Y bytes downloaded` tells you how far a run got. Note that this counter and the ZDM progress bar in Settings report different numbers for the same download — they are not measuring the same thing.

## Re-root in the post-OTA window {#post-ota-window}

When the update finishes it logs:

```
Update successfully applied, waiting to reboot.
```

**Do not reboot yet.** At this moment the new build's stock `init_boot` is sitting on the inactive slot and your old root is still live on the active one. Patch it now and you boot straight into the new firmware already rooted — one reboot, no gap.

```bash
# 1. copy the new stock init_boot somewhere the root manager can reach
adb shell su -c 'dd if=/dev/block/by-name/init_boot_b of=/sdcard/Download/init_boot_new.img bs=1M'
```

2. Patch `/sdcard/Download/init_boot_new.img` in the **KernelSU** app (Install → Select a file and patch). Keep the output; it lands in `/sdcard/Download/kernelsu_patched_*.img`.

```bash
# 3. write it back — see the read-only trap below
adb shell su -c 'blockdev --setrw /dev/block/by-name/init_boot_b'
adb shell su -c 'dd if=/sdcard/Download/kernelsu_patched_*.img of=/dev/block/by-name/init_boot_b bs=1M'
adb shell su -c 'sync; blockdev --setro /dev/block/by-name/init_boot_b'
adb shell su -c 'sha256sum /dev/block/by-name/init_boot_b'   # match it against the patched file
```

Then reboot.

:::danger `update_engine` leaves the target slot read-only
Once the update is applied, the slot it wrote is marked read-only and `dd` fails with `write error: Operation not permitted` — with no hint as to why. Confirm and clear it:

```bash
adb shell su -c 'blockdev --getro /dev/block/by-name/init_boot_b'   # 1 = read-only
adb shell su -c 'blockdev --setrw /dev/block/by-name/init_boot_b'
```
:::

Missing this window is not fatal — you come up on the new build unrooted, and with an unlocked bootloader `fastboot flash init_boot_<slot>` puts root back. It just costs you extra reboots.

### Which KMI to pick {#kmi}

The KernelSU app asks for a KMI and preselects one as "This device KMI". On RM10 Pro firmware that is **`android15-6.6`**, and it is correct.

The `android15` names the **GKI kernel branch**, not your Android version. The phone runs Android 16 userspace on an android15-6.6 kernel, and that mismatch is normal — `android16-6.12` is the wrong answer even though the About screen says Android 16.

The app reads the *running* kernel, so if you are patching for a build you have not booted yet, confirm against the new `boot` image rather than trusting `uname -r`:

```bash
adb shell su -c 'dd if=/dev/block/by-name/boot_b' > boot_b.img
strings boot_b.img | grep -m1 "Linux version"
```

:::tip A `vermagic` mismatch is expected
KernelSU's prebuilt `kernelsu.ko` reports something like `vermagic=6.6.127-…` against a `6.6.92` kernel. The GKI KMI is stable across point releases within a branch and `ksud` reconciles it at load. This is not a sign you picked the wrong KMI.
:::

### Checking a patched image before you flash it {#verify-patch}

Worth doing if you are unsure which stock image the app actually patched. RM10 `init_boot` ramdisks differ between builds **only** in `system/etc/ramdisk/build.prop`, so that file identifies the source build exactly:

```bash
python3 - <<'EOF'
import struct
d = open('kernelsu_patched.img','rb').read()
ks, rs = struct.unpack_from('<II', d, 8)          # kernel_size, ramdisk_size
off = 4096 + ((ks + 4095) // 4096) * 4096         # page-aligned ramdisk offset
open('ramdisk.lz4','wb').write(d[off:off+rs])
EOF
lz4 -d ramdisk.lz4 ramdisk.cpio
mkdir x && (cd x && cpio -idm < ../ramdisk.cpio)
grep incremental x/system/etc/ramdisk/build.prop   # e.g. 20260427.102420
```

A correctly patched image adds exactly `kernelsu.ko` and `init.real`, and replaces `init`.

## Back up the new build {#backup-after}

The post-update window is also the right time to capture the new firmware, while the images are stock and reachable. Dump the slot the OTA wrote, verify every file against a hash taken on the device, and store it **beside** your original backup rather than over it:

```bash
adb shell su -c 'sha256sum /dev/block/by-name/init_boot_b'                    # verify after pulling
adb exec-out su -c 'dd if=/dev/block/by-name/init_boot_b bs=1M' > init_boot_b.img
```

Two things worth getting right:

- **Save stock images, not patched ones.** A patched image is reproducible from stock at any time and is frozen to the root-manager version that built it. The stock image is the irreplaceable half — it is what the *next* delta OTA needs as a `SOURCE_COPY` source.
- **`super` needs the merge to finish.** Immediately after an update its logical partitions are still unmerged VABC snapshots, so a dump taken then captures a mid-merge state. Wait until the first boot completes and `/metadata/ota/snapshots/` is empty.

## Worked example {#worked-example}

Verified first-hand on an NX789J-UN, `RedMagicOS11.0.4MR1_GB` → `11.0.5MR_GB`, unlocked bootloader, KernelSU LKM root.

Two of the 33 sourced partitions were modified — and the second was only found after a 47%-complete download was thrown away:

| Partition | Why it differed | Failed at |
|---|---|---|
| `init_boot` | KernelSU-patched | operation 399, **16 KB** downloaded |
| `recovery` | held a TWRP build | operation 3657, ~47% downloaded |

Both restored by `dd` from the pre-root backup, after which the update ran through to `Update successfully applied` with no further errors. Root, all installed modules, and the module configuration survived; `init_boot` was patched in the post-OTA window and the phone came up on 11.0.5 rooted in a single reboot.

The kernel was unchanged across the two builds (`6.6.92-android15-8-g3637f4904cf5-ab13944661-4k`), so the KMI did not move. The security patch level went from 2025-12-01 to 2026-04-01.

The lesson is the one at the top of this page: hash the whole `ab_ota_partitions` set **before** starting the download, not after each failure.
