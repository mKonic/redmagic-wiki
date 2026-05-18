# RM10 Pro — Overview

## The device

**Nubia Red Magic 10 Pro** — Qualcomm Snapdragon 8 Elite (SM8750) gaming phone. The codename used in firmware and the bootloader is **NX789J** (Global) or **NX789S** (China/overclocked variant). Both variants share the same kernel source tree with config selecting J vs S [#672 p34 MrKonic].

Sibling devices that share the unlock toolchain and exploit surface:
- Red Magic 10 Air — different unlock path (treated like RM9s by ROM2BOX) [#255 p13 Reminon]
- Red Magic 10 Pro+ — same SoC, same toolchain plans [#541 p28 AdaUnlocked]
- Red Magic 11 Pro — primary target of the ZTE Family Toolbox; unlocked first [RM11 thread]
- Nubia Pad 3 Pro, Z70U, Z80U — supported by current ZTE Family Toolbox builds [RM11 thread title]

## Variants and bootloader behavior

- **Global** ROM: ships with bootloader displaying "unknown" in CPU-Z; verify via `fastboot getvar unlocked` (look for `unlocked: yes/no`) or Developer Options → OEM unlocking (toggled on + greyed out = unlocked) [#216 p11 DarkestSpawn].
- **China (CN)** ROM: forced silent updates are aggressive — even with auto-update disabled the system updater can apply patches in the background [warning repeated across thread].

## Firmware version cadence (selected)

| Version | Notes |
|---------|-------|
| V10.0.8 | First public global ROM linked in OP [#5 p1 Ssmiles] |
| V10.0.9 | OP confirms downgrade not possible from this version [#12 p1 Ssmiles] |
| V10.0.13 | Asia/EEA ROM URL [#245 p13 extra98] |
| V10.0.14 | EEA ROM URL — Reminon spent days manually patching from this for root [#487 p25] |
| V10.0.18 NX789J GB | Build referenced by Enddo in May 2026 [#667 p34] |
| Android 16 update | Adds files in `/metadata/aconfig/maps/system.flag.map` that break permission controller when used as base for GSI/DSU on A15 [#279 p14 Reminon] |

## What works (as of May 2026)

| Goal | Method | Status |
|------|--------|--------|
| Bootloader unlock | ZTE Family Toolbox ≥1.2.3 (1.2.4 recommended, 1.2.6 latest as of May 2026) | Working for RM10 Pro |
| Root with locked bootloader | EDL-flash patched init_boot + patched vbmeta | Working — see [BD_Security's guide](/rm10pro/bd-security-edl-root) |
| Root with unlocked bootloader | Magisk init_boot patch via `dd` from system | Working [#589 p30 HammadYasin] |
| TWRP / OFRP custom recovery | Reminon's WIP device tree | Builds & boots, touch works, mount issues being chased [#481 p25] |
| Disable AVB / vbmeta via `fastboot flash` | Triggers bootloader loop, requires EDL restore | Don't do it [#315 p16 Reminon] |
| Cracking RSA used for `eng_abl` signing | Behind-the-scenes research | Not public — see [reverse engineering](/rm10pro/reverse-engineering) |

## Why everyone is in a hurry

:::danger Hardware fuse threat
ZTE is rolling out **irreversible hardware-fuse updates** that permanently disable unlock paths. Pattern across CN OEMs: silent updates blow SoC fuses, then no software method works. **Freeze the system updater app.** See [Known issues](/rm10pro/known-issues).
:::
