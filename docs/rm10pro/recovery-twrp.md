# Custom recovery — TWRP / OFRP (WIP)

## State of play (May 2026)

There is no merged-to-mainline TWRP for the RM10 Pro yet, but **Reminon** has a working device tree publicly available:

**Repo:** https://github.com/reminon/twrp_device_nubia_nx789j

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
- Encryption: FBE disabled is the easy path; supporting FBE-encrypted /data through TWRP is a project of its own

## Why bother with custom recovery if EDL works?

EDL flashing is reliable but cumbersome — every change to `init_boot` / `vbmeta` requires the volume-button dance and a Python script. Custom recovery makes routine work (Magisk updates, kernel swaps, ROM-zip installs) one-step. Pairs well with [the kernel build workflow](/rm10pro/kernel-source) for iterating on kernel changes.
