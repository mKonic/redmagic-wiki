# Who's who — RM10 Pro thread contributors

Reference for tracking who's the authority on what when reading the raw extract.

| Handle | Posts | Specialty / role |
|--------|-------|------------------|
| **Ssmiles** | OP | Started the thread; curates ROM links and tooling list in early posts (#5, #245 area). |
| **extra98** | 47 | Most prolific. ROM links, fastboot/edl observations. |
| **Reminon** | 44 | Custom recovery (TWRP/OFRP) lead — see [his repo](https://github.com/reminon/twrp_device_nubia_nx789j); AVB experiments; manual delta-payload patching wizard. |
| **hoahenry** | 39 | RE on ztecfg layout; coordinated the data-gathering for signature analysis [#225]; one of the first users to confirm working free-toolbox unlock [#659, #664]. |
| **HyoudoIsse** | 26 | Active community Q&A. |
| **hyty** | 26 | Active community Q&A. |
| **ks75vl** | 23 | Cryptographic RE lead — extracted abl_eng RSA pubkey, ran Unicorn-emulated verification [#186, #189, #192]; "boot from USB" speculative bypass [#422]. |
| **GigaWrathWave** | 22 | EDL tooling experimentation; bkerler/edl ZTE-OEM issue surfacing [#514]. |
| **engosen2580** | 20 | Q&A. |
| **zcink** | 20 | De-Googling-without-root advocate [#501]. |
| **Delgado666** | 19 | Q&A. |
| **Jole7** | 16 | Q&A. |
| **n00b-xda-disciple** | 16 | Toolbox version-tracking and link-sharing [#662, #665]. |
| **HammadYasin** | 14 | Stock-init_boot extraction via `dd` workflow [#589]. |
| **Nicot38** | 13 | Q&A. |
| **jstndcllrc0** | 13 | Q&A. |
| **DarkestSpawn** | (multiple) | Linux/bkerler edl integration [#264]; plain-English unlock-status summary [#392]. RM9 Pro device-tree author whose tree was adapted for RM10 Pro recovery work. |
| **AdaUnlocked** | (multiple) | Activist / news aggregator for free-unlock landscape across the SM8750 platform [#477, #541, #545, #573]; cross-links RM11 thread. |
| **BD_Security** | 1 | Single legendary post [#423] — full EDL/firehose root procedure for locked-bootloader RM10 Pro, 26+ hours of debug condensed. |
| **[MrKonic](https://github.com/mKonic)** | 2 (#671, #672) | Forked Redmagic-Control-Center for RM10 Pro; announced public availability of the NX789S kernel source. Wiki maintainer. |
| **Oswald Boelcke** | (multiple) | XDA Senior Moderator. Polices Telegram/social-media link sharing; one-time-courtesy English translations for non-English posts. Not technical contributor; useful to know who's editing posts. |
| **SYXZ** (no posts in this thread) | — | Author of ZTE Family Toolbox; on Coolapk; runs the free-unlock private beta. |

## Cross-thread reference

The [Red Magic 11 Pro free-unlock thread](https://xdaforums.com/t/red-magic-11-pro-guide-bootloader-unlock-free-also-support-rm10-pad3pro-z70u-z80u-unlock-zte-family-toolbox.4780930/) has its own cast. Notable overlap:

- **AdaUnlocked** drives the rallying / news posts there too.
- **SYXZ** is the OP / tool author.
- Toolbox technical questions usually get more authoritative answers in the RM11 thread.

See [Toolbox cross-reference](/rm11pro/toolbox-cross-reference) for the version-history and companion-exploits map.

### RM11-thread principals

These drive the RM11 Pro / toolbox work, and several touch the RM10 Pro directly. Posts in this thread are cited as `[RM11 #N pP]` (search `data/rm11pro-unlock.md`).

| Handle | Role |
|--------|------|
| **dev-reverse** | The engine of the thread this cycle. Reverse-engineered a **bootable** RM11/RM10 kernel (the published ZTE source is unbuildable); leads the GPLv2 escalation; tracks toolbox releases (called 1.2.7.7 stable); walks newcomers through RM10 Pro unlock. |
| **SnowFuhrer** | `efisp` "mode" bootloader-state work (boot unlocked while presenting as locked); author of the `edl-ng` EDL client. |
| **n00b-xda-disciple** | Also on the RM10 thread; got the RE'd kernel's **touchscreen** working; front-line unlock support. |
| **elrey120** | English-translation work on the toolbox; early "banking/Wallet check bootloader state, not just root" insight. |
| **EliteBlackKaiser** | Maintains the community mega-guide Google Doc; documents the `efisp` "modes". |
| **superturtlee** | Author of `gbl_root_canoe` (the open-sourced modded-`efisp` / no-BL-root reference codebase). |
| **Grimish2280** | Drafting a native-Linux (`bkerler/edl`) NX789J unlock writeup [#676 p34, RM10 thread] — WIP, "do not use yet". |
| **jolly_roger_hook** | Shared the English ZTE Toolbox Drive folder; FOD/calibration analysis. |
| **AdaUnlocked** | Free-unlock activism & fuse-warning broadcasts (same role as on the RM10 thread). |

**MrKonic (you)** also weighed in on the RM11 thread, affirming the GPLv2 kernel-source obligation [RM11 #2066 p104].

## Verifying citations

Citations use the form `[#N pP]` — post number `N` on page `P` of the **RM10 Pro** thread — or `[RM11 #N pP]` for the **RM11 Pro / toolbox** thread. The raw post text for both threads (extracted to markdown and JSONL) lives in [`data/`](https://github.com/mKonic/redmagic-wiki/tree/main/data) in this repo, so you can search a post number directly with:

```bash
grep -n "^### #423" data/rm10pro.md            # RM10 thread, post #423
grep -n "^### #2,066" data/rm11pro-unlock.md   # RM11 thread, post #2066
```

Or query the JSONL programmatically:

```python
import json
with open("data/rm10pro.jsonl") as f:
    for line in f:
        p = json.loads(line)
        if p["author"] == "Reminon" and "```" in p["body_md"]:
            print(p["post_num"], p["datetime_human"], p["body_md"][:200])
```
