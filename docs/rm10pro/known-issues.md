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

## Brick recovery cheatsheet

### Soft brick — boot loop or "device is corrupt"

| Symptom | Likely cause | Recovery |
|---------|--------------|----------|
| "Your device is corrupt and will not boot" stuck screen | AVB rejected an image you flashed | Re-flash patched `vbmeta` (flags=0x02) via EDL; re-flash stock `init_boot` if needed. See [05-bd-security-edl-root.md](/rm10pro/bd-security-edl-root). |
| Bootloader-mode loop (keeps returning to bootloader) | Tried `fastboot flash vbmeta --disable-verity` etc. | EDL restore — only path back is flashing stock `vbmeta` via firehose [#315 p16 Reminon] |
| Boot loop after Android 16 GSI/DSU on A15 stock | `/metadata/aconfig/maps/system.flag.map` left over | `adb shell su -c 'rm /metadata/aconfig/maps/system.flag.map'` [#279 p14 Reminon] |
| Permission controller crashes after dual-booting A16 ROM | Same A16 leftover | Same fix as above |

### Hard brick — stuck in MemoryDump / no display

| Symptom | Recovery |
|---------|----------|
| ZTE MemoryDump mode (VID `19D2`/PID `0112`) | Volume-button method [04-edl-9008.md](/rm10pro/edl-9008) — bypass crash handler, get to clean 9008, flash via firehose |
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

## OTA / update gotchas

- **OTA update fails at `payload_properties.txt` (~16.38 KB)** — common when you've sideloaded patches or aren't on the exact expected predecessor version [#487 p25 Reminon]. Workaround: extract the delta payload, patch the 42 stock partitions, flash via fastboot.
- **Renaming update.zip and dropping it in `/sdcard`** doesn't trigger the local-update prompt on this device [#487 p25].
- **Super partition out of space** when manually flashing patched partitions back: hardcoded 16 GB, slot-A typically uses ~8.8 GB; if patched slot-B partitions need >7 GB you have to delete slot-A logical partitions first [#487 p25].

## Toolbox-specific issues

- **Toolbox 1.2.4 stuck on "Backing up FRP"** on build 10.0.18_NX789J_GB → "Failed to read partition table file. Press any key to retry" [#666 p34 Enddo]. No documented fix as of mid-May; suspected driver/version mismatch.
- **Toolbox version <1.2.3 doesn't support RM10 Pro** — gives "phone isn't supported" even though the UI lets you select it [#660 p33].

## Custom-recovery side effects

- **Stock recovery present + bootloader-fastboot = no slot switch / partial flash**. Solution: install custom recovery to at least one slot, or use `fastbootd` (userspace fastboot, via `adb reboot fastboot` from booted state) [#257 p13 Reminon].

## "RPV doesn't work" after root

GigaWrathWave [#668 p34]: rooted RM10 successfully, but `rpv` (presumably **Remote Play / Vendor service** — abbreviation not expanded) doesn't function. No solution offered before thread ran out at May 17. If you hit this: check `init_boot` patch slot vs active slot, check `vbmeta` flags, verify Magisk's RootBeer-Fresh tests (rooted state can flag vendor services).

## EDL "Non-ZTE tool" error

`Non-ZTE tool` returned from `firehose <configure>` → you're using a generic edl client without the ZTE OEM string. Fix in [04-edl-9008.md](/rm10pro/edl-9008) (patch bkerler/edl `firehose.py`) or [#514 p26 GigaWrathWave] (workaround attempts).

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
