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
| May 22, 2026 | Toolbox **1.2.7.7** marked stable [RM11 #2135 p107 dev-reverse] |
| Late May 2026 | RM10 Pro unlock **confirmed in the wild** for multiple users; dev-reverse points RM10 owners at 1.2.7.7 or the English 1.2.6 build [RM11 #2317 p116] |
| May 30, 2026 | Grimish2280 publishes a **work-in-progress native-Linux (`bkerler/edl`) unlock writeup** for the NX789J — replicates the toolbox flow, but flagged "do not use yet" [#676 p34] |
| Jun 6, 2026 | **OrangeFox recovery for the RM10 Pro** published by hyty, with working decryption [#686 p35] — see [Custom recovery](/rm10pro/recovery-twrp) |
| Jun 19, 2026 | Toolbox **1.2.8-beta2** circulated; becomes the build that works where 1.2.4/1.2.6/1.2.7 fail [RM11 #2714 p136] |
| Jun 28, 2026 | **The GBL exploit is patched** in RM11's `.19 MR2` firmware [RM11 #2763 p139 dev-reverse] — unlock still possible on affected builds, but the fingerprint fix is not |
| Jul 22, 2026 | AdaUnlocked: *"THE BLOCKADE HAS ARRIVED"* — software patching confirmed across the family; destructive fuses still **not** observed blown [RM11 #2921 p147] |
| Jul 30, 2026 | **Red Magic 10S Pro** reported unlocked **and** rooted with a **working fingerprint reader** — first such report for the 10S [RM11 #2987 p150 -CNote-] |

## Which firmware can still be unlocked? {#firmware-compatibility}

This is the question that dominates the newer thread, and the honest answer for the RM10 Pro is **nobody has published a version matrix**. dev-reverse, July 13: *"There is no guide for the RedMagic 10, and if I were you, I'd be careful; you need to know which ROM is compatible with the RedMagic 10 unlock — it has to be an older version, as you can't unlock it using just any version"* [RM11 #2893 p145]. He is more pointed elsewhere: RM10 owners aren't posting their working ROM versions or sharing EDL backups the way the RM11 side does [#697 p35].

What *is* pinned down, on the sibling **RM11 Pro** (NX809J), and worth reading as the shape of the thing rather than as RM10 gospel [RM11 #2788, #2807 p140–141 dev-reverse]:

| Firmware | Unlock | Fingerprint fix (Option 18) |
|----------|--------|------------------------------|
| `11.0.18MR1_GB` | ✅ | ✅ — last fully-working Global build |
| `11.0.18(MR1)_EA` | ✅ | ✅ |
| `11.0.23_CN` | ✅ | ✅ |
| `11.0.19MR2_GB` / `.19_EA` and later | ✅ still possible | ❌ **GBL exploit patched** [RM11 #2763 p139] |

So on current firmware you can generally still unlock — what you lose is the exploit that restores the fingerprint reader and suppresses the boot warning.

:::tip Red Magic 10S Pro
The 10S Pro was an open question for months. On Jul 30 2026 **-CNote-** reported the full result on `RedMagicOS11.0.5MR_GB` — bootloader unlocked, rooted, **fingerprint fully functional** [RM11 #2987 p150] — and had earlier uploaded a complete 10S Pro (256/12) partition backup to [MEGA](https://mega.nz/folder/IgknWKDZ) for others to restore from [RM11 #2966 p149]. The exact option sequence was never written up, and dev-reverse's guess that the 10S lives under **Option 31** is explicitly hedged [RM11 #2779 p139]. Treat this as "confirmed possible, procedure undocumented".
:::

## Current procedure (free, via ZTE Family Toolbox 1.2.3+)

See [ZTE Family Toolbox](/rm10pro/zte-family-toolbox) for the full step-by-step. The high-level flow is:

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

The unlock requires that `ztecfg.img` be **resigned per-device** to permit `eng_abl` to accept `fastboot flashing unlock`. The signature uses an RSA-2048 key whose public component is embedded in the `abl_eng` binary, but the **signing key is held by ZTE** [#186, #189, #392]. The exploit chain found by the toolbox author bypasses this by another route (presumably an EDL/firehose path through `devprg.melf`-equivalent — same family of bypass as the BD_Security guide for *rooting* with locked bootloader). See [Reverse engineering](/rm10pro/reverse-engineering) for details.

## Known unlock-side gotchas

- Toolbox versions **before 1.2.3 do not support RM10 Pro** — they were RM11-only. Trying 1.2.1 results in "phone isn't supported" at the unlock step [#660 p33 Enddo].
- Build 10.0.18_NX789J_GB has reports of unlock stalling at "Backing up FRP / Failed to read partition table file" — currently no documented fix; may be a driver/version mismatch [#666 p34 Enddo].
- The toolbox is Chinese-language. Use the **1.2.8-beta2 English build** — earlier translations silently corrupt backups, see [ZTE Family Toolbox → Download](/rm10pro/zte-family-toolbox#download). (Earlier partial-English UI patch of v1.2.1 by Enddo at https://dl.surf/f/c9a51290 [#661 p34].)
- **The unlock survives updates; your ability to *use* it does not.** The reason "don't update" matters isn't that an OTA relocks the bootloader — it's that these devices have no working fastboot on stock firmware, so **EDL/firehose is the only write path**, and that's what gets patched. dev-reverse: *"You don't lose the unlock; you lose access to EDL mode"* [RM11 #2855 p143]; Haldi4803, bluntly: *"No more EDL. No more flashing anything, no ROMs, not even root exploit"* [RM11 #2858 p143]. See [ZTE Family Toolbox → abl userdebug](/rm10pro/zte-family-toolbox#abl-userdebug) for why fastboot isn't a fallback.
- **Relocking is not a clean reversal.** Restoring a pre-unlock backup and relocking still leaves Play Store uncertified unless you also restore the full ROM and recover certification first [RM11 #2848 p143]. Users who relocked to get Wallet working found it still broken afterwards [RM11 #2844 p143].

## Native-Linux method (`bkerler/edl`) — work in progress {#native-linux-unlock}

Everything above assumes the Windows toolbox. **Grimish2280** is reverse-engineering the same unlock into a reproducible **native-Linux** procedure for the NX789J using [`bkerler/edl`](https://github.com/bkerler/edl), for people who don't run Windows [#676 p34]. The shape of it:

- Extract `uefi_unlock.img` from **ZTE Family Toolbox v1.2.4** (`bin/res/NX789J/uefi_unlock.img`) — this is the payload the toolbox itself flashes.
- Patch `edlclient/Library/firehose.py` (~line 905) to add `Oem="ZTE"` to the `configure` command, or the firehose rejects the session (`Non-ZTE tool`) — see [EDL / 9008 mode](/rm10pro/edl-9008#linux-edl).
- Dump every partition first via `devprg.melf` (full read list in the post), then write the unlock payload.

:::warning Not validated yet
Grimish2280 ran the flow end-to-end but explicitly says **"Do NOT use this method yet"** — *"it had all the information that was in the ZTE tool but I missed some things… I have to get fixed before I can finish this up."* He's looking for feedback. Treat it as a research lead, not a procedure, until it's confirmed. The Windows toolbox remains the recommended path.
:::
