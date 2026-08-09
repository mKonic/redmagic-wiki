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

## Full-image dumps

Toolbox EDL backups are the community's real firmware distribution channel — the vendor only publishes deltas. Sources worth knowing:

- **[dumps.tadiphone.dev / nubia / nx789j](https://dumps.tadiphone.dev/dumps/nubia/nx789j/)** — Android Dumps' GitLab tree for the NX789J [#693 p35 Jole7]. Caveat from the person who needed it: the available dump predates `10.0.18` and looks incomplete [#695 p35 _tyler_].
- **[szescxz/ZTE_NX809J_FOTA](https://github.com/szescxz/ZTE_NX809J_FOTA/releases)** — unofficial FOTA tracking repo. NX809J (RM11 Pro) rather than RM10, but it's the model for what's missing on the RM10 side, and it carries direct rollback packages [RM11 #2751, #2756 p138]. Note most entries there are ~200 MB **OTAs**, not full images [RM11 #2757 p138].
- Community EDL backups posted directly in-thread — this is how most people recover. Which brings up the standing complaint: **RM10 owners don't share theirs.** dev-reverse, Jul 11: *"We RedMagic 11 Pro users already have backups that we can share, and we even know which ROM versions are compatible… But for the RedMagic 10, nobody posts a notice saying which ROM version is compatible, and nobody leaves an EDL backup"* [#697 p35]. If you unlock successfully, posting your version and your dump is the single most useful thing you can do.

## Downgrading

- From V10.0.9 onward, **OTA-based downgrade is not possible** [#12 p1 Ssmiles].
- Reminon downgraded V10.0.14 → V10.0.8 via EDL, then re-upgraded — possible but tedious; required manual partition-by-partition flashing [#487 p25].
- **Check for anti-rollback before you try.** [otaripper](https://github.com/syedinsaf/otaripper) and [arbscan](https://github.com/syedinsaf/arbscan) will tell you whether a package carries an ARB bump [RM11 #2371 p119, #2595 p130]. On unfused devices in this family, downgrade is still working [RM11 #2941 p148, #3018 p151].
- Restoring a **donor** EDL package can silently halve your reported storage — see [Known issues → storage reported as 512 GB](/rm10pro/known-issues#storage-halved).

## Update paths reported by RM10 Pro owners

Fragmentary, but these are the only first-hand RM10 accounts in the newer posts:

- **EEA → EU → Android 16.** SansQuartier's route: flash **V10.0.14** from [RedMagic's own support page](https://help.redmagic.gg/hc/en-us/articles/42689608796057-REDMAGIC-10-Pro), which then offers an OTA to the EU build, which in turn offers the Android 16 update [#688 p35].
- **Unexplained `11.0.4` / `11.0.5` builds.** GigaWrathWave has one rooted RM10 Pro on `11.0.4` being offered `11.0.5` (which crashes on install) while his stock unit sits on `10.0.18mr1` with no OTA available — and neither 11.x build appears on RedMagic's Global ROM page [#687 p35]. Unresolved in-thread.

## Third-party ROMs

- **HyperOS port for the RM10 and RM11 series** — a Chinese developer's build, shared on Coolapk ([feed](https://www.coolapk.com/feed/71480823)) and hosted on `yun.139.com`, which **requires a Chinese phone number to download** [#700, #704 p35–36 HammadYasin; RM11 #2930 p147]. Multiple RM10 owners have asked for a mirror; none has appeared [#702 p36].
- **LineageOS 23.2 (Android 16)** exists for the **RM11 Pro** (NX809J) only — IronSingh's unofficial alpha, [thread 4791285](https://xdaforums.com/t/rom-nx809j-unofficial-lineageos-23-2-alpha-09-06-2026.4791285/), built on the stock kernel [RM11 #2496 p125]. No RM10 Pro equivalent; nobody has answered chi0's *"Has anyone created an AOSP build yet?"* [#699 p35].

## Region notes

- "Global" / "EEA" / "Asia" / "EU&Asia" all share the NX789J codename. CN-variant ROMs target NX789S (overclocked). Some kernel/firmware features differ — but the kernel source tree (public, see [Kernel source](/rm10pro/kernel-source)) has config selecting between J and S [#672 p34 MrKonic].
- **CN ROMs are subject to silent forced updates** even with auto-update disabled. Watch the system updater app aggressively if running CN [#545 p28 AdaUnlocked].
