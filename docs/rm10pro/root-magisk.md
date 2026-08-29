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

## Path B — unlocked bootloader, KernelSU Next

KernelSU patches init_boot too (it loads as a kernel module / ramdisk overlay). Same procedure as Magisk but use the KernelSU Manager app's "Install to a file" option [#561 p29 pipegrep — used the toolbox path and ended up with Magisk regardless of starting with KSU].

**KernelSU Next** is what the RM11 side settled on, and the flow avoids the toolbox's built-in patcher entirely — that patcher fails on Android 16 init_boot images with `测试ramdisk.cpio失败` / "ramdisk.cpio test failed" [RM11 #2402 p121]. dev-reverse's procedure [RM11 #2457 p123, #2685 p135]:

1. Install the **KernelSU Next** APK from GitHub on the phone.
2. Copy the stock `init_boot.img` out of the toolbox's backup folder onto the device.
3. Patch it in the app (if it asks for a kernel version, give it the one your build reports — `6.12.23` on RM11 Pro / Android 16).
4. Rename the output to something short, and flash it with **toolbox Option 12** to the **active** slot's `init_boot`.

:::warning Magisk and KernelSU don't coexist
Installing KernelSU while Magisk is still present fails with an error about not being able to patch the Magisk boot image. Fully uninstall Magisk first [RM11 #2650 p133 InfectedThoughts].
:::

:::tip "KernelSU says Working but `su` is missing"
On Android 16, one user hit a state where the manager reported the LKM loaded and the superuser list populated, but `su` was absent from userspace (`/system/bin/sh: su: inaccessible or not found`) [RM11 #2720 p136]. It went unanswered in-thread — if you hit it, check you flashed the patched `init_boot` to the **active** slot, and that the slot you're booting isn't the one marked unbootable.
:::

If you'd rather merge KernelSU directly into a custom kernel build instead of patching init_boot, see [Kernel source](/rm10pro/kernel-source) for the public NX789S kernel tree — and the [prebuilt WildKernels / Coding-BR SUSFS kernels](/rm10pro/kernel-source#related-projects-in-the-ecosystem) the RM11 side flashes instead of building.

## Path C — locked bootloader, root via EDL

See [BD_Security's EDL root guide](/rm10pro/bd-security-edl-root) for the full procedure. Summary:
1. Enter clean 9008 (Vol+ + Vol− while plugging USB).
2. Sahara-upload `devprg.melf` as firehose programmer.
3. Firehose-program both `vbmeta_b` (patched with flags=0x02) **and** Magisk-patched `init_boot_b`.
4. Reboot.

This works without ever touching the bootloader. Trade-off: every kernel/init_boot change requires the same EDL dance, since you can't `fastboot flash` from a locked bootloader.

## Path D — toolbox-driven KernelSU (no-BL root) {#path-d-toolbox-no-bl-root}

The ZTE Family Toolbox 1.2.3+ offers a "no-BL root via KernelSU" feature for users who want root without unlocking. Internally this is the same EDL/firehose flow as Path C, automated. Use this if you want the bootloader locked for SafetyNet / banking-app reasons. See [ZTE Family Toolbox](/rm10pro/zte-family-toolbox).

## Path E — locked bootloader, no flashing at all (GhostLock)

A userspace kernel exploit (CVE-2026-43499) that grants uid 0 on a completely stock device — no EDL, no Windows, no partition written, verified boot stays green. The catch is that the root is **temporary**: it dies on the next normal reboot. The RM10 Pro's shipping kernel is a supported target.

See [GhostLock — temporary root with the bootloader locked](/rm10pro/ghostlock-temp-root). Use it when you want a rooted shell for reading partitions or running a module occasionally, not as the foundation of a permanent setup.

## Choosing between the paths

| | BL | Survives reboot | Needs Windows/EDL | Attestation |
|---|---|---|---|---|
| **A/B** — fastboot flash | unlocked | ✅ | ❌ | breaks (unlocked BL is visible) |
| **C/D** — EDL-flash patched `init_boot` | locked | ✅ | ✅ | preserved — see [Play Integrity](/rm10pro/play-integrity-attestation) |
| **E** — GhostLock | locked | ❌ | ❌ | preserved |

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
- **Disabling vbmeta via fastboot is a trap**: `fastboot flash --disable-verity --disable-verification vbmeta` triggers a bootloader-mode loop, requires EDL restore [#315 p16 Reminon]. Patch the vbmeta flags offline and flash the patched img, don't use the fastboot flags — the field is at **offset 0x78, big-endian**, see [Partitions & AVB](/rm10pro/partitions-avb#vbmeta-header-flag-byte).
- **Re-rooting after a system update** is a separate procedure with its own traps — delta OTAs refuse to start against a patched `init_boot`, and the slot the update writes comes back read-only. See [Taking an OTA while rooted](/rm10pro/ota-while-rooted).
- **Don't trust `getprop` to tell you your lock state.** Root-hiding modules spoof `ro.boot.verifiedbootstate`, `ro.boot.vbmeta.device_state` and `ro.boot.flash.locked`; a rooted RM10 Pro can report a pristine locked/green while `/proc/bootconfig` says `unlocked`/`orange`. Which of these paths you're on determines what you can safely flash, so check the real value — see [boot-state properties lie](/rm10pro/partitions-avb#boot-state-props-lie).
