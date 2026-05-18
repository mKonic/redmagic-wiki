# ROM / firmware releases — RM10 Pro (NX789J)

## Stock ROMs

All from `rom.download.nubia.com`. Posted by Ssmiles (OP) and extra98.

| Version | Region | URL | Source |
|---------|--------|-----|--------|
| V1.0.0B10MR1 | Europe | https://rom.download.nubia.com/Europe/NX789J/GEN_EEA_NX789JV1.0.0B10MR1_SD_WO_ERA/update.zip | [#245 p13] |
| V1.0.0B15 | Europe & Asia | https://rom.download.nubia.com/Europe&Asia/NX789J/GEN_NEEA_NX789JV1.0.0B15_SD_WO_ERA/update.zip | [#245 p13] |
| V10.0.8 | Europe | https://rom.download.nubia.com/Europe/NX789J/V10.0.8/update.zip | [#5 p1] |
| V10.0.9 | Europe (EEA) | https://rom.download.nubia.com/Europe/NX789J/V10.0.9/EEA_NX789J.zip | [#245 p13] |
| V10.0.13 | Europe & Asia | https://rom.download.nubia.com/Europe&Asia/NX789J/V10.0.13/update.zip | [#245 p13] |
| V10.0.14 | Europe & Asia (EEA) | https://rom.download.nubia.com/Europe&Asia/NX789J/V10.0.14/NEEA_NX789J.zip | [#245 p13] |
| V10.0.18 | Global | (no public direct URL captured — referenced as `10.0.18_NX789J_GB`) | [#667 p34] |

Nubia ROMs are **delta payloads (incremental binary patches)**, not full partition images. This causes the common pattern:
- The update zip is ~4 GB
- It expects to apply diffs against the currently installed version
- Manual installs (`update.zip` on `/sdcard`) often fail at `payload_properties.txt` parsing (~16.38 KB) unless the device is on the exact predecessor version [#487 p25 Reminon]
- For root-friendly flashing from a fresh state, you have to **extract and patch the 42 stock partitions** from the delta payload, then `fastboot flash` them individually [#487 p25]

## Auxiliary files linked in OP

From [#5 p1 Ssmiles] — note: `transfert.free.fr` links are temporary; mirror locally before they expire.

- `init_boot magisk patched V10.0.9` — https://transfert.free.fr/K5S0mWv
- `Qualcomm USB Driver v1.0.10065.1` — https://transfert.free.fr/DUbB8Nh
- `PayloadDumperAndroid-v3.3-stable.apk` — https://transfert.free.fr/2OdbvIj
- `Payload some extracted files V10.0.8` — https://transfert.free.fr/aUOIwbe
- `build.prop V10.0.8` — https://transfert.free.fr/v2C5xT3
- `Magisk v28.1` — https://github.com/topjohnwu/Magisk/releases/download/v28.1/Magisk-v28.1.apk

## Downgrading

- From V10.0.9 onward, **OTA-based downgrade is not possible** [#12 p1 Ssmiles].
- Reminon downgraded V10.0.14 → V10.0.8 via EDL, then re-upgraded — possible but tedious; required manual partition-by-partition flashing [#487 p25].

## Region notes

- "Global" / "EEA" / "Asia" / "EU&Asia" all share the NX789J codename. CN-variant ROMs target NX789S (overclocked). Some kernel/firmware features differ — but the kernel source tree (now public, see [09-kernel-source.md](/rm10pro/kernel-source)) has config selecting between J and S [#672 p34 MrKonic].
- **CN ROMs are subject to silent forced updates** even with auto-update disabled. Watch the system updater app aggressively if running CN [#545 p28 AdaUnlocked].
