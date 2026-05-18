# Bootloader unlock — current status, history, and methods

## Timeline

| Date | Event |
|------|-------|
| Jan 2025 | Thread opens; OP Ssmiles hopes for an RM10-toolbox equivalent of `RM9-toolbox` [#8 p1] |
| Oct 2025 | Reverse-engineering of `abl_eng` RSA verification begins; ks75vl confirms RSA signature scheme [#186 p10] |
| Oct 2025 | hoahenry: ztecfg.img is per-device, edited from offset ~line 2000 onward; bound to UFS serial CRC32 [#189, #192 p10] |
| Dec 2025 | Reminon unlocked via ROM2BOX (paid). Service dumps incomplete ztecfg, then flashes rebuilt one; `fastboot flashing unlock` succeeds [#255 p13] |
| Feb 2026 | DarkestSpawn summary: ztecfg must be re-signed for eng_abl to accept `fastboot flashing unlock`; RSA algo not public [#392 p20] |
| Mar 2026 | Free unlock released for **RM11 Pro** via ZTE Family Toolbox; AdaUnlocked rallies RM10 community to spread word and *not update* [#477 p24] |
| Apr 2026 | SYXZ (toolbox author) begins private beta of free RM10 unlock for SM8750 platform via Coolapk [#541 p28] |
| Apr 25, 2026 | Xiaomi 15 / 8 Elite breakthrough lands; community optimistic RM10 is next [#545 p28] |
| Early May 2026 | ZTE Family Toolbox 1.2.3 → 1.2.4 — first **publicly working** RM10 Pro bootloader unlock |
| May 2, 2026 | First user reports of successful free unlock (`pipegrep` [#561 p29]) |
| May 14, 2026 | Toolbox 1.2.4-beta1 widely shared; bug fix release; procedure documented [#664–#666 p34] |

## Current procedure (free, via ZTE Family Toolbox 1.2.3+)

See [02-zte-family-toolbox.md](/rm10pro/zte-family-toolbox) for the full step-by-step. The high-level flow is:

1. Install Qualcomm 9008 USB driver on Windows.
2. Run the toolbox, select RM10 Pro device variant.
3. Back up partitions first.
4. Run the bootloader unlock task.
5. When prompted for "final fix", manually enter EDL: power-off the device, then **press both volume buttons (Vol+ and Vol−) simultaneously while plugging USB** [#659 p33 hoahenry] — `adb reboot edl` does not work because the device is in fastboot, not Android, at that point.
6. After unlock, `fastboot getvar unlocked` should return `yes`.

## Paid services (background, mostly historical)

- **ROM2BOX (R2B)** — paid service that does the unlock + provides "EDL ROM" for unbrick. Used by Reminon, others. Workflow: they read your `ztecfg`, rebuild and sign it, flash it, then run `fastboot flashing unlock` [#255 p13, #263 p14].
- **QLM** (also from R2B) — the underlying tool used to send loader, backup/restore partitions, but **cannot unlock RM10 Pro by itself** [#255 p13].
- **TSM** — claims to remove FRP; AdaUnlocked/GigaWrathWave flag possible scam [#514 p26].

These are no longer necessary now that the free toolbox supports the RM10 Pro, but you may still encounter their forks of `ztecfg`/`abl_eng` files online.

## Why it took so long

The unlock requires that `ztecfg.img` be **resigned per-device** to permit `eng_abl` to accept `fastboot flashing unlock`. The signature uses an RSA-2048 key whose public component is embedded in the `abl_eng` binary, but the **signing key is held by ZTE** [#186, #189, #392]. The exploit chain found by the toolbox author bypasses this by another route (presumably an EDL/firehose path through `devprg.melf`-equivalent — same family of bypass as the BD_Security guide for *rooting* with locked bootloader). See [10-reverse-engineering.md](/rm10pro/reverse-engineering) for details.

## Known unlock-side gotchas

- Toolbox versions **before 1.2.3 do not support RM10 Pro** — they were RM11-only. Trying 1.2.1 results in "phone isn't supported" at the unlock step [#660 p33 Enddo].
- Build 10.0.18_NX789J_GB has reports of unlock stalling at "Backing up FRP / Failed to read partition table file" — currently no documented fix; may be a driver/version mismatch [#666 p34 Enddo].
- The toolbox is Chinese-language. English translation work-in-progress at https://dl.surf/f/c9a51290 (Enddo) [#661 p34].
