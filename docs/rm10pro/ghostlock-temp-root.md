# GhostLock — temporary root with the bootloader locked

GhostLock is a userspace kernel exploit that grants uid 0 on a **stock, locked, verified-boot-green** device. Nothing is flashed, no partition is written, and the bootloader is never touched — so none of the costs on the rest of this wiki apply. The trade is that the root is **temporary**: it lives in the running kernel and is gone the moment the phone performs a real reboot.

For the RM10 Pro this is currently the only root path that does not require [EDL](/rm10pro/edl-9008) and a Windows host.

- **Repository:** [`YuKongA/ghostlock-app`](https://github.com/YuKongA/ghostlock-app) (Apache-2.0)
- **Vulnerability:** CVE-2026-43499
- **Credits:** YuKongA, building on [NebuSec/CyberMeowfia](https://github.com/NebuSec/CyberMeowfia), [JoinChang/ghostlock-oneplus](https://github.com/JoinChang/ghostlock-oneplus) and [x-spy/CVE-2026-43499-popsicle](https://github.com/x-spy/CVE-2026-43499-popsicle)
- Brought to both XDA threads by **HammadYasin** [#708 p36 / RM11 #3,114 p156], from his write-up on [r/RedMagic](https://www.reddit.com/r/RedMagic/comments/1vsifg1)

## Support is per-kernel, not per-device {#kernel-matching}

This is the part the forum posts get wrong. GhostLock does not detect your *phone* — it matches your **exact `uname -r` string** against a table of pre-extracted kernel offsets, and refuses anything it doesn't recognise. Two devices with the same marketing name on different firmware are different targets.

The row that covers the RM10 Pro:

| Kernel (`uname -r`) | Devices |
|---|---|
| `6.6.92-android15-8-g3637f4904cf5-ab13944661-4k` | Red Magic Tablet 3 Pro, **Red Magic 10 Pro**, Red Magic 11 Air |
| `6.12.23-android16-5-gf1bdb13583da-ab13761046-4k` | Red Magic 11 Pro, Tablet 5 Pro |
| `6.6.30-android15-8-g54dcbfbef792-ab12368803-4k` | Red Magic Tablet 3 Pro |

Check yours before anything else:

```bash
adb shell uname -r
```

:::tip The RM10 Pro kernel is in the supported table
`RedMagicOS11.0.4MR1_GB` (Android 16, December 2025 patch) on an NX789J reports exactly `6.6.92-android15-8-g3637f4904cf5-ab13944661-4k` — the string upstream lists. Shipping RM10 Pro firmware from that era is a supported target with no offset work needed.
:::

:::warning Root context alone doesn't tell you which path you're on
Both GhostLock and a flashed KernelSU `init_boot` give you `uid=0(root) … context=u:r:ksu:s0`, and on this device family **both** can sit behind `ro.boot.flash.locked=1` with `verifiedbootstate=green` — the [no-BL EDL root](/rm10pro/bd-security-edl-root) keeps verified boot green too. To tell them apart, look at the partition rather than the shell: `strings init_boot_<active slot>.img | grep -i kernelsu` returns `Hello, KernelSU!`, `kernelsu.ko` and `/data/adb/ksud` on a *flashed* root, and nothing on a stock image being exploited at runtime. The other tell is behavioural — if root survives a normal reboot, it was never GhostLock.
:::

The XDA crosspost advertises "REDMAGIC 10(S) PRO". The upstream table names the **10 Pro** only; the 10S Pro ships a different kernel build and is not listed. If you have a 10S, treat it as an unsupported kernel and go through the offset extraction below.

## Procedure

1. Install the **GhostLock** APK and a root manager — [KernelSU](https://github.com/tiann/KernelSU/releases) (`me.weishu.kernelsu`) or [ReSukiSU](https://github.com/ReSukiSU/ReSukiSU/releases) (`com.resukisu.resukisu`). The manager supplies `ksud`, which is what actually loads modules; without one you still get uid 0 but no module support.
2. Open GhostLock and tap **Run**.
3. On success the root manager opens and reports root.

If the phone **reboots** instead, the race lost — that is the normal failure mode, not damage. Boot back up and run it again; several attempts are expected.

Under the hood the exploit races two cores: the main thread hammers `pselect` while a consumer thread perturbs the waiting task's priority. It pins to the big cores by default, overridable with the `GHOSTLOCK_CORE` / `GHOSTLOCK_CONSUMER_CORE` environment variables.

## Living with temporary root

- **A normal reboot removes root.** Modules stay *installed* but are inactive until you run GhostLock again.
- **Use Soft Restart** (the root manager's, not the power menu's) after installing a module, so the module applies without dropping the exploit.
- **Losing mobile data / network** after gaining root is a known side effect. Running GhostLock again *without rebooting* has fixed it for several users.

## The rules that keep this safe {#do-not-flash}

:::danger Never write a partition while running GhostLock
The bootloader is still locked and verified boot is still enforcing. Any modification to a signed partition means the next boot fails signature verification, and with a locked bootloader you have no fastboot to recover with — you are straight into [EDL](/rm10pro/edl-9008), which needs a Windows host and a full backup you may not have.
:::

Concretely:

- **Do not press "Install" in KernelSU.** It patches and writes `init_boot`. On an unlocked device that is the normal flow; here it makes the phone unbootable.
- **No Magisk**, which also wants to patch a boot image.
- **No KonaBess** or any other tool that writes to a partition.
- Ordinary KernelSU modules that only overlay `/system` at runtime are fine — that is what the mount engine is for, and nothing reaches the block device.

Reading partitions is safe and is worth doing, since a rooted shell can dump images that otherwise need EDL:

```bash
adb shell su -c 'dd if=/dev/block/by-name/abl_a' > abl_a.img
```

This is the cheapest way to capture your `abl`, `xbl_config`, `init_boot`, `vbmeta` and `ztecfg` before an update rewrites them — see [what updating costs](/rm10pro/known-issues#what-updating-costs).

## If your kernel isn't in the table {#offset-extraction}

You don't need to rebuild the app. `tools/extract_rs` derives the offsets from a `boot.img` (plus `xbl_config.img` where present), from a full OTA ZIP, or from a URL pointing at one, and writes an `offsets.json` you import in the app:

```bash
cargo build --release --manifest-path tools/extract_rs/Cargo.toml
./ghostlock-extract boot.img --xbl-config xbl_config.img --format json --out offsets.json
```

Then **Import offsets.json** in the app, or push it to `/data/local/tmp/offsets.json`. The app can also do the whole thing itself — **Parse OTA link** takes a full OTA ZIP URL, **Parse image** takes `boot.img` plus optional `xbl_config.img`, and both run the extractor in-process.

This matters after every firmware update: the kernel string changes, the stored offsets no longer match, and GhostLock rejects the kernel until someone extracts the new set. You can be that someone with your own OTA ZIP.

## Field reports — treat as young software

The RM11 side's experience is mixed and worth knowing before you build a setup on it:

- **borygo77** got it running on the RM11 Pro but called it *"very unstable — Zygisk crashing, Vector shows that it has some problems running, hybrid mount doesn't work"*, and recommended the flashed-`init_boot` route instead [RM11 #3,120 p156].
- **christopherrrg** could not get it to run at all on the 11S Pro [RM11 #3,115 p156] — an unlisted kernel, which the section above predicts.
- The author's own note in the XDA post: the hole is expected to be patched, so **disable automatic system updates** if you rely on it.

For a permanent root that survives reboots you still need [an unlocked bootloader or the EDL route](/rm10pro/root-magisk).
