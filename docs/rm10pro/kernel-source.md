# Kernel source — NX789J / NX789S

## Where it lives

**Official ZTE open-source release:** https://opensource.ztedevices.com/ — search for **`NX789S`**.

The release is named for the China/overclocked variant (S), but the tree contains build configurations for both **NX789J** (Global) and **NX789S** (China). They share the same kernel; differences are config-flag-driven [#672 p34 MrKonic].

## Local layout in this workspace

User's prior kernel work lives under `~/dev/root/`:
- `~/dev/root/nx789j-build-ws/` — active Kleaf workspace [from memory `project_nx789j_kernel_build`]
- `~/dev/root/nx789j-kernel/` — earlier source clone
- `~/dev/root/nx789j-stock-backup/` — stock partition dumps (boot, init_boot, vbmeta, vendor_boot, dtbo, etc.)
- `~/Downloads/NX789S_Android15_kernel(6.6.30).tar.gz` (~2 GB) — source tarball from opensource.ztedevices.com

Memory note: the Kleaf workspace already has the required patches applied; build command and partition map are documented in `[[project_nx789j_kernel_build]]`. Re-applying patches after pacman/system upgrades may be necessary.

## Build context

- Linux 6.6.30 base (Android 15 era)
- GKI 2.0 compatible — boot image is the GKI generic kernel; vendor/oem bits live in `vendor_boot` and `init_boot`
- Build system: **Kleaf** (Bazel-based, what Google's mainlined for Android 13+)

## Source vs binary split

What ZTE actually shipped on the device differs from the public source tree in ways that matter for rooting:

| Component | Source available | Notes |
|-----------|------------------|-------|
| Kernel (defconfig + drivers) | Yes (`NX789S` tarball) | Buildable as-is for GKI |
| `init_boot` ramdisk | No (only stock images) | Magisk patching path applies |
| `vendor_boot` ramdisk | Partial | Some vendor blobs only in stock |
| `abl_eng` (engineering bootloader) | No | RSA-signed; reverse-engineered, not source-released — see [10-reverse-engineering.md](/rm10pro/reverse-engineering) |
| `ztecfg` | No | Per-device, signed blob |

## Why we have the source now

Public release was relatively recent — MrKonic's post on May 17, 2026 [#672 p34] is the in-thread announcement. Before that, kernel custom-builds for the RM10 Pro relied on pulling the GKI generic kernel and bolting on the vendor modules from stock dumps. With NX789S sources public, a fully self-built kernel is feasible.

## Related local projects

- `Redmagic-Control-Center` fork (user's repo, mkonic/Redmagic-Control-Center) — hardware controls (logo, fan, etc.) reverse-engineered from OEM APK. See `[[project_redmagic_control_center]]`.
- `redmagic-autofan` — slim sh-daemon replacement for Control Center auto-fan via KSU module. IPC at `/data/local/tmp/fanctl/{status,control}`. See `[[project_redmagic_autofan]]`.

## Useful for kernel work from this thread

- BD_Security's partition layout [05-bd-security-edl-root.md](/rm10pro/bd-security-edl-root) — exact LUN 4 sector addresses for `boot_b`, `init_boot_b`, `vbmeta_b`. Useful when flashing a self-built kernel via EDL.
- Reminon's TWRP device tree [08-recovery-twrp.md](/rm10pro/recovery-twrp) — for testing custom kernels without committing to a full Magisk init_boot flow.
- AVB rules [07-partitions-avb.md](/rm10pro/partitions-avb) — modifying `boot` is what triggers AVB; for a custom kernel you must also patch vbmeta to flags=0x02 or sign the new boot image with a key the bootloader trusts (only possible with `eng_abl` which itself needs unlock).
