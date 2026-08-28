# RM11 Pro thread — cross-reference notes for RM10 Pro

The [Red Magic 11 Pro free-unlock guide](https://xdaforums.com/t/red-magic-11-pro-guide-bootloader-unlock-free-also-support-rm10-pad3pro-z70u-z80u-unlock-zte-family-toolbox.4780930/) is the canonical home of the **ZTE Family Toolbox**. The toolbox was originally RM11-only and incrementally grew RM10/Pro+, Pad 3 Pro, Z70U, Z80U support. Some details there are only stated in this thread.

Raw extract (3,192 posts, 160 pages) is in the repo at [`data/rm11pro-unlock.md`](https://github.com/mKonic/redmagic-wiki/blob/main/data/rm11pro-unlock.md) — useful for verifying citations.

## Tool author identity

| Where | Name |
|-------|------|
| XDA | **SYXZ** (https://xdaforums.com/m/12774241/) |
| Coolapk (CN) | **某贼** ("Some Thief") |
| Telegram / Chinese forums | various aliases |

SYXZ is also the in-thread maintainer who patches bugs based on user reports.

## Toolbox version history (from RM11 OP, condensed)

| Version | Notable changes |
|---------|-----------------|
| 1.2.0 | Initial public release. RM11 Pro only. **Broke fingerprint calibration** on unlock. |
| 1.2.1-beta3 | Integrated "No-BL Root" (KernelSU path). Added retroactive **fingerprint recovery** — initially required data wipe but later tests said no wipe needed. |
| 1.2.2 | **Z80 Ultra support** added. Experimental — RM11 owners advised to stay on 1.2.1. |
| **1.2.3** | **First RM10 Pro / Pro+ support** (also Z70 Ultra, Pad 3 Pro, RM11 Air). |
| **1.2.4 Beta** | Bug fixes over 1.2.3. Long the recommended RM10 build. |
| 1.2.6 | English-language build. Superseded — implicated in **corrupted backups** [RM11 #2471 p124]. |
| 1.2.7.7 | CN stable, marked stable May 22 [RM11 #2135 p107 dev-reverse]. |
| **1.2.8-beta2** ⭐ | The build the thread converged on, in a **working** English translation by dev-reverse that preserves the CN back end [RM11 #2685 p135]. Unlocks hardware the earlier builds refuse — including the **RM11S Pro** on shipping `11.5.5_GB` firmware [RM11 #2714 p136, #3019 p151]. |
| 1.2.8-beta4 | Adds the Xiaomi / Redmi / OPPO / vivo expansion wave. **Does not support the Red Magic Pad 5 Pro** [RM11 #2922 p147], and reported failing where beta2 succeeds [RM11 #3034 p152]. Not a straight upgrade. |

Direct downloads for the linkable versions are on the [ZTE Family Toolbox page](/rm10pro/zte-family-toolbox#download); the translated builds live in the dedicated [Translated ZTE Family Toolbox thread](https://xdaforums.com/t/translated-zte-family-toolbox.4789388/).

## Firmware compatibility matrix (RM11 Pro)

The clearest statement of where the exploit stands, from dev-reverse [RM11 #2788, #2807 p140–141]:

| Firmware | Unlock | Option 18 (fingerprint / no boot warning) |
|----------|--------|--------------------------------------------|
| `11.0.18MR1_GB` | ✅ | ✅ last fully-working Global build |
| `11.0.18(MR1)_EA` | ✅ | ✅ |
| `11.0.23_CN` | ✅ | ✅ |
| `11.0.19MR2_GB` / `.19_EA`+ | ✅ | ⚠️ **GBL exploit patched** [RM11 #2763 p139] — restored by the swap below |
| `11.0.20_GB`, `11.5.5`, `11.5.6MR1` | ✅ | ✅ **after flashing pre-patch `abl` + `efisp`** [RM11 #3,055 p153, #3,069 p154, #3,190 p160] |

Two adjacent data points: the **11S Pro** unlocks and roots on `11.5.5_GB` with 1.2.8-beta2, fingerprint included [RM11 #3031 p152]; and on the **Z80 Ultra**, `.16` works fully, `.20` breaks the efisp fix, `.27` blocks unlock and root but leaves firehose alive — *and does not blow the efuse* [RM11 #2476 p124 5t0l3n].

Since August 2026 the bottom rows are no longer a dead end: flashing a **pre-patch `abl` + `efisp`** from `11.0.16MR3_GB` (RM11) or MyOS `16.0.16` (Z80) restores the exploit on any firmware and region, after which Option 18 behaves as it did on `.18 MR1` [RM11 #3,055 p153 Elivizon299]. The full procedure and its caveats — including why it **cannot** be copied onto an RM10 Pro — are on the RM10 page: [the abl + efisp downgrade](/rm10pro/bootloader-unlock-status#abl-efisp-downgrade).

**RM11 Pro can run 11S Pro firmware.** borygo77's `11Pro_11.5.6MR1GB.7z` EDL package bundles a KernelSU-3.3.0 `init_boot`, a vulnerable `abl` and a patched `eFisp`, flashes over anything lower including `11.0.12`, and needs no data wipe [RM11 #3,078 p154, #3,083 p155]; several users confirmed it in-thread [RM11 #3,099 p155 kcodya, #3,131 p157 christopherrrg]. RAM is unaffected by the firmware swap, storage geometry is not — see [storage reported as 512 GB](/rm10pro/known-issues#storage-halved). The 11S clock bump does **not** carry over to an NX809J [RM11 #3,119 p156].

For the RM10 Pro there is **no equivalent matrix** — see [RM10 KB → Which firmware can still be unlocked?](/rm10pro/bootloader-unlock-status#firmware-compatibility).

## Companion exploits referenced from RM11 OP

These aren't part of the toolbox but the RM11 OP links them as alternatives or complements:

### 1. "Holy Grail" Universal No-BL Root for Qualcomm
- **Thread:** https://xdaforums.com/t/the-holy-grail-universal-no-bl-root-for-qualcomm-devices-bypass-locked-bootloaders.4782827/
- Requires the device to allow **SELinux Permissive** mode.
- Not a permanent unlock — flashing system partitions or other ROMs **will brick** because the bootloader is still locked.
- Useful when full unlock isn't available or you want to keep TEE/Widevine/Play Integrity intact.

### 2. RM11 Pro No-BL Root via EDL — `gbl_root_canoe`
- **Repo:** https://github.com/superturtlee/gbl_root_canoe
- Disables the vendor boot-rejection mechanism so you can flash and boot custom systems **without** unlocking the bootloader.
- **Zero compromises**: no yellow boot text, Play Integrity / SafetyNet / Widevine L1 preserved.
- Includes retroactive fingerprint restoration for users who broke it with the old unlock.
- Catch: BL stays locked → you can only flash via **EDL (9008)** mode, not fastboot.
- **Same logical approach as [BD_Security's RM10 EDL root](/rm10pro/bd-security-edl-root)**, just polished and packaged. If you want to port to RM10 Pro, this repo is the obvious reference codebase to study; the same vbmeta-flag + init_boot-patch pattern likely applies, but partition addresses and slot semantics need to be re-derived from a current RM10 Pro GPT dump.

### 3. Xiaomi 8 Elite (SM8750) offline unlock
- **Thread:** https://xdaforums.com/t/guide-breakthrough-free-offline-bootloader-unlock-for-cn-xiaomi15-pro-ultra-redmi-k90-sd-8-elite-no-cn-exam-required.4786790/
- Independent project. Same Snapdragon platform as RM10 Pro.
- Cutoff: **January 2026 patch or older only** (Redmi K90 Feb might work).
- If you're past Feb 2026 you have to physically take the phone to a service center to downgrade firmware — software downgrade not feasible.

### 4. `efisp` "modes" — boot unlocked while presenting as locked
- **Driver:** SnowFuhrer, with the modded `efisp` open-sourced as [`superturtlee/gbl_root_canoe`](https://github.com/superturtlee/gbl_root_canoe).
- Writes a custom `efisp` partition so the ABL reports **locked** while the device boots unsigned/unlocked — sidestepping the `ztecfg`/RSA signing problem entirely. **mode 2** keeps stock attestation, so Google Wallet / Play Integrity still pass [RM11 #2150–#2151 p108]; **mode 3** is for custom ROMs that fail attestation [RM11 #2199 p110].
- Tooling: SnowFuhrer's [`edl-ng`](https://github.com/SnowFuhrer/edl-ng) EDL client [RM11 #1954 p98]; payloads shared in-thread [RM11 #2202 p111].
- Portable to the RM10 Pro in principle (shared `efisp`/ABL). Full write-up: [RM10 KB → Reverse engineering → efisp modes](/rm10pro/reverse-engineering#efisp-modes).

## Custom recoveries and ROMs (RM11 Pro)

The RM11 side went from "no recovery" to a small ecosystem over June–July 2026. Relevant to RM10 owners mostly as **reference implementations** — the RM11 OrangeFox work was itself forked from the RM10 tree, so the debt runs both ways.

| Project | Where | Notes |
|---------|-------|-------|
| **OrangeFox** (RM11) | [Coding-BR/rm11pro-canoe-dock](https://github.com/Coding-BR/rm11pro-canoe-dock) | n00b-xda-disciple's build, with GitHub Actions CI so it can be forked and rebuilt [RM11 #2575, #2605 p129–131]. Prebuilt ZIP under `releases/recovery/orangefox/d2n-baseline/`. |
| **TWRP 3.7.1-16** (RM11) | [thread 4791689](https://xdaforums.com/t/recovery-16-unofficial-twrp-3-7-1-16-for-red-magic-11-pro-nx809j-stable.4791689/) · [Coding-BR/android_device_zte_sm88XX-twrp](https://github.com/Coding-BR/android_device_zte_sm88XX-twrp) | Backup works, **restore is broken**, GSI install doesn't work [RM11 #2771 p139]. |
| **LineageOS 23.2** (Android 16) | [thread 4791285](https://xdaforums.com/t/rom-nx809j-unofficial-lineageos-23-2-alpha-09-06-2026.4791285/) | IronSingh's unofficial alpha on the stock kernel; ~3 months of work, DT2W and fingerprint were the open items at release, and the build is **userdebug so not secure** [RM11 #2492–2517 p125–126]. |
| **Canoe Dock guide** | [thread 4787673](https://xdaforums.com/t/redmagic-11-pro-nx809j-canoe-dock-unlock-root-kernelsu-anykernel3-gsi-recovery.4787673/) | n00b-xda-disciple's unlock / root / KernelSU / GSI / recovery walkthrough. |
| **REDMAX** module | [kencalx/REDMAX-11](https://github.com/kencalx/REDMAX-11) | Root module re-enabling hardware/software features RedMagic OS disables [RM11 #2592, #2631 p130–132]. |

Installing any of these needs a **genuinely** unlocked bootloader — an Option 18 GBL spoof isn't enough; the recovery will flash and run but the system stops booting [RM11 #2520 p126].

## Linux on the device — Droidspaces

A large and fast-moving side thread, listed here because it's where much of the RM11 energy went and because none of it requires a custom ROM.

- **[ravindu644/Droidspaces-OSS](https://github.com/ravindu644/Droidspaces-OSS)** — LXC-like container runtime running full Linux distributions natively, with real init systems (systemd, OpenRC), no chroot and no Termux/proot layers [RM11 #2419 p121].
- **[Droidspaces/recovery-console](https://github.com/Droidspaces/recovery-console)** — DRM/framebuffer terminal that can run *as* the recovery from ramdisk, i.e. Linux before Android [RM11 #2419 p121].
- Requires a **SUSFS-patched kernel** — the stock kernel is unsupported [RM11 #2422, #2430 p122]. The WildKernels OnePlus 15 `android16-6.12.23` builds work, and Coding-BR ships an NX809J-tested fork plus a Droidspaces daemon KernelSU module [RM11 #2484 p125].
- Progress reported: Adreno 840 with dma-buf, Wayland commits, GBM dma-buf import into Android Vulkan, gamescope [RM11 #2615 p131, #2621 p132]. Qualcomm's own [prebuilt Adreno UMD Linux driver with Vulkan 1.4](https://qartifactory-edge.qualcomm.com/ui/native/qsc_releases/software/chip/component/gfx-adreno.linux.1.0/251009/prebuilt_debian/qcom-adreno-0.1_arm64.deb) is the key piece, and needed heavy patching plus a DRI3 patch for Wayland [RM11 #2622 p132].
- Reality check: SteamOS proper is off the table — it would need to boot before Android and requires the full kernel and drivers [RM11 #2866 p144].

## Reverse-engineered kernel & the GPLv2 dispute

ZTE's published RM11 Pro (NX809J) kernel source is **incomplete / unbuildable**. **dev-reverse** reverse-engineered a **bootable** tree anyway (AI-assisted; **n00b-xda-disciple** fixed the touchscreen) — repo [`Coding-BR/android_kernel_nubia_sm8850_qwjujube`](https://github.com/Coding-BR/android_kernel_nubia_sm8850_qwjujube) (flash to RAM only). A dedicated [GPLv2-violation escalation thread](https://xdaforums.com/t/discussion-gplv2-violation-redmagic-11-pro-nx809j-incomplete-unbuildable-kernel-sources.4790008/) was opened [RM11 #2235 p112]. The RM11 Pro shares a kernel family with the RM10 Pro, so this work carries over — see [RM10 KB → Kernel source → GPLv2 dispute](/rm10pro/kernel-source#gplv2-kernel).

## EliteBlackKaiser's mega-guide

The RM11 thread points to a community-compiled Google Doc:
**https://docs.google.com/document/d/1edvk-bYhubS_9qEMBXG9DpEJ4mKzmBUm8Qe9butINL4/edit**

Maintained by [EliteBlackKaiser](https://xdaforums.com/m/12496803/) for RM11 Pro but logic mostly ports to RM10 Pro (same toolbox, same exploit shape). Useful for fingerprint-fix and other post-unlock issue details.

## CN OTA versions to fear (fuse candidates)

From AdaUnlocked's posts in the RM11 thread:
- **RedMagic 11.0.23** (RM11 CN) — fuse status unknown but flagged as suspicious; freeze updater.
- **AIOS 2.0.26** (Z80 Ultra CN) — confirmed forced-silent in CN region. Same OEM (ZTE/Nubia), same playbook expected for RM10.

If you see a RM10 Pro OTA whose changelog is suspiciously generic ("performance and security improvements") and you can't find third-party confirmation of pre/post-unlock testing on that build, **wait**.

As of **late July 2026** the thread's read is unchanged: **no device has actually been fuse-locked yet** [RM11 #2921 p147 AdaUnlocked, #2838 p142 dev-reverse] — the warnings are pre-emptive. What *has* arrived is ordinary software patching, and AdaUnlocked's Jul 2 bump makes the distinction: *"Manufacturers have already started patching the exploits in the latest updates, and hardware fuses (destructive fusing) are on the horizon"* [RM11 #2808 p141]. Also flagged there: the **Red Magic Pad 5 Pro is not supported** and must not be fed the phones' low-version `abl` — it will refuse to boot [RM11 #2922 p147].

That's not a reason to relax: the cost of catching the first fusing OTA is permanent. Treat a successful Option-4 backup as your canary [RM11 #2226 p112]. See [RM10 KB → what updating actually costs](/rm10pro/known-issues#what-updating-costs) for the mechanism.

## Z80 Ultra side-channel — relevant context only

The Z80 Ultra is the first non-RedMagic ZTE device that the toolbox supports. Path differs because not all SM8850 phones expose authorized EDL (9008) — some require **desoldering the flash chip and writing the `efisp` partition with an external programmer**. RM10 Pro / RM11 Pro retain authorized EDL, so this hardware path is not required for our devices. Good to know for sanity-checking claims about other phones in the family.

## Why "no yellow text" matters

The old unlock tool left a yellow "Your device is unlocked" warning on every boot. The newer toolbox versions (1.2.1+) eliminate it. Mechanism is not documented in-thread but it implies modifying an additional partition (likely vbmeta-system or a UI resource consumed by `xbl_ui` / `splash`). This is purely cosmetic — if you don't care, an old unlock tool works fine; if you do, upgrade.

## Quick mapping: "if you read X in the RM10 KB, go to Y in this thread for more"

| RM10 KB topic | Where to look in RM11 thread |
|---------------|------------------------------|
| Toolbox usage, fingerprint fix | OP (#1) + EliteBlackKaiser doc |
| No-BL root via EDL | OP (#1) section 4 + `gbl_root_canoe` repo |
| Universal no-BL root | "Holy Grail" thread linked from OP |
| Fuse warning details | OP (#1) + AdaUnlocked update posts; status at [RM11 #2347 p118] |
| Toolbox version chronology | OP (#1) — all version notes in one place |
| `efisp` modes 2/3 (keep attestation) | SnowFuhrer posts ~p108–111; `gbl_root_canoe` |
| Compilable kernel / GPLv2 | dev-reverse posts ~p92–116, the GPL audit at #2367 p119, + GPLv2 escalation thread |
| Toolbox option numbers (18/19 especially) | dev-reverse's summary at #2807 p141 |
| Custom recovery, LineageOS, Droidspaces | n00b-xda-disciple & IronSingh posts ~p125–146 |
| Windows-side toolbox failures | scattered p120–150; consolidated in [RM10 KB → Windows gotchas](/rm10pro/zte-family-toolbox#windows-gotchas) |

## A note on getting help in-thread

Two things changed the support dynamics in July 2026 and are worth knowing before you plan around in-thread assistance:

- **dev-reverse stepped back.** After a moderator warning over repeated off-site social-media links, he announced he would no longer offer help through XDA [RM11 #2912–2915 p146]. He had been by far the highest-volume responder. Much of the practical support migrated to off-site chat, which XDA rules keep out of the thread — so the thread now has more unanswered questions than its history would suggest.
- **Links get edited out.** Several posts carry `{Mod edit: Reference to Telegram removed!}`, meaning some cited posts no longer contain the resource they're cited for. If a citation here points at a post that looks truncated, that's why.
