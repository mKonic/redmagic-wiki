# Custom recovery — TWRP / OrangeFox

## State of play

The RM10 Pro has **two** community recoveries, neither merged to mainline but both building and booting:

| Project | Author | Repo | Notes |
|---------|--------|------|-------|
| **OrangeFox** ⭐ | hyty (GitHub `plompomg`) | [plompomg/rm10pro-orangefox-recovery](https://github.com/plompomg/rm10pro-orangefox-recovery) | Boots, and **decryption works** [#682 p35]. Forked from Reminon's TWRP tree after OFRP turned out to use TWRP as its base [#684 p35]. |
| **TWRP** | Reminon | [reminon/twrp_device_nubia_nx789j](https://github.com/reminon/twrp_device_nubia_nx789j) | The original port; touch, fan, backup/restore working. Still the reference device tree. |

This supersedes the older "no working custom recovery exists" position that a lot of the thread's brick advice was written around — see [Known issues](/rm10pro/known-issues) for what that changes and what it doesn't.

### OrangeFox (hyty / plompomg) {#orangefox}

Announced Jun 5 2026 [#679 p34], repo published Jun 6 [#686 p35]. What's confirmed:

- **Boots** — author's own testing only at announcement; he explicitly asked for more rigorous third-party testing [#679 p34].
- **Decryption works** — confirmed directly when dev-reverse asked [#680, #682 p35]. This is the part Reminon's earlier OFRP attempts couldn't get past, and it's why the RM11 Pro side immediately tried to fork it [RM11 #2417 p121].
- Built by forking Reminon's TWRP device tree rather than starting fresh [#684 p35].
- hyty is waiting on **OrangeFox 15.1** for "native" support so the tree builds unmodified [#685 p35].

:::tip Cross-device value
The RM11 Pro community forked this work almost immediately — dev-reverse asked for it to be ported to the NX809J [RM11 #2417 p121], and n00b-xda-disciple's RM11 OrangeFox build ([Coding-BR/rm11pro-canoe-dock](https://github.com/Coding-BR/rm11pro-canoe-dock)) followed [RM11 #2605 p131]. If you're debugging the RM10 build, the RM11 repos are worth reading — they're a generation ahead on CI and packaging.
:::

The recovery is **not** advertised on the XDA device forum; dev-reverse pushed hyty to submit it to [twrp.me/contactus](https://twrp.me/contactus/) and open a dedicated thread in [the Nubia / Red Magic forum](https://xdaforums.com/c/nubia-red-magic.7925/) because nobody was finding it [#689 p35]. As of the latest thread activity that hadn't happened, so the GitHub repo is the only distribution point.

### TWRP (Reminon)

Status [#481 p25 Reminon · Mar 2026]:
- Builds and boots
- Touch works (after a `/data/vendor` overlay fix, see below)
- Fan controls work (finicky)
- Backup / restore works
- ADB and fastboot inside TWRP work

The repo was bootstrapped from https://github.com/YuKongA/twrp_device_xiaomi_sm8750_thales (Xiaomi SM8750 device with the same SoC) — Xiaomi-specific code was stripped, then crypto, touch, and fan were rebuilt.

## The touch-driver chicken-and-egg

Touch firmware and config on RM10 Pro load from **`/data/vendor`**, which is FBE-encrypted before TWRP can decrypt. Reminon's fix: add the directory structure into the recovery ramdisk as an **overlay**, so the touch driver finds its files before /data is even mounted [#481 p25].

## Earlier attempts

- Hovatek auto-builder: TWRP + OFRP would build but not work; HW navigation (`Vol+Vol−Pwr`) was wonky in OFRP [#279 p14 Reminon].
- Self-generated device trees: would not produce a `recovery.img` [#279 p14].
- Adapted DarkestSpawn's RM9 Pro device tree: with FBE + other encryption flags disabled, OFRP boots; ADB and fastboot work; HW navigation works; touch doesn't; finds all partitions but can't mount [#279 p14] — superseded by Reminon's repo.

## Recovery + slot interaction

> *"If the stock recovery is present, then the fastboot in bootloader mode doesn't allow me to switch slots or flash partitions that I've tried. It forces me to use fastbootd in the stock recovery. If I have a custom recovery installed, then the fastboot in bootloader mode seems to have full functionality."* [#257 p13 Reminon]

So installing custom recovery (even just to one slot) restores full `fastboot flash` capability from regular bootloader mode.

## Build notes

- Source tree was Xiaomi-based (SM8750). Removing Xiaomi-specific Mi/MIUI bits takes a few days.
- Reminon notes heavy reliance on Claude for build errors and getting touch working [#481 p25] — meaning the device tree is well-documented internally but expects familiarity with AOSP recovery build conventions.
- Needs the standard AOSP build environment plus `repo`, the right manifest, and Twrp-minimal sources.

## What's missing / WIP

- OTA-from-TWRP not validated end-to-end
- Some partition mounts still flaky (Reminon's note about not being able to mount partitions even after detecting them in his earlier OFRP attempt)
- Encryption: FBE disabled is the easy path on the TWRP tree; the OrangeFox fork reports **working decryption** [#682 p35], which is the main reason to prefer it
- **Backup/restore asymmetry** — on the parallel RM11 Pro port, dev-reverse found TWRP takes a full backup fine but **fails on restore**, and GSI installs from within it don't work either [RM11 #2771 p139]. Nobody has published a matching restore test on the RM10 build, so don't treat a recovery-side backup as your only copy — keep the toolbox Option 4 EDL dump.

## Installing a recovery

You need a **genuinely** unlocked bootloader — an `efisp`/GBL spoof (toolbox Option 18) is not enough. On the RM11 side someone installed a recovery over the GBL-root exploit: the recovery itself flashed and ran, but **the system would no longer boot** [RM11 #2520 p126 dev-reverse]. Same architecture, so assume the same on RM10.

Two ways in, depending on whether you have fastboot:

- **Without fastboot** (stock `abl user`) — flash the recovery image with **toolbox Option 12** (flash any partition) to `recovery_a` *and* `recovery_b`. This is an A/B device; flashing one slot only leaves you half-migrated [RM11 #2397 p120].
- **With fastboot** (`abl userdebug`, see [ZTE Family Toolbox → ABL userdebug](/rm10pro/zte-family-toolbox#abl-userdebug)) — normal `fastboot flash recovery_a` / `recovery_b`.

:::warning Recovery vs fingerprint — pick one
On the RM11 Pro, dev-reverse states flatly that if you run **TWRP or `abl userdebug`, the fingerprint fix cannot be applied** [RM11 #2629 p132] — Option 19 has to clear the `efisp` exploit patch before either will work, and clearing it is exactly what undoes the fingerprint fix [RM11 #2807 p141]. So on current firmware it's custom recovery **or** a working fingerprint reader, not both.
:::

:::tip You may not need one
n00b-xda-disciple's take after shipping an RM11 build: *"To be honest people don't need a custom recovery or eng_abl. You are fine without both. We have EDL flashing… If you don't mind using Toolbox/EDL, trying to get TWRP would be redundant. Especially if you're trying to keep integrity and fingerprint."* [RM11 #2638 p132]
:::

## Why bother with custom recovery if EDL works?

EDL flashing is reliable but cumbersome — every change to `init_boot` / `vbmeta` requires the volume-button dance and a Python script. Custom recovery makes routine work (Magisk updates, kernel swaps, ROM-zip installs) one-step. Pairs well with [the kernel build workflow](/rm10pro/kernel-source) for iterating on kernel changes.
