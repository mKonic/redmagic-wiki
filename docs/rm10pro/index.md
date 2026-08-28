# Red Magic 10 Pro (NX789J)

Modding knowledge base for the Red Magic 10 Pro, codename **NX789J** (Global) / **NX789S** (China overclocked variant — same kernel, different config). Snapdragon 8 Elite (SM8750) platform.

:::warning Don't update — and keep your current bootloader images
Freeze the system updater before doing anything else. Newer firmware **patches the exploits the unlock depends on** — confirmed, and already shipping — and destructive hardware fusing remains the longer-term threat. Crucially, an update doesn't relock your bootloader; it takes away **EDL**, which is the only write path these phones have.

On the RM11 family that patch turned out to be [reversible by flashing pre-patch `abl` + `efisp` back](./bootloader-unlock-status#abl-efisp-downgrade), which makes your **current, un-patched partition images worth saving right now** — see [keeping your pre-patch images](./known-issues#keep-prepatch-images). No such method exists for the RM10 Pro yet, so the advice here is unchanged: stay put, and take a copy while you can.

See [Known issues — the fusing threat](./known-issues#the-fusing-threat-read-first) and [what updating actually costs](./known-issues#what-updating-costs).
:::

## Quick links

### Just bought the phone / haven't unlocked yet
1. [Overview](./overview) — variants, versions, what works
2. [Bootloader unlock status](./bootloader-unlock-status) — current procedure, history
3. [ZTE Family Toolbox](./zte-family-toolbox) — the canonical unlock tool

### Already unlocked, want root
1. [Root with Magisk / KernelSU](./root-magisk) — five paths depending on your setup
2. [Partitions, AVB, vbmeta](./partitions-avb) — what's safe to modify
3. [Play Integrity & attestation](./play-integrity-attestation) — keeping (or repairing) Wallet and banking apps

### Bricked, need to recover
1. [EDL / 9008 mode](./edl-9008) — entry methods, drivers, tools
2. [BD_Security's EDL root guide](./bd-security-edl-root) — recovery procedure with code

### Going deeper
1. [Kernel source](./kernel-source) — building from NX789S sources
2. [Reverse engineering](./reverse-engineering) — abl_eng / ztecfg / RSA signing
3. [Custom recovery](./recovery-twrp) — OrangeFox (decryption working) and Reminon's TWRP tree

### Want to keep BL locked
- [GhostLock](./ghostlock-temp-root) — temporary root on stock firmware, nothing flashed
- [Root with locked BL](./root-magisk#path-c--locked-bootloader-root-via-edl) — EDL-flash patched init_boot + vbmeta
- [De-Googling without root](./degoogling-no-root) — what you can do on stock

### Reference
- [Known issues & bricks](./known-issues)
- [Contributors](./contributors)
