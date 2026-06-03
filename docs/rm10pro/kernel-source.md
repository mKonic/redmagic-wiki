# Kernel source — NX789J / NX789S

## Where to get it

**Official ZTE open-source release:** [opensource.ztedevices.com](https://opensource.ztedevices.com/) — search for code **`NX789S`**.

The release is named for the Chinese (NX789S) variant, but the tree ships build configurations for **both NX789J (Global) and NX789S (China)**. They share the same kernel — variant selection is config-flag-driven [#672 p34 MrKonic]. Available as a tarball; ~2 GB compressed.

## What's in the tree

- **Linux 6.6.30** base (Android 15 era)
- **GKI 2.0** compatible — boot image is the Google-signed generic kernel; vendor / OEM bits live in `vendor_boot` and `init_boot`
- Build system: **[Kleaf](https://android.googlesource.com/kernel/build/+/refs/heads/main/kleaf/)** (Bazel-based, the path Google standardized for Android 13+)

## What you need to build

| Requirement | Notes |
|-------------|-------|
| Linux host | Any modern distro. |
| Bazel (vendored by Kleaf) | Comes with the source tree — don't install separately. |
| Python 3, `repo`, standard build deps | `pacman -S python git base-devel` on Arch or distro equivalent. |
| Disk space | 30 GB+ for objects, 50 GB+ with kernel images. |
| RAM | 16 GB workable; 32 GB recommended for parallel builds. |

The tarball is self-contained — no `repo sync` needed.

## What's *not* in the tree

ZTE's public release covers the kernel proper, but some on-device binaries are not source-released:

| Component | Source available | Workaround |
|-----------|------------------|------------|
| Kernel proper (defconfig, drivers) | ✅ Yes | Build directly. |
| `init_boot` ramdisk | ❌ Stock images only | Magisk-patch the stock image — see [Root with Magisk / KernelSU](/rm10pro/root-magisk). |
| `vendor_boot` ramdisk | ⚠️ Partial | Extract vendor blobs from stock dumps. |
| `abl_eng` (engineering bootloader) | ❌ Closed, RSA-signed | See [Reverse engineering](/rm10pro/reverse-engineering). |
| `ztecfg` | ❌ Per-device blob | See [Reverse engineering](/rm10pro/reverse-engineering). |

For a kernel-only project (custom kernel for an unlocked or EDL-rooted device), the open source is enough. For anything that touches `abl` or `ztecfg`, you're on the reverse-engineering path.

## Why this matters

Public release of the kernel source happened relatively recently — announced in the RM10 Pro XDA thread on May 17, 2026 [#672 p34 MrKonic]. Before that, custom kernel work for the RM10 Pro relied on:

1. Pulling the **GKI generic kernel** from Google's AOSP mirror.
2. Bolting on vendor modules extracted from stock partition dumps.
3. Patching anything that needed to differ for the Snapdragon 8 Elite + Nubia hardware.

With NX789S sources public, a fully self-built kernel is feasible without that scaffolding.

## GPLv2 dispute & the reverse-engineered kernel {#gplv2-kernel}

The clean "the source is public" story above is the **NX789S (RM10 Pro)** case. The sibling **RM11 Pro (NX809J)** is the opposite — an open GPLv2 fight — and it's directly relevant here because the two devices share a kernel family.

- ZTE's published RM11 Pro kernel source is **incomplete / unbuildable** — missing the pieces needed to actually compile a bootable kernel [RM11 #2235, #2247 p112–113 dev-reverse].
- **dev-reverse** reverse-engineered the shipped kernel back into a **bootable** tree (his words: *"The kernel is bootable, but the touchscreen won't work"*), using AI-assisted tooling — Ghidra, Frida, qemu, and a KernelSU-Next module to override the video driver (60→144 Hz) [RM11 #1831 p92, #1918 p96, #1965 p99]. **n00b-xda-disciple** then got the **touchscreen working** [RM11 #2171 p109]. Community kernel repo: **[Coding-BR/android_kernel_nubia_sm8850_qwjujube](https://github.com/Coding-BR/android_kernel_nubia_sm8850_qwjujube)** (Linux 6.12 / Android 16 GKI). ⚠️ Per dev-reverse's README: **flash the test kernel to RAM only — never write it directly to the device**, or you'll brick it.
- A dedicated escalation thread was opened: **[\[Discussion\] GPLv2 Violation: RedMagic 11 Pro (NX809J) Incomplete/Unbuildable Kernel Sources](https://xdaforums.com/t/discussion-gplv2-violation-redmagic-11-pro-nx809j-incomplete-unbuildable-kernel-sources.4790008/)** [RM11 #2235 p112]. ZTE's source-compliance contact is `tech.sp@zte.com.cn`. Legal caveat from the thread: under GPLv2 the *end consumer* generally lacks standing — pressure has to come from a copyright holder [RM11 #2309 p116 dev-reverse]. **MrKonic** weighed in affirming the obligation: *"they're required by law since they're using the linux kernel which is under GPL 2"* [RM11 #2066 p104].
- On the RM10 side, **dev-reverse** re-sent a kernel-source request to ZTE [#674 p34].

**Why it matters for rooting:** a fully compilable kernel is the prerequisite for *undetectable* root (KernelSU + SUSFS injected at build time) and for working biometrics/Wallet on custom setups. As elrey120 put it: banking apps and Wallet check **bootloader state**, not just root — *"that's why this modded kernel is important"* [RM11 #177 p9]. See [Known issues](/rm10pro/known-issues) and [Root with Magisk / KernelSU](/rm10pro/root-magisk).

## Flashing a self-built kernel

You'll need either:

- **An unlocked bootloader** → `fastboot flash boot_a custom-boot.img` to the inactive slot, then `fastboot --set-active=a` and reboot. See [Bootloader unlock](/rm10pro/bootloader-unlock-status) if you haven't unlocked.
- **EDL / 9008** → firehose-program the new boot image to the inactive slot's start sector. Partition addresses in [Partitions, AVB, vbmeta](/rm10pro/partitions-avb#lun-4-gpt--known-sectors-sector-size-4096).

:::warning AVB will reject a modified boot
Modifying `boot` triggers AVB, which forces a factory reset on a locked device and "device is corrupt" on an unlocked one without disabled verification. You must also patch vbmeta (set `vbmeta.flags` to `0x02` at offset `0x0C`) before flashing — see [Partitions, AVB, vbmeta — vbmeta header / flag byte](/rm10pro/partitions-avb#vbmeta-header--flag-byte).
:::

## Related projects in the ecosystem

- **[KernelSU](https://github.com/tiann/KernelSU)** — kernel-side root, alternative to Magisk. Can be merged into a custom kernel during build, eliminating the init_boot-patching step. The toolbox's "no-BL root" feature uses KernelSU pre-patched into init_boot.
- **[gbl_root_canoe](https://github.com/superturtlee/gbl_root_canoe)** — RM11 Pro "no-BL root" reference codebase. Same logical approach as kernel + EDL flashing for keeping the bootloader locked.
- **[Reminon's TWRP device tree](https://github.com/reminon/twrp_device_nubia_nx789j)** — useful when iterating on kernel changes; lets you boot a test boot.img without committing it via fastboot.
- **[Redmagic-Control-Center fork (mKonic)](https://github.com/mKonic/Redmagic-Control-Center)** — userspace hardware-control app for RM10 Pro (logo, fan, etc.). Calls into the kernel's `aw22xxx` driver via sysfs; relevant when porting effects across firmware versions.
