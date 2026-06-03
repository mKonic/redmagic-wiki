# ZTE Family Toolbox (中兴家族工具箱)

Chinese-language toolbox by **[SYXZ](https://xdaforums.com/m/12774241/)** on XDA (handle **某贼** on Coolapk). Single-binary Windows tool that handles bootloader unlock, partition backup/restore, EDL operations, and no-BL root via KernelSU for the ZTE / Nubia family: Red Magic 10 Pro / 10 Pro+, Red Magic 11 Pro, Red Magic 11 Air, Nubia Z70 Ultra, Nubia Z80 Ultra, Red Magic Pad 3 Pro.

The toolbox is **free**. Anyone charging for it is scamming you.

## Download

These are the canonical Google Drive links curated by the RM11 thread OP. Mirror locally on first download — Google Drive links occasionally rotate.

| Version | What's in it | Link |
|---------|--------------|------|
| **v1.2.7.7** ⭐ (current stable) | Latest stable as of late May 2026 [RM11 #2135 p107 dev-reverse]. What RM10 Pro owners are now pointed to [RM11 #2317 p116]. CN-language. | Circulates via Coolapk / the [RM11 thread](https://xdaforums.com/t/red-magic-11-pro-guide-bootloader-unlock-free-also-support-rm10-pad3pro-z70u-z80u-unlock-zte-family-toolbox.4780930/) — no single canonical Drive mirror. Verify hash. |
| **v1.2.6 (English)** 🌐 | Full **English-language** build — the current recommendation if you can't read the CN UI [RM11 #2317 p116]. | [English ZTE Toolbox (Drive folder)](https://drive.google.com/drive/folders/1EnCdlPJP6y-fAjCguWYOugx905LeIZpn?usp=sharing) [RM11 #293 p15 jolly_roger_hook] |
| v1.2.4 Beta | Bug-fix release over 1.2.3. Long the recommended RM10 build; superseded by 1.2.7.7. **Its `bin/res/NX789J/uefi_unlock.img` is the payload the [native-Linux method](/rm10pro/bootloader-unlock-status#native-linux-unlock) extracts.** | [Download](https://drive.google.com/file/d/1DfpTdhVx4uGPiFJQh0Xw9wKP5BGwbpBP/view?usp=sharing) |
| v1.2.3 | First public release with RM10 Pro / Pro+, Nubia Z70 Ultra, Pad 3 Pro, RM11 Air support. Stable. | [Download](https://drive.google.com/file/d/1Al5P6cKVnfX3p02v8_-6ZLgxspdev-bN/view?usp=sharing) |
| v1.2.2 | RM11 Pro + Z80 Ultra. Some experimental code — RM11 owners were advised to stay on 1.2.1. **Does not support RM10 Pro.** | [Download](https://drive.google.com/file/d/16ZGMlXs_ii9sJa7GweGnjeTcXspnj8Ud/view?usp=sharing) |
| v1.2.0 (legacy) | First public RM11 Pro unlock. Breaks fingerprint calibration; superseded by 1.2.1+. | [Download](https://drive.google.com/file/d/1-QFxPHLRS0bvNg0-Go7V9ePVfqSR28Wr/view?usp=sharing) · [Spare (password 123456)](https://drive.google.com/file/d/1SPwHjzyxrNxgmVhrKEyi1i9mD-eaLdvR/view?usp=sharing) |
| English UI (legacy) | Partial English translation of v1.2.1 by Enddo. Superseded by the full English 1.2.6 above. | [dl.surf](https://dl.surf/f/c9a51290) |

:::tip Pick the right version
**For Red Magic 10 Pro / Pro+ owners:** use **v1.2.7.7** (current stable), or **v1.2.6** if you want the English UI [RM11 #2317 p116 dev-reverse]. Versions ≤ 1.2.2 will reject your device at "device not supported" [#660 p33 Enddo]; 1.2.3 was the first to enable RM10-series unlock.
:::

:::warning Watch for new mirrors
The original CN community post for this tool was deleted within an hour of publication (per the author's reports). The newest releases circulate primarily on Chinese-language community forums (Coolapk) and the RM11 XDA thread, and aren't always mirrored to Google Drive. Verify SHA256 against community-reported hashes when downloading from third-party mirrors.
:::

## Prerequisites

- Windows PC (toolbox is Win-only; Linux/Mac users have to either run a Win VM or use the bkerler/edl tool for the underlying EDL operations).
- Qualcomm USB driver for 9008 mode — `Qualcomm USB Driver v1.0.10065.1` linked from the OP [#5 p1 Ssmiles] at https://transfert.free.fr/DUbB8Nh. Without it, Windows enumerates the device as "Unknown" in 9008 mode.
- MS VC++ redistributable (x64 *and* ARM64) — `pipegrep` confirms required [#561 p29]:
  - x64: https://aka.ms/vs/17/release/vc_redist.x64.exe
  - ARM64: https://aka.ms/vs/17/release/vc_redist.arm64.exe
- Latest adb/fastboot (use https://github.com/fawazahmed0/Latest-adb-fastboot-installer-for-windows or platform-tools).

## Procedure — bootloader unlock

Reconstructed from hoahenry [#659 p33] and Enddo's logs [#666 p34]:

1. **Connect phone with USB debugging enabled.** Toolbox checks adb connection, reads `设备代号` (device codename = NX789J), Android version, current slot.
2. **Toolbox reboots phone to 9008.** It checks for the 9008-mode COM port (e.g. COM10).
3. **Toolbox uploads bootloader payload** (`发送引导`).
4. **Toolbox backs up FRP** (`备份frp`) — this is where 10.0.18_NX789J_GB users have reported stalls (`Failed to read partition table file`) [#666 p34 Enddo].
5. Toolbox proceeds through unlock; confirms bootloader unlock and device status.
6. **Manual EDL re-entry for the final fix step.** The phone is now in fastboot, so `adb reboot edl` won't work. Method that works [#659 p33]:
   - Hold power until device powers off and restarts itself.
   - Then immediately press **Vol+ and Vol−** simultaneously to enter 9008/EDL.
7. Toolbox completes the last fix.
8. Verify: `fastboot getvar unlocked` → `unlocked: yes`.

## Procedure — root with KernelSU (no-BL)

Toolbox also supports rooting without unlocked bootloader using KernelSU patched into init_boot — same idea as [BD_Security's EDL guide](/rm10pro/bd-security-edl-root), but automated. Users report success: `pipegrep` got "phone is unlocked, magisk installed and happiness achieved" via this path [#561 p29].

## Known toolbox issues

- **Wrong version error**: "Yo your using the wrong toolbox version. that one is for the 11 PRO. Try the newest one." — toolbox UI lets you pick "RM10 Pro" but version <1.2.3 still rejects [#662 p34].
- **Stuck on "Backing up FRP"** for ~5 minutes then "Failed to read partition table file. Press any key to retry" on build 10.0.18_NX789J_GB. Driver/version mismatch suspected — not resolved as of mid-May 2026 [#666–#667 p34].
- The toolbox uses Chinese terminal output by default. Copy-and-translate workflow (Google Translate / DeepL) is what people rely on.

## Critical warnings

:::warning Don't update
**DO NOT update your phone** between unlock attempts. ZTE has been rolling fuse-blowing updates to permanently kill unlock paths on the SM8750 platform [#541, #545, #573]. Freeze the system updater app. As of May 31, 2026 **no one has reported an actual real-world fuse blowout yet** [RM11 #2347 p118 dev-reverse] — but that's expected to change with the RM11s "overclock" variant, and the cost of being wrong is a permanently locked SoC. See [Known issues → fusing threat](/rm10pro/known-issues#the-fusing-threat-read-first).
:::

:::tip Always back up first (Option 4)
Before you unlock, run the toolbox's **Option 4 (Back All / BAKALL)** in 9008 mode to dump every partition — and again after unlocking. A no-backup brick is currently **unrecoverable** (no custom recovery exists yet). SnowFuhrer's rule of thumb: a fused device would *fail* the backup step, so a successful backup is also a sign you're not fused [RM11 #2226 p112]. **Do not skip it.**
:::

:::tip It's free — always
The toolbox is **free**. Anyone charging for it is scamming you [#477 p24 AdaUnlocked].
:::
