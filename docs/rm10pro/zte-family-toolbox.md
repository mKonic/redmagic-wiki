# ZTE Family Toolbox (中兴家族工具箱)

Chinese-language toolbox by **[SYXZ](https://xdaforums.com/m/12774241/)** on XDA (handle **某贼** on Coolapk). Single-binary Windows tool that handles bootloader unlock, partition backup/restore, EDL operations, and no-BL root via KernelSU for the ZTE / Nubia family: Red Magic 10 Pro / 10 Pro+, Red Magic 11 Pro, Red Magic 11 Air, Nubia Z70 Ultra, Nubia Z80 Ultra, Red Magic Pad 3 Pro.

The toolbox is **free**. Anyone charging for it is scamming you.

## Download

These are the canonical Google Drive links curated by the RM11 thread OP. Mirror locally on first download — Google Drive links occasionally rotate.

| Version | What's in it | Link |
|---------|--------------|------|
| **v1.2.8-beta2** ⭐ (current recommendation) | The build the thread converged on. Shipped as a **working English translation** by dev-reverse after the earlier English builds turned out to be broken. Unlocks devices that 1.2.4/1.2.6/1.2.7 refuse, including the RM11S Pro on shipping firmware [RM11 #2714 p136, #3019 p151, #3034 p152] — and 1.2.8-beta4 is *not* a straight upgrade (see below). | Posted in the [Translated ZTE Family Toolbox thread](https://xdaforums.com/t/translated-zte-family-toolbox.4789388/#post-90647404) [RM11 #2843 p143] |
| v1.2.8-beta4 | Newer, and adds the Xiaomi/Redmi/OPPO/vivo expansion wave, but **does not support the Red Magic Pad 5 Pro** and reportedly fails where beta2 works [RM11 #2922 p147 AdaUnlocked, #3034 p152 kravnos]. Prefer beta2 unless you need a device only beta4 lists. | Via the RM11 thread OP |
| v1.2.7.7 | Was the CN stable through late May 2026 [RM11 #2135 p107 dev-reverse]. Superseded by 1.2.8-beta2. | Circulates via Coolapk / the [RM11 thread](https://xdaforums.com/t/red-magic-11-pro-guide-bootloader-unlock-free-also-support-rm10-pad3pro-z70u-z80u-unlock-zte-family-toolbox.4780930/). Verify hash. |
| v1.2.6 (English) | Earlier English build. **Superseded — and implicated in corrupted backups**, see the warning below. | [Drive folder](https://drive.google.com/drive/folders/1EnCdlPJP6y-fAjCguWYOugx905LeIZpn?usp=sharing) [RM11 #293 p15 jolly_roger_hook] |
| v1.2.4 Beta | Bug-fix release over 1.2.3. Long the recommended RM10 build; superseded by 1.2.7.7. **Its `bin/res/NX789J/uefi_unlock.img` is the payload the [native-Linux method](/rm10pro/bootloader-unlock-status#native-linux-unlock) extracts.** | [Download](https://drive.google.com/file/d/1DfpTdhVx4uGPiFJQh0Xw9wKP5BGwbpBP/view?usp=sharing) |
| v1.2.3 | First public release with RM10 Pro / Pro+, Nubia Z70 Ultra, Pad 3 Pro, RM11 Air support. Stable. | [Download](https://drive.google.com/file/d/1Al5P6cKVnfX3p02v8_-6ZLgxspdev-bN/view?usp=sharing) |
| v1.2.2 | RM11 Pro + Z80 Ultra. Some experimental code — RM11 owners were advised to stay on 1.2.1. **Does not support RM10 Pro.** | [Download](https://drive.google.com/file/d/16ZGMlXs_ii9sJa7GweGnjeTcXspnj8Ud/view?usp=sharing) |
| v1.2.0 (legacy) | First public RM11 Pro unlock. Breaks fingerprint calibration; superseded by 1.2.1+. | [Download](https://drive.google.com/file/d/1-QFxPHLRS0bvNg0-Go7V9ePVfqSR28Wr/view?usp=sharing) · [Spare (password 123456)](https://drive.google.com/file/d/1SPwHjzyxrNxgmVhrKEyi1i9mD-eaLdvR/view?usp=sharing) |
| English UI (legacy) | Partial English translation of v1.2.1 by Enddo. Superseded by the full English 1.2.6 above. | [dl.surf](https://dl.surf/f/c9a51290) |

:::tip Pick the right version
**For Red Magic 10 Pro / Pro+ owners:** use **v1.2.8-beta2**. Versions ≤ 1.2.2 will reject your device at "device not supported" [#660 p33 Enddo]; 1.2.3 was the first to enable RM10-series unlock. dev-reverse's blanket rule is *"for any smartphone supported by ZTE Toolbox, always use the latest version"* [RM11 #2824 p142] — with the one documented exception that **beta4 regressed against beta2** for several users.
:::

:::danger The English builds have a history of corrupting backups
This is the single most expensive gotcha in the newer thread. Older **translated** toolbox builds (1.2.2beta2, 1.2.6) produce backups that *report success but are incomplete* — dev-reverse diagnosed two separate users' unusable Google Drive backups by asking which build they'd used [RM11 #2471, #2474 p124], and told a third *"use the ZTE Toolbox in Chinese; do not use the translated version"* [RM11 #2443 p123]. Symptoms:

- `The system cannot find the batch label specified - QCEDLSENDFH-CONFIGURE-auto-ZTE`
- `ERROR: Tool doesn't come from ZTE.` / `Failed to read partition table file`
- `[Error]File_not_found` at launch — the package is literally missing `bin\tool\Win\cncmd.exe` [RM11 #2684 p135]
- Warnings like `Couldn't find the file 'init_boot_b.img', returning NULL` mid-backup [RM11 #2780 p139]

**The fix is not "always use Chinese" any more** — dev-reverse's own **1.2.8-beta2** English build was made specifically to preserve the CN back end (*"I tried as much as possible not to change the decoding type generated in the cmd file, so it probably keeps the tool's back end intact"* [RM11 #2685 p135]) and it works. Use 1.2.8-beta2, or the CN original. Avoid every other translation.

**Always verify the backup by hand** — check the folder is ~22 GB and that the `.img`/`.xml` files are actually present [RM11 #2509 p126, #2963 p149]. A successful Option 4 closes the toolbox window and powers the phone back on by itself [RM11 #2474 p124].
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

## Menu options {#option-map}

The toolbox is a numbered CMD menu and the thread refers to everything by option number, so this table is the Rosetta stone for reading it. Reconstructed from posted screenshots and menu dumps [RM11 #2394 p120, #2807 p141]. **Numbering shifts between versions** — always read your own menu; on 1.2.8 there are 30+ entries [RM11 #2985 p150].

| # | Function | Notes |
|---|----------|-------|
| **0** | **Unlock bootloader** | The main event. Phone on, USB debugging enabled; it reboots itself to 9008. Wipes data. |
| **2** | **Restore backup** | Your way back from almost anything — provided the backup is good. |
| **4** | **Back up all partitions** | ~22 GB. Do this first, always. Auto-closes the toolbox and reboots the phone on success. |
| 12 | Flash any partition | How you write `abl_a`/`abl_b`, `init_boot`, `recovery` without fastboot. |
| 13 | Read back any partition | Single-partition dump. |
| 16 | View / set slot | Fixes the "slot marked unbootable when it isn't" bug [RM11 #2506 p126]. |
| 17 | Back up / restore QCN | Modem calibration. |
| **18** | **"Snapdragon 8E5 without unlocking BL + fingerprint protection"** | The `efisp`/GBL exploit — root *without* a real unlock, and the fingerprint fix. See below. |
| **19** | **Clear the `efisp` partition** | Removes the boot-screen text, **and** is the escape hatch from ZTE Memory Dump Mode. Also removes the Option 18 patch. |
| 20 | Clear FRP partition | Newer builds only; alternative to wiping data [RM11 #2392 p120]. |
| 31 | (RM10 S Pro?) | dev-reverse, hedged: *"If I'm not mistaken, the option for your device is option 31"* [RM11 #2779 p139]. Unconfirmed. |

### Options 18 and 19 are a matched pair {#option-18-19}

This trips up nearly everyone, so, in dev-reverse's own summary [RM11 #2807 p141]:

- **Option 18** applies the GBL/`efisp` exploit patch. It's what gives you root on a locked bootloader *and* what restores the fingerprint reader after an unlock. After running it the device drops into recovery — **wipe data and reboot**, and the fix takes effect.
- **Option 19** removes that patch. You need it if the device fell into **"dumper mode"** (ZTE Memory Dump Mode), if Option 18 conflicts with your current state, or if you want to run **TWRP or `abl userdebug`** — both of which are incompatible with the Option 18 patch.

**Option 18 is not magic — it flashes a file.** All it does is write a modified `efisp` image that ships inside the toolbox's own folders [RM11 #3,177 p159 borygo77]. That's why the [pre-patch `abl` + `efisp` swap](/rm10pro/bootloader-unlock-status#abl-efisp-downgrade) works: restore the partitions the patch closed and Option 18 has something to exploit again, on any firmware. It also means that if you flashed a patched `efisp` yourself, running 18 afterwards is redundant.

Consequences worth knowing before you press 18:

- **Option 18 on an `abl userdebug` device crashes it into dump mode** — `abl userdebug` doesn't accept the correction Option 18 makes to the GBL [RM11 #2361 p119]. Option 19 gets you back [RM11 #2448 p123].
- **Whether Option 18 wipes your data is disputed.** dev-reverse: *"Every time I used option 18, it always wiped the data"* [RM11 #2840 p142]; borygo77 and KAHRAMANEDIT report it did **not** erase theirs [RM11 #2846 p143, #2841 p143]. Assume it will.
- It can **soft-brick into EDL** and switch your active slot [RM11 #2710 p136, #2714 p136]. Recovery is restoring `xbl_a/b`, `abl_a/b`, `efisp` and then the full package from your own backup.

## Windows environment — the real cause of most "the tool is broken" reports {#windows-gotchas}

An enormous share of the failures in the thread are host-side, not device-side. The checklist that repeatedly resolved them:

1. **No spaces, brackets, commas or non-ASCII characters anywhere in the path.** The toolbox rejects them outright ("The selected path or file name cannot contain special characters…") [RM11 #2441 p123]. Put the folder at the root of `C:` with a short plain name like `RM11ROOT` [RM11 #2677 p134, #3019 p151].
2. **Strip the Chinese characters out of the extracted folder and `.bat` filenames** [RM11 #2555 p128] — this alone fixed one user's backup.
3. **Create the backup destination folder *inside* the toolbox directory**, not elsewhere [RM11 #2690 p135, #2819 p141].
4. **Disable driver-signature enforcement** (Shift+Restart → Advanced startup → option 7) [RM11 #2795 p140, #2974 p149].
5. **Turn off antivirus / add a Defender exclusion.** Windows Defender silently removed the 1.2.8 package for multiple users [RM11 #2689 p135, #2974 p149].
6. **Non-English Windows locales can break it.** dev-reverse attributes this to the ASCII/codepage table the CN batch scripts assume [RM11 #2825 p142]. Contested by the affected user, but it costs nothing to test.
7. **Remove Google accounts and the lockscreen PIN before unlocking** [RM11 #3019 p151] — otherwise setup after the wipe demands a PIN you no longer have [RM11 #2400–2401 p120].

If the phone enumerates as `Qualcomm HS-USB QDLoader 9008` in Device Manager, drivers are fine and the problem is one of the above [RM11 #2819 p141].

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

## `abl userdebug` — how you get fastboot at all {#abl-userdebug}

On stock firmware these devices have **no working fastboot**. `adb reboot bootloader` gets you a fastboot prompt that answers `getvar` queries but rejects writes with `remote: 'unknown command'` — it's query/download-capable, not write-capable [RM11 #2454 p123]. Everything is done through EDL instead.

The workaround the RM11 side uses is flashing an **engineering / userdebug `abl`**, which does implement the write commands [RM11 #2434 p122, #2760 p138]. Procedure [RM11 #2538 p127, #2610 p131 dev-reverse]:

1. Toolbox **Option 12** → write the userdebug `abl` to **both** `abl_a` and `abl_b`.
2. Toolbox **Option 19** → clear `efisp`, or the device falls into dumper mode on the next boot.
3. Reboot.

What it costs you:

- **No fingerprint fix** while userdebug `abl` is in place — the two are mutually exclusive [RM11 #2380 p119, #2629 p132].
- It advertises the unlocked bootloader loudly.
- Recovering from it means flashing your original `abl_a`/`abl_b` back from your pre-unlock backup [RM11 #2383 p120], or the stock one shipped in the toolbox's own `bin/res/NX789J/` folder [RM11 #2389 p120].

:::warning RM10-specific caveat
Every report above is from RM11 Pro (NX809J) owners; the userdebug `abl` circulating in-thread is an NX809J image. Nobody has published an equivalent verified flow for the NX789J, and dev-reverse's blunt assessment of RM10 recovery is *"the Redmagic 10 is a bit more complicated"* [RM11 #2692 p135]. Don't flash an NX809J `abl` to an RM10 Pro.
:::

## Known toolbox issues

- **Wrong version error**: "Yo your using the wrong toolbox version. that one is for the 11 PRO. Try the newest one." — toolbox UI lets you pick "RM10 Pro" but version <1.2.3 still rejects [#662 p34].
- **`Failed to send boot. Please re-enter the device 9008.`** on RM10 Pro NX789J V10.0.18MR1 Global during Option 4 [RM11 #2490 p125 tobos123]. Same family as the `Failed to read partition table file` stall below; work through the [Windows checklist](#windows-gotchas) first.
- **Unlock "fails successfully"** — SansQuartier's RM10 Pro (EU) runs the whole unlock, never manages the reboot into fastboot, then the toolbox's own rollback bricks it every time; an EDL restore fixes the brick, and *the requested bootloader state has actually been applied anyway* [RM11 #2405 p121, #2498 p125]. If this is you: you are probably already unlocked. Restore your backup before trying again.
- **Slot marked unbootable when it isn't** — after flashing, Android may decide a good slot is dead. Fix with Option 16 (set slot A active), reflash if needed [RM11 #2506 p126, #2664 p134].
- **Stuck on "Backing up FRP"** for ~5 minutes then "Failed to read partition table file. Press any key to retry" on build 10.0.18_NX789J_GB. Driver/version mismatch suspected — not resolved as of mid-May 2026 [#666–#667 p34].
- The toolbox uses Chinese terminal output by default. Copy-and-translate workflow (Google Translate / DeepL) is what people rely on.

## Critical warnings

:::warning Don't update
**DO NOT update your phone** between unlock attempts. Freeze the system updater app. The threat has two distinct parts, and the near-term one is not the fuse [#541, #545, #573]:

- **Software patching is happening now and is confirmed.** The GBL exploit the toolbox depends on was closed in RM11's `.19 MR2` firmware [RM11 #2763 p139], and AdaUnlocked's July bump is titled *"THE BLOCKADE HAS ARRIVED"* [RM11 #2808 p141].
- **Destructive fusing still hasn't been observed in the wild** as of Jul 22 2026 — *"It seems the destructive hardware fuses haven't been completely blown yet"* [RM11 #2921 p147 AdaUnlocked]; dev-reverse states there is no fuse blowing in `.18 MR1` or `.19 MR2` [RM11 #2838 p142].

See [Known issues → fusing threat](/rm10pro/known-issues#the-fusing-threat-read-first) for what updating actually costs you.
:::

:::tip Always back up first (Option 4)
Before you unlock, run the toolbox's **Option 4 (Back All / BAKALL)** in 9008 mode to dump every partition — and again after unlocking. dev-reverse keeps *two*: one from before the unlock and one from after, because the post-unlock backup is the one that can take an OTA cleanly [RM11 #2739 p137].

**Verify it.** A backup that "succeeded" but is 7 GB instead of ~22 GB has cost several people their IMEI permanently — and without a dump there is no way to restore one [RM11 #2513 p126, #2545 p128]. Check the folder size and that the `.img`/`.xml` files exist before you touch anything.

SnowFuhrer's rule of thumb still holds: a fused device would *fail* the backup step, so a successful backup is also a sign you're not fused [RM11 #2226 p112]. **Do not skip it.**
:::

:::tip It's free — always
The toolbox is **free**. Anyone charging for it is scamming you [#477 p24 AdaUnlocked].
:::
