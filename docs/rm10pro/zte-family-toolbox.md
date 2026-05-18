# ZTE Family Toolbox (中兴家族工具箱)

Chinese-language toolbox by **[SYXZ](https://xdaforums.com/m/12774241/)** on XDA (handle **某贼** on Coolapk). Single-binary Windows tool that handles bootloader unlock, partition backup/restore, EDL operations, and no-BL root via KernelSU for the ZTE / Nubia family: Red Magic 10 Pro / 10 Pro+, Red Magic 11 Pro, Red Magic 11 Air, Nubia Z70 Ultra, Nubia Z80 Ultra, Red Magic Pad 3 Pro.

The toolbox is **free**. Anyone charging for it is scamming you.

## Download

These are the canonical Google Drive links curated by the RM11 thread OP. Mirror locally on first download — Google Drive links occasionally rotate.

| Version | What's in it | Link |
|---------|--------------|------|
| **v1.2.4 Beta** ⭐ | Bug-fix release over 1.2.3. **Recommended for RM10 Pro / Pro+, Z70 Ultra, Pad 3 Pro, RM11 Air.** | [Download](https://drive.google.com/file/d/1DfpTdhVx4uGPiFJQh0Xw9wKP5BGwbpBP/view?usp=sharing) |
| **v1.2.3** | First public release with RM10 Pro / Pro+, Nubia Z70 Ultra, Pad 3 Pro, RM11 Air support. Stable. | [Download](https://drive.google.com/file/d/1Al5P6cKVnfX3p02v8_-6ZLgxspdev-bN/view?usp=sharing) |
| v1.2.2 | RM11 Pro + Z80 Ultra. Some experimental code — RM11 owners were advised to stay on 1.2.1. **Does not support RM10 Pro.** | [Download](https://drive.google.com/file/d/16ZGMlXs_ii9sJa7GweGnjeTcXspnj8Ud/view?usp=sharing) |
| v1.2.0 (legacy) | First public RM11 Pro unlock. Breaks fingerprint calibration; superseded by 1.2.1+. | [Download](https://drive.google.com/file/d/1-QFxPHLRS0bvNg0-Go7V9ePVfqSR28Wr/view?usp=sharing) · [Spare (password 123456)](https://drive.google.com/file/d/1SPwHjzyxrNxgmVhrKEyi1i9mD-eaLdvR/view?usp=sharing) |
| English UI (community) | Partial English translation of v1.2.1 by Enddo. Not the latest version. | [dl.surf](https://dl.surf/f/c9a51290) |

:::tip Pick the right version
**For Red Magic 10 Pro / Pro+ owners:** use **v1.2.4 Beta**. Versions ≤ 1.2.2 will reject your device at "device not supported" [#660 p33 Enddo]. Versions 1.2.3 and 1.2.4 are the first to enable RM10-series unlock, and 1.2.4 ships bug fixes [#664–#665 p34].
:::

:::warning Watch for new mirrors
The original CN community post for this tool was deleted within an hour of publication (per the author's reports). Newer toolbox releases (v1.2.5+, v1.2.6) circulate primarily on Chinese-language community forums (Coolapk) and are not always mirrored to Google Drive. Verify SHA256 against community-reported hashes when downloading from third-party mirrors.
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
**DO NOT update your phone** between unlock attempts. ZTE has been rolling fuse-blowing updates to permanently kill unlock paths on the SM8750 platform [#541, #545, #573]. Freeze the system updater app.
:::

:::tip It's free — always
The toolbox is **free**. Anyone charging for it is scamming you [#477 p24 AdaUnlocked].
:::
