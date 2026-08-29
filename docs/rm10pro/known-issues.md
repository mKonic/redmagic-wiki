# Known issues, bricks, fixes

## The fusing threat (read first)

:::danger Read this before doing anything else
**Updating your device may permanently destroy your ability to unlock the bootloader.** ZTE is silently rolling out updates that burn SoC fuses. Once blown, no software method works — the device is locked forever. Freeze the system updater **now**.
:::

ZTE, like other CN OEMs (Xiaomi was the precedent), is rolling **irreversible hardware-fuse updates** that permanently disable bootloader unlock by burning SoC fuses. Multiple users (AdaUnlocked [#477, #541, #545, #573], hoahenry, ks75vl) have warned about this.

Key points:
- Updates come with no notice ("we are permanently destroying your SoC fuses" never appears in any changelog [#573 p29 AdaUnlocked]).
- CN ROMs do silent forced updates even with auto-update off — this is the highest-risk variant.
- Xiaomi precedent: cutoff at January 2026 security patch; phones past that point cannot be unlocked at all.
- RM10 Pro cutoff was unclear as of late April 2026; AdaUnlocked believed it supported "much newer versions" than Xiaomi did.

**Mitigation:** uninstall the Android updater app (`adb shell pm uninstall --user 0 <updater pkg>`). Freeze any "system update" notifier. Stay on the version that works for you.

**Status as of late July 2026:** still **no confirmed real-world fuse blowout** on any device in this family. AdaUnlocked's Jul 22 bump: *"There is still a glimmer of hope! It seems the destructive hardware fuses haven't been completely blown yet"* [RM11 #2921 p147]; dev-reverse, more specifically, says there is no fuse blowing in `.18 MR1` or `.19 MR2` [RM11 #2838 p142]. The 5t0l3n data point on the sibling Z80 Ultra is the most concrete evidence anyone has produced: `.27` **does not** blow the efuse, and downgrading from it back to `.16` worked [RM11 #2476 p124].

Practical canary (SnowFuhrer's reasoning, not a confirmed test): a fused device would *fail* to make a toolbox backup — so if your **Option 4 (Back All)** backup succeeds, you're probably not fused [RM11 #2226 p112].

### What updating actually costs you today {#what-updating-costs}

The fuse is the tail risk. The thing that is **already happening** is ordinary software patching, and it's worth being precise about the failure mode because it isn't the intuitive one:

- **You do not lose the unlock.** An OTA doesn't relock the bootloader.
- **You lose EDL.** These phones have no write-capable fastboot on stock firmware, so firehose/EDL is the only way to put an image on the device. Patch that, and an unlocked bootloader is inert. dev-reverse: *"You don't lose the unlock; you lose access to EDL mode"* [RM11 #2855 p143]. Haldi4803: *"No more EDL. No more flashing anything, no ROMs, not even root exploit"* [RM11 #2858 p143].
- **The GBL exploit is confirmed patched** as of RM11 `.19 MR2` [RM11 #2763 p139] — that's the one Option 18 uses for locked-bootloader root and the fingerprint fix.
- The 5t0l3n ladder on the Z80 Ultra shows the sequencing clearly: `.16` everything works → `.20` efisp fix broken → `.27` can't unlock or root at all, *but firehose still functions* [RM11 #2476 p124]. His read: *"seems like everything is patched except firehose. You know what's next."*
- **On the RM11 family that patch is now reversible.** Flashing a pre-patch `abl` + `efisp` back onto a current device restores the exploit, on any firmware and region [RM11 #3,055 p153] — see [the downgrade bypass](/rm10pro/bootloader-unlock-status#abl-efisp-downgrade). It has **not** been shown on the RM10 Pro, which [has no `efisp` partition](/rm10pro/partitions-avb#no-efisp).

### Keep a copy of your pre-patch bootloader partitions {#keep-prepatch-images}

The corollary of the bypass is that **pre-patch `abl` and `xbl_config` images are valuable** — they are what makes the exploit work again later. If you are on old firmware today, dump them while you can. With any root (including [GhostLock](/rm10pro/ghostlock-temp-root), which needs no unlock) it's a one-liner per partition and doesn't require EDL:

```bash
for p in abl_a abl_b xbl_config_a xbl_config_b init_boot_a init_boot_b \
         vbmeta_a vbmeta_b ztecfg uefi_a uefi_b devcfg_a boot_a; do
  adb shell su -c "dd if=/dev/block/by-name/$p" > "$p.img"
done
```

Verify each one against the device before you trust it, since a truncated dump looks like a real file:

```bash
adb shell su -c 'sha256sum /dev/block/by-name/abl_a'
sha256sum abl_a.img
```

Record the build these came from (`ro.build.display.id`, `ro.build.fingerprint`, `uname -r`) next to the images — an image is only useful if you know which firmware it belongs to.

**Downgrading is still possible** on unfused devices [RM11 #2941 p148, #3018 p151]. Check any prospective update for anti-rollback first with [otaripper](https://github.com/syedinsaf/otaripper) or [arbscan](https://github.com/syedinsaf/arbscan) [RM11 #2595 p130, #2371 p119].

## Brick recovery cheatsheet

### Soft brick — boot loop or "device is corrupt"

| Symptom | Likely cause | Recovery |
|---------|--------------|----------|
| "Your device is corrupt and will not boot" stuck screen | AVB rejected an image you flashed | Re-flash patched `vbmeta` (flags=0x02) via EDL; re-flash stock `init_boot` if needed. See [BD_Security's EDL root guide](/rm10pro/bd-security-edl-root). |
| Bootloader-mode loop (keeps returning to bootloader) | Tried `fastboot flash vbmeta --disable-verity` etc. | EDL restore — only path back is flashing stock `vbmeta` via firehose [#315 p16 Reminon] |
| Boot loop after Android 16 GSI/DSU on A15 stock | `/metadata/aconfig/maps/system.flag.map` left over | `adb shell su -c 'rm /metadata/aconfig/maps/system.flag.map'` [#279 p14 Reminon] |
| Permission controller crashes after dual-booting A16 ROM | Same A16 leftover | Same fix as above |

### Hard brick — stuck in MemoryDump / no display

| Symptom | Recovery |
|---------|----------|
| ZTE MemoryDump mode (VID `19D2`/PID `0112`) | Volume-button method ([EDL / 9008 mode](/rm10pro/edl-9008)) — bypass crash handler, get to clean 9008, flash via firehose |
| Device doesn't appear in any USB mode | Drain battery fully, retry. Last resort: EDL test point on PCB (requires opening) |
| Bricked during paid-service unlock | ROM2BOX (R2B) sells "EDL ROMs" + unbrick — used to be the standard fallback. Less needed now that toolbox + BD_Security's procedure both work for free. |

### Bootloop after self-unlock

joao_lisa [#562 p29] hit a state where:
- Made a partition backup before unlock
- Wrote the whole backed-up UFS via EDL
- Phone still ends up in fastboot with bootloader unlocked (cannot return to a working booted state)
- Only `fastboot → EDL` transition works; other modes don't

Suggests **partition-state desync** between what was backed up and what the unlocked bootloader expects. No clean fix in-thread; treat as: don't restore your own EDL backup blindly after unlocking — restore specific partitions (vbmeta, init_boot) only, leave bootloader/abl/ztecfg alone.

joao_lisa's later question [#670 p34]: *"Have they managed to resolve the bootloop issue by unlocking the bootloader?"* — no public resolution as of mid-May 2026.

### No backup = unrecoverable

The most-repeated lesson in the newer RM11 posts: **make a full EDL backup (toolbox Option 4 / "Back All") before unlocking or rooting** — and ideally a second one right after unlocking [RM11 #2739 p137]. Restoring needs either *your own* EDL dump or someone else's *matching-firmware* dump [RM11 #2226 p112 SnowFuhrer — *"You should be fine as long as you make a backup. DO NOT SKIP."*]. A [custom recovery does now exist](/rm10pro/recovery-twrp) for the RM10 Pro, but it is not a substitute: it needs a genuinely unlocked bootloader to install, and on the RM11 port TWRP's restore path is broken even though backup works [RM11 #2771 p139].

**The IMEI is the part you can't buy back.** Several users flashed with a corrupt or missing backup and lost their original IMEIs, replaced by Qualcomm fallbacks. dev-reverse, repeatedly: there is no way to rewrite them without your own dump — *"only ZTE can help"* [RM11 #2513 p126, #2545 p128]. This is the concrete cost of the [corrupted-backup bug in the older English toolbox builds](/rm10pro/zte-family-toolbox#download).

### Verify the backup — "success" is not enough

A backup that reports success can still be unusable. Check before you rely on it [RM11 #2509 p126, #2963 p149]:

- Folder is **~22 GB** (RM11 Pro figure; an RM10S Pro 256/12 dump came to ~7.6 GB [RM11 #2966 p149], so calibrate to your storage tier)
- `.img` and `.xml` files are actually present
- On success the toolbox **closes itself and the phone powers back on** [RM11 #2474 p124]

Warnings like `Couldn't find the file 'init_boot_b.img', returning NULL` mean the dump is incomplete [RM11 #2780 p139].

### Storage reported as 512 GB after an EDL restore {#storage-halved}

Flashing a donor EDL package onto a 1 TB device makes it report 512 GB, because `rawprogram0.xml` carries the *donor's* `userdata` geometry. desudecchi's fix [RM11 #2891 p145]:

1. In the EDL package's `images/rawprogram0.xml`, find the `userdata` line and replace `num_partition_sectors` with the value from **your own** backup's `rawprogram0.xml` (e.g. `118996179` → `243963091`).
2. Copy `gpt_main0..5.bin` and `gpt_backup0..5.bin` from your own backup into the package's `images/` folder.
3. Flash as normal.

Without your own backup this is much harder; shaj10 eventually recovered by resizing with `sgdisk` from TWRP and formatting through the recovery UI [RM11 #3007 p151].

## Fingerprint reader stops working after unlock {#fingerprint-after-unlock}

Universal on this family: unlock the bootloader, and Settings starts reporting *"Fingerprint hardware missing"* [RM11 #2710 p136].

**dev-reverse's explanation** — worth flagging as a claim from the thread's most active reverse-engineer, not an independently verified finding [RM11 #2794 p140]:

> *"They created two paths in the system: it detects that your bootloader is unlocked and sends commands to a fake virtual fingerprint reader instead of the actual hardware sensor… It doesn't actually break the TEE related to the fingerprint; it's just a malicious stunt they pulled in their ROM."*

Two things follow if that's right, and both match reported behaviour:

- The sensor hardware and its calibration are **fine** — this is ROM-side gating, not damage. Restoring `persist` doesn't fix it because `persist` was never the problem.
- **Custom ROMs are unaffected**: *"If you're using a custom ROM, the fingerprint scanner will work fine, provided it's compiled correctly."*

### What actually restores it

- **Toolbox Option 18** is the supported fix. It was limited to firmware where the GBL exploit is still open — up to `.18 MR1` on the RM11 Pro, not `.19 MR2` or later [RM11 #2763, #2790 p139–140] — until the [pre-patch `abl` + `efisp` swap](/rm10pro/bootloader-unlock-status#abl-efisp-downgrade) lifted that limit on the RM11 family in August 2026. See [Options 18 and 19](/rm10pro/zte-family-toolbox#option-18-19).
- **It is incompatible with `abl userdebug` and with TWRP** — Option 19 has to strip the patch before either will run, and stripping it un-does the fingerprint fix [RM11 #2629 p132, #2807 p141].
- Reports of Option 18 *not* working are common on newer firmware and on the 11S Pro [RM11 #2559 p128, #2714 p136]; several of those ended in a soft-brick recovered by restoring a personal backup.
- On the **RM10S Pro**, -CNote- reports unlock + root **with a working fingerprint** on `RedMagicOS11.0.5MR_GB` [RM11 #2987 p150] — no procedure published.

## Google Wallet / Play Integrity / banking apps after root

Banking apps and Google Wallet check **bootloader state**, not just the presence of root — so a normally-unlocked + rooted phone fails them even with good root hiding [RM11 #177 p9 elrey120]. The short version of what the RM11 community settled on:

- Use **KernelSU**, not Magisk, for Wallet/banking — Magisk is far easier for these checks to detect; the toolbox's no-BL-root path ships a KSU build for exactly this [RM11 #117 p6 elrey120].
- The cleanest answer is to never break attestation in the first place: keep the bootloader locked and root through [EDL](/rm10pro/bd-security-edl-root), or use the **`efisp` "mode 2"** approach on the RM11 [Reverse engineering → efisp modes](/rm10pro/reverse-engineering#efisp-modes). borygo77 runs stock ROM with only the `efisp` exploit applied and reports Wallet and RCS working **with no modules at all** [RM11 #3024 p152].
- If attestation is already broken — typically after restoring an EDL backup — it can usually be **repaired with the device's own keys** rather than a fake keybox.

**This whole topic now has its own page: [Play Integrity, attestation, and getting your keys back](/rm10pro/play-integrity-attestation)** — diagnosis, the RKP re-provisioning procedure, the module stack as a fallback, and the custom-kernel trap that silently kills RCS and Wallet days later.

## OTA / update gotchas

### Taking an OTA while rooted {#ota-while-rooted}

RedMagic OTAs are **delta** payloads: `update_engine` rebuilds the new firmware from your current slot and verifies the source bytes of every partition it reads. Any partition you have modified — a patched `init_boot`, a custom `recovery` — fails that check and aborts the whole update with `ErrorCode::kDownloadStateInitializationError`, after restarting its download from zero.

The fix is to restore every modified partition to stock first, and to find *all* of them in one pass rather than one failed download at a time. Full procedure, including how to re-root in the window between "update applied" and rebooting: **[Taking an OTA while rooted](/rm10pro/ota-while-rooted)**.

Note that the ROM ships with logging suppressed (`log.tag=S`), so `logcat` shows nothing at all during a failed update until you lift it:

```bash
adb shell su -c 'setprop log.tag V'    # runtime only, resets on reboot
```

The ZTE updater (`com.zte.zdm`, the FOTA client behind Settings → System update) also records what it is doing in `/data/data/com.zte.zdm/shared_prefs/zdm.xml`: `dd_description` holds the offered `<TargetVersion>`, `dd_size` the package size, and `startDownload` / `delay_dismatch_time` show whether the client got as far as downloading or bailed out early.

### Other update failures

- **OTA update fails at `payload_properties.txt` (~16.38 KB)** — common when you've sideloaded patches or aren't on the exact expected predecessor version [#487 p25 Reminon]. Workaround: extract the delta payload, patch the 42 stock partitions, flash via fastboot.
- **Renaming update.zip and dropping it in `/sdcard`** doesn't trigger the local-update prompt on this device [#487 p25].
- **After using the RM11 `abl`/`efisp` swap, the updater refuses everything** until all modified partitions are restored to stock [RM11 #3,143 p158 borygo77].
- **Super partition out of space** when manually flashing patched partitions back: hardcoded 16 GB, slot-A typically uses ~8.8 GB; if patched slot-B partitions need >7 GB you have to delete slot-A logical partitions first [#487 p25].

## Toolbox-specific issues

- **Toolbox 1.2.4 stuck on "Backing up FRP"** on build 10.0.18_NX789J_GB → "Failed to read partition table file. Press any key to retry" [#666 p34 Enddo]. No documented fix as of mid-May; suspected driver/version mismatch.
- **Toolbox version <1.2.3 doesn't support RM10 Pro** — gives "phone isn't supported" even though the UI lets you select it [#660 p33].

## Custom-recovery side effects

- **Stock recovery present + bootloader-fastboot = no slot switch / partial flash**. Solution: install custom recovery to at least one slot, or use `fastbootd` (userspace fastboot, via `adb reboot fastboot` from booted state) [#257 p13 Reminon].

## "RPV doesn't work" after root

GigaWrathWave [#668 p34]: rooted RM10 successfully, but `rpv` (presumably **Remote Play / Vendor service** — abbreviation not expanded) doesn't function. No solution offered before thread ran out at May 17. If you hit this: check `init_boot` patch slot vs active slot, check `vbmeta` flags, verify Magisk's RootBeer-Fresh tests (rooted state can flag vendor services).

## EDL "Non-ZTE tool" error

`Non-ZTE tool` returned from `firehose <configure>` → you're using a generic edl client without the ZTE OEM string. Fix in [EDL / 9008 mode](/rm10pro/edl-9008) (patch bkerler/edl `firehose.py`) or [#514 p26 GigaWrathWave] (workaround attempts).

## FRP (Factory Reset Protection)

- **TSM** claims to remove FRP. Multiple posters flag it as likely-scam [#514 p26 GigaWrathWave].
- The toolbox does FRP backup as part of its unlock flow — useful before factory resetting a Google-account-locked phone.
- No clean ADB/no-root method for FRP bypass on A15+ documented in-thread.

## Things you can do that show the "corrupt" warning but still boot

[#315 p16 Reminon — useful "if you see this, you're fine" list]:
- Modifying `init_boot` (recovery, etc.) — warning, boots
- Settings DB editor changes to protected settings — warning, boots
- DSU/GSI ROM install via root — warning, boots

If you see "device is corrupt" and the phone boots through to Android within 10–20 s, you're not bricked. If it hangs on that screen forever, you have a real AVB failure and need EDL.
