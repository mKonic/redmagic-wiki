# Red Magic 10 Pro (NX789J)

Modding knowledge base for the Red Magic 10 Pro, codename **NX789J** (Global) / **NX789S** (China overclocked variant — same kernel, different config). Snapdragon 8 Elite (SM8750) platform.

:::warning Don't update
ZTE is rolling out **irreversible hardware-fuse updates** that permanently lock unlock-capable devices. Freeze the system updater before doing anything else. See [Known issues — the fusing threat](./known-issues#the-fusing-threat-read-first).
:::

## Quick links

### Just bought the phone / haven't unlocked yet
1. [Overview](./overview) — variants, versions, what works
2. [Bootloader unlock status](./bootloader-unlock-status) — current procedure, history
3. [ZTE Family Toolbox](./zte-family-toolbox) — the canonical unlock tool

### Already unlocked, want root
1. [Root with Magisk / KernelSU](./root-magisk) — four paths depending on your setup
2. [Partitions, AVB, vbmeta](./partitions-avb) — what's safe to modify

### Bricked, need to recover
1. [EDL / 9008 mode](./edl-9008) — entry methods, drivers, tools
2. [BD_Security's EDL root guide](./bd-security-edl-root) — recovery procedure with code

### Going deeper
1. [Kernel source](./kernel-source) — building from NX789S sources
2. [Reverse engineering](./reverse-engineering) — abl_eng / ztecfg / RSA signing
3. [Custom recovery (TWRP)](./recovery-twrp) — Reminon's WIP device tree

### Want to keep BL locked
- [De-Googling without root](./degoogling-no-root) — what you can do on stock
- [Root with locked BL](./root-magisk#path-c--locked-bootloader-root-via-edl) — EDL-flash patched init_boot + vbmeta

### Reference
- [Known issues & bricks](./known-issues)
- [Contributors](./contributors)
