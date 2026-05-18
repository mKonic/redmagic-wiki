# Root — Magisk / KernelSU

The RM10 Pro is an A/B device with init_boot (no separate ramdisk in boot.img on Android 13+). All root paths involve patching `init_boot.img`. Choose your variant based on whether your bootloader is unlocked.

## Path A — unlocked bootloader, Magisk via fastboot

This is the simple path. After [bootloader unlock](/rm10pro/bootloader-unlock-status):

```bash
# 1. Pull stock init_boot.img from current slot (assuming slot _b)
adb shell
su            # only if already rooted; otherwise extract from firmware
dd if=/dev/block/by-name/init_boot_b of=/sdcard/init_boot.img

# 2. Patch with Magisk Manager app
# Install Magisk APK → Install → Select and Patch a File → init_boot.img
# Pull /sdcard/Download/magisk_patched_*.img

# 3. Flash to the OTHER slot via fastboot so you keep a safe fallback
adb reboot bootloader
fastboot flash init_boot_a magisk_patched.img   # flashing the inactive slot
fastboot --set-active=a
fastboot reboot
```

[#589 p30 HammadYasin] — confirms the `dd` extract approach. He flashes back to the **same** slot via `dd` from inside a rooted shell, but cross-slot `fastboot flash` from the inactive slot is the safer pattern.

## Path B — unlocked bootloader, KernelSU

KernelSU patches init_boot too (it loads as a kernel module / ramdisk overlay). Same procedure as Magisk but use the KernelSU Manager app's "Install to a file" option [#561 p29 pipegrep — used the toolbox path and ended up with Magisk regardless of starting with KSU].

The user's `KernelSU` source clone is at `~/dev/root/KernelSU`; see [09-kernel-source.md](/rm10pro/kernel-source) for the NX789S kernel tree.

## Path C — locked bootloader, root via EDL

See [05-bd-security-edl-root.md](/rm10pro/bd-security-edl-root) for the full procedure. Summary:
1. Enter clean 9008 (Vol+ + Vol− while plugging USB).
2. Sahara-upload `devprg.melf` as firehose programmer.
3. Firehose-program both `vbmeta_b` (patched with flags=0x02) **and** Magisk-patched `init_boot_b`.
4. Reboot.

This works without ever touching the bootloader. Trade-off: every kernel/init_boot change requires the same EDL dance, since you can't `fastboot flash` from a locked bootloader.

## Path D — toolbox-driven KernelSU (no-BL root)

The ZTE Family Toolbox 1.2.3+ offers a "no-BL root via KernelSU" feature for users who want root without unlocking. Internally this is the same EDL/firehose flow as Path C, automated. Use this if you want the bootloader locked for SafetyNet / banking-app reasons. See [02-zte-family-toolbox.md](/rm10pro/zte-family-toolbox).

## Slot handling

```bash
# Check active slot
fastboot getvar current-slot

# Switch
fastboot --set-active=a   # or =b
```

`fastboot --skip-reboot` lets you flash multiple partitions in one session. Always flash to the **inactive** slot first when experimenting — keeps a known-good fallback.

## Verifying root

```bash
adb shell su -c id
# uid=0(root) gid=0(root) ...
```

`/dev/block/by-name/` lists the block device symlinks per partition — useful when verifying which slot is which:
```bash
adb shell su -c "ls -l /dev/block/by-name/" | head
```

## Watch-outs

- **OnePlus-style "fastbootd" trap**: bobbyp1086 [#33 p2] notes that on some devices `fastboot flash` doesn't actually flash from regular bootloader fastboot — you need `fastbootd` (userspace fastboot, reached via `adb reboot fastboot` from a rooted/booted state). Reminon [#257 p13] confirms: with stock recovery present, RM10 Pro bootloader-fastboot won't switch slots or flash some partitions — you have to use fastbootd via stock recovery. Custom recovery removes this restriction.
- **AVB on `boot` (not init_boot)**: modifying `boot_b` triggers AVB and forces a factory reset; modifying `init_boot_b` does not [#315 p16 Reminon]. So patch init_boot, never boot, for root.
- **Disabling vbmeta via fastboot is a trap**: `fastboot flash --disable-verity --disable-verification vbmeta` triggers a bootloader-mode loop, requires EDL restore [#315 p16 Reminon]. Patch vbmeta flags offline (offset 0x0C → 0x02) and flash the patched img, don't use the fastboot flags.
