# RM11 Pro thread — cross-reference notes for RM10 Pro

The [Red Magic 11 Pro free-unlock guide](https://xdaforums.com/t/red-magic-11-pro-guide-bootloader-unlock-free-also-support-rm10-pad3pro-z70u-z80u-unlock-zte-family-toolbox.4780930/) is the canonical home of the **ZTE Family Toolbox**. The toolbox was originally RM11-only and incrementally grew RM10/Pro+, Pad 3 Pro, Z70U, Z80U support. Some details there are only stated in this thread.

Raw extract (2,362 posts, 119 pages) is in the repo at [`data/rm11pro-unlock.md`](https://github.com/mKonic/redmagic-wiki/blob/main/data/rm11pro-unlock.md) — useful for verifying citations.

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
| 1.2.6 | **English-language build** — the current recommendation for non-CN readers [RM11 #2317 p116]. |
| **1.2.7.7** ⭐ | Current stable (CN), marked stable May 22 [RM11 #2135 p107 dev-reverse]; what RM10 Pro owners are now pointed to [RM11 #2317 p116]. |

Direct downloads for the linkable versions are on the [ZTE Family Toolbox page](/rm10pro/zte-family-toolbox#download).

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

As of May 31, 2026, the thread's read is that **no device has actually been fuse-locked yet** [RM11 #2347 p118 dev-reverse] — the warnings are pre-emptive. That's not a reason to relax: the cost of catching the first fusing OTA is permanent. Treat a successful Option-4 backup as your canary [RM11 #2226 p112].

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
| Compilable kernel / GPLv2 | dev-reverse posts ~p92–116 + GPLv2 escalation thread |
