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

### What exactly is missing {#gpl-audit}

dev-reverse filed a formal consumer complaint against ZTE do Brasil via *Reclame Aqui* (ID 249804339, May 27 2026) and posted the full text and correspondence in-thread [RM11 #2367 p119]. Whatever its legal weight, the technical audit inside it is the most specific public inventory of the gaps:

| Missing | Consequence |
|---------|-------------|
| `canoe.fragment` platform defconfig | All Qualcomm drivers (SCM, SMMU, RPMH) stay disabled — 194 modules never load |
| `qcacld-3.0` and `qca-wifi-host-cmn` | No Wi-Fi |
| MMRM and Synx frameworks; many `kernel_platform/common/include/linux/` headers | Camera, video, GPU / display driver failures |
| `zte_charger_policy.ko`, `zte_led.ko`, `zte_ir.ko`, `zte_fingerprint.ko`, `zte_tpd.ko`, `zte_misc.ko`, `zte_imem_info.ko`, `zte_reboot_ext.ko`, `zte_ramdisk_reboot.ko` | Kernel-space ZTE drivers shipped as binaries only — charging, RGB, IR, fingerprint, touch |
| — | A hand-introduced Kbuild syntax error in the audio techpack (missing `-I` prefix) aborts Clang outright |

The end state is an `arm-scmi … timed out in resp` / `adsp-loader … fail to get rproc` boot hang: ADSP/CDSP never start, Keymint can't do FBE decryption, device freezes on the boot screen.

**ZTE's response:** ZTE do Brasil said the model isn't theirs to support (they handle MF routers and BLADE phones) and forwarded it internally; nothing substantive followed [RM11 #2367 p119]. dev-reverse then audited the download server itself and found the NX809J package still dated 2025-12-25 and uncompilable, and the newer **NX809S** package (2026-05-25) only 301.5 MB and **corrupted on the server** — *"making a broken file available has the same validity as publishing nothing at all"*.

**Escalation since:** a public campaign tagging the Software Freedom Conservancy and the Linux Foundation alongside `@RedMagicGaming` / `@ZTEPress` [RM11 #2369 p119], with the argument framed as *"open source laundering"*. astroskyisme's read on why email alone went nowhere: *"They have no incentive to comply right now… they need true pressure"* [RM11 #2366 p119].

:::tip Claimed workaround — unverified
On Jul 7 2026 **n00b-xda-disciple** claimed to have closed the gap himself: *"BRO I fixed the kernel lmfao. I added the missing parts… So you can stop hounding ZTE for the source code, I already have the missing files"* [RM11 #2867–2868 p144]. No public repo or build has been produced against that claim as of the latest thread activity, and dev-reverse was still actively rebuilding drivers days later [RM11 #2886 p145]. Treat as unconfirmed.
:::

:::warning Scope check for RM10 owners
All of the above is **NX809J (RM11 Pro)**. The RM10 Pro's own `NX789S` tree is public and buildable — see the top of this page. The reason it's documented here is that the two devices share a kernel family and the RM11 fight is the leading indicator for what ZTE does with the next RM10 release. dev-reverse re-sent an RM10 kernel-source request separately [#674 p34].
:::
- On the RM10 side, **dev-reverse** re-sent a kernel-source request to ZTE [#674 p34].

**Why it matters for rooting:** a fully compilable kernel is the prerequisite for *undetectable* root (KernelSU + SUSFS injected at build time) and for working biometrics/Wallet on custom setups. As elrey120 put it: banking apps and Wallet check **bootloader state**, not just root — *"that's why this modded kernel is important"* [RM11 #177 p9]. See [Known issues](/rm10pro/known-issues) and [Root with Magisk / KernelSU](/rm10pro/root-magisk).

## State of kernel building across the family {#build-state}

Repo state below was checked directly against GitHub on **2026-08-09**, not taken from thread claims — several of the repos people cite have moved or were never populated.

| Device | Source situation | Buildable today? |
|--------|------------------|------------------|
| **RM10 Pro** (NX789J / NX789S) | ZTE's release is **public and complete** | ✅ Yes — from the official tarball, as described above |
| **RM11 Pro** (NX809J) | ZTE's release is **incomplete / uncompilable** | ❌ Not from ZTE source; reconstruction ongoing |

### RM10 Pro — Reminon's build scaffolding (published, but hollow) {#reminon-kernel}

Reminon set up a proper `repo`-based build for the NX789J and pushed the **manifest**, but never pushed the trees it points at. Worth knowing so you don't lose an afternoon to it:

- **[reminon/kernel_manifest_nubia_nx789j](https://github.com/reminon/kernel_manifest_nubia_nx789j)** — `nx789j.xml` on branch `nubia/nx789j`. A complete, well-formed CLO/Bazel manifest: all the CodeLinaro prebuilts, toolchains, `dtc`, `mkbootimg`, clang and Rust are pinned to real revisions and *do* resolve.
- The three device-specific projects it references — `android_kernel_common_nubia_nx789j` (described as **"GKI common kernel 6.6.92 with KSU+SUSFS"**), `android_kernel_nubia_nx789j` (msm-kernel platform drivers) and `android_kernel_platform_nubia_nx789j` — **are all empty repositories with no branches**, while the manifest requests revision `nubia/nx789j_b_16.0.0`.

So `repo sync` against this manifest fails. What it does tell you is the intended shape of an RM10 Pro Android 16 kernel — GKI 6.6.92 with KernelSU + SUSFS merged at build time, which is exactly the configuration [Known issues](/rm10pro/known-issues) describes as the prerequisite for undetectable root. The manifest is a genuinely useful starting point if you're wiring up your own tree; you just have to supply the three trees yourself from ZTE's tarball. None of these repos is mentioned anywhere in either XDA thread.

His **[device_NX789J](https://github.com/reminon/device_NX789J)** tree does have content.

### RM11 Pro — active driver reconstruction {#nx809j-reconstruction}

Because ZTE's NX809J drop can't be compiled (see the [GPL audit](#gpl-audit)), dev-reverse's project is *rebuilding the missing vendor modules from the shipped binaries*:

- **[Coding-BR/zte-kernel-nx809j-drivers](https://github.com/Coding-BR/zte-kernel-nx809j-drivers)** — the live effort (created Jul 11 2026, still being pushed to in August). A reproducible Ghidra + Joern + Docker reverse-engineering workspace targeting GKI 6.12.23 / Android 16, with the locally-extracted stock `.ko` as the source of truth.
- **[Coding-BR/android_kernel_nubia_sm8850_qwjujube](https://github.com/Coding-BR/android_kernel_nubia_sm8850_qwjujube)** — the kernel tree proper (~1 GB, last pushed Jul 17 2026).

What makes this project worth taking seriously is that it **refuses to overclaim**. It defines an explicit status ladder — `INCOMPLETE` → `STATIC_ALIGNED_CANDIDATE` → `HARDWARE_VALIDATED` → `RELEASE_ELIGIBLE` — and states outright that *"compiling, achieving symbol parity, or running `insmod` in isolation does not prove complete functional reconstruction. Published candidates remain `INCOMPLETE` until every applicable gate is proven."* Current published state, per the repo's own STATUS files:

| Module | Progress |
|--------|----------|
| `zte_ir` | Canonical candidate, harness 8/8, rollback runbook |
| `zte_tpd` (touch) | KMI 152/152, map 367/367, KCFI 311/322, **200/367 microtasks PASS** |
| `zlog_common` | Source, candidate, harness, 13 attested microtasks |
| — | 12 managed ZTE candidates + a 335-module stock snapshot |

That is the honest answer to *"has anyone fixed the RM11 kernel?"*: **no, not yet** — one driver is close, one is two-thirds through static validation, and nothing has cleared hardware validation. Contributors need the full **userdebug ROM** installed, not just the userdebug `abl` [RM11 #2886 p145].

### The practical shortcut — don't build, borrow

Most people wanting KernelSU + SUSFS aren't building anything. They flash a **OnePlus GKI kernel of the matching version**:

- [WildKernels/OnePlus_KernelSU_SUSFS](https://github.com/WildKernels/OnePlus_KernelSU_SUSFS) — the `OP15 / OOS16 / android16-6.12.23` variants boot on the RM11 Pro [RM11 #2460 p123].
- [Coding-BR/OnePlus_KernelSU_SUSFS](https://github.com/Coding-BR/OnePlus_KernelSU_SUSFS) — NX809J-tested fork, with driver signature verification disabled [RM11 #2697 p135].
- Flash with [KernelFlasher](https://github.com/fatalcoder524/KernelFlasher). This is also the prerequisite for Droidspaces, which the stock kernel won't run [RM11 #2422 p122].

:::warning Version-match before you copy this
This works because the OnePlus 15 and RM11 Pro share GKI `6.12.23`. The RM10 Pro is a **6.6.x** device on a different SoC (SM8750 vs SM8850) — the same trick needs a 6.6-series donor, and nobody in-thread has reported doing it. Don't flash a 6.12 kernel to an RM10 Pro.
:::

## Flashing a self-built kernel

You'll need either:

- **An unlocked bootloader** → `fastboot flash boot_a custom-boot.img` to the inactive slot, then `fastboot --set-active=a` and reboot. See [Bootloader unlock](/rm10pro/bootloader-unlock-status) if you haven't unlocked.
- **EDL / 9008** → firehose-program the new boot image to the inactive slot's start sector. Partition addresses in [Partitions, AVB, vbmeta](/rm10pro/partitions-avb#lun-4-gpt--known-sectors-sector-size-4096).

:::warning AVB will reject a modified boot
Modifying `boot` triggers AVB, which forces a factory reset on a locked device and "device is corrupt" on an unlocked one without disabled verification. You must also patch vbmeta (set `vbmeta.flags` to `0x02` at offset `0x0C`) before flashing — see [Partitions, AVB, vbmeta — vbmeta header / flag byte](/rm10pro/partitions-avb#vbmeta-header-flag-byte).
:::

## Related projects in the ecosystem

- **[KernelSU](https://github.com/tiann/KernelSU)** — kernel-side root, alternative to Magisk. Can be merged into a custom kernel during build, eliminating the init_boot-patching step. The toolbox's "no-BL root" feature uses KernelSU pre-patched into init_boot.
- **[gbl_root_canoe](https://github.com/superturtlee/gbl_root_canoe)** — RM11 Pro "no-BL root" reference codebase. Same logical approach as kernel + EDL flashing for keeping the bootloader locked.
- **[Reminon's TWRP device tree](https://github.com/reminon/twrp_device_nubia_nx789j)** and **[hyty's OrangeFox build](https://github.com/plompomg/rm10pro-orangefox-recovery)** — useful when iterating on kernel changes; lets you boot a test boot.img without committing it via fastboot. See [Custom recovery](/rm10pro/recovery-twrp).
- **[Coding-BR/OnePlus_KernelSU_SUSFS](https://github.com/Coding-BR/OnePlus_KernelSU_SUSFS)** — dev-reverse's fork of [WildKernels/OnePlus_KernelSU_SUSFS](https://github.com/WildKernels/OnePlus_KernelSU_SUSFS) carrying NX809J fixes, with **driver signature verification disabled** [RM11 #2697 p135]. The upstream OnePlus 15 `android16-6.12.23` builds are what the RM11 side flashes to get KernelSU Next + SUSFS without a full kernel of their own [RM11 #2460 p123] — the same trick is the obvious starting point for an RM10 Pro on a matching kernel version. Flash with [KernelFlasher](https://github.com/fatalcoder524/KernelFlasher).
- **CI over local builds** — dev-reverse's standing advice after running out of disk space is to wire projects up to **GitHub Actions** and build there rather than locally, so contributors without 150 GB free can still participate [RM11 #2503 p126].
- **[Redmagic-Control-Center fork (mKonic)](https://github.com/mKonic/Redmagic-Control-Center)** — userspace hardware-control app for RM10 Pro (logo, fan, etc.). Calls into the kernel's `aw22xxx` driver via sysfs; relevant when porting effects across firmware versions.
