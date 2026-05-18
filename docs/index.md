---
layout: home

hero:
  name: "Red Magic Wiki"
  text: "Community knowledge base for Red Magic / Nubia (ZTE) device modding."
  tagline: Bootloader unlock · Root · EDL recovery · Kernel work · Reverse engineering — distilled from years of XDA community work.
  actions:
    - theme: brand
      text: Red Magic 10 Pro
      link: /rm10pro/overview
    - theme: alt
      text: Bootloader unlock status
      link: /rm10pro/bootloader-unlock-status
    - theme: alt
      text: Contributing
      link: /contributing

features:
  - icon: 🔓
    title: Bootloader unlock — finally free
    details: ZTE Family Toolbox 1.2.3+ unlocks the RM10 Pro for free as of May 2026. Status, history, and the full step-by-step.
    link: /rm10pro/bootloader-unlock-status
    linkText: Read the unlock guide
  - icon: 🛟
    title: EDL / 9008 recovery
    details: Root and unbrick from a hard fault state via Sahara + firehose. Includes BD_Security's full 26-hour debug log condensed into a procedure.
    link: /rm10pro/bd-security-edl-root
    linkText: EDL root guide
  - icon: 🔬
    title: Reverse engineering
    details: abl_eng RSA pubkey, ztecfg signing, the per-device UFS-serial binding. The "how" behind why unlocks were hard.
    link: /rm10pro/reverse-engineering
    linkText: Crypto & signing
  - icon: 🧠
    title: Kernel source
    details: NX789S/NX789J Linux 6.6.30 kernel sources are public. GKI 2.0 build with Kleaf.
    link: /rm10pro/kernel-source
    linkText: Kernel notes
---

## ⚠️ Disclaimer — read before you touch anything

:::danger You are responsible for your device
Everything documented here is **at your own risk**. Bootloader unlocking, rooting, flashing custom firmware, EDL operations, kernel modifications, and partition writes can — and sometimes do — result in:

- **Permanent loss of your manufacturer warranty.** Once you flash anything unofficial, ZTE / Nubia / RedMagic considers the warranty void. Service centers can detect unlock state and may refuse repairs.
- **A hard-bricked, unrecoverable device.** Some failure modes are not recoverable even with EDL.
- **Loss of all user data.** Many procedures here wipe userdata; assume every step does.
- **Loss of features.** Banking apps, Widevine L1, SafetyNet / Play Integrity, fingerprint, and some carrier services may stop working after unlock or root.
- **Permanent SoC-fuse changes.** ZTE is actively rolling out updates that burn hardware fuses, locking devices forever. The information here may not stop you from being caught in that.

**The contributors to this wiki, the original community members on XDA, and the maintainer of this repository are not liable for damage to your device, data, accounts, or anything else.** Read every page in full before attempting the procedure. When in doubt, ask first — don't flash first.
:::

## How this wiki was assembled

This wiki was bootstrapped in May 2026 by **scraping two XDA forum threads** with a Claude Code agent — 137 pages and 2,731 posts — extracting per-post markdown, then synthesizing the high-signal content into topical pages.

**Source threads:**

- [Red Magic 10 Pro general thread](https://xdaforums.com/t/redmagic-10-pro.4711211/) (34 pages, 673 posts)
- [Red Magic 11 Pro — Bootloader Unlock (FREE) — ZTE Family Toolbox guide](https://xdaforums.com/t/red-magic-11-pro-guide-bootloader-unlock-free-also-support-rm10-pad3pro-z70u-z80u-unlock-zte-family-toolbox.4780930/) (103 pages, 2,058 posts)

The raw extracts live in [`data/`](https://github.com/mKonic/redmagic-wiki/tree/main/data) inside this repo. Every fact in the wiki is cited back to the post it came from in the form `[#N pP]` (post number, page number) so you can verify any claim in the originals.

### Credits — the community did this work

This wiki is a synthesis, not original research. **Every breakthrough documented here was someone else's late night.** A non-exhaustive list of contributors whose work is captured (and an apology for everyone we missed — open a PR to add yourself):

| Contribution | Who |
|--------------|-----|
| RM10 Pro thread OP, ROM/firmware curation | **Ssmiles** |
| Custom recovery (TWRP/OFRP) device tree | **Reminon** |
| Reverse engineering of `abl_eng` RSA verification | **ks75vl** |
| `ztecfg` structure analysis, signature field mapping | **hoahenry** |
| EDL / Linux / `bkerler/edl` integration | **DarkestSpawn**, **GigaWrathWave** |
| The complete locked-BL EDL root procedure (26 h debug) | **BD_Security** |
| ZTE Family Toolbox (the tool itself, free) | **SYXZ** (XDA) / **某贼** (Coolapk) |
| Free-unlock activism, fuse-warning broadcasts | **AdaUnlocked** |
| RM11 Pro free-unlock thread, RM11 mega-guide curation | **AdaUnlocked**, **EliteBlackKaiser** |
| Stock `init_boot` extraction via `dd` workflow | **HammadYasin** |
| De-Googling-without-root walkthrough | **zcink** |
| Toolbox version tracking, English translation work | **n00b-xda-disciple**, **Enddo** |
| RM9 Pro device tree (the base Reminon adapted) | **DarkestSpawn** |
| Universal No-BL Root research | The CN modding community |
| RM10 Pro fork of Redmagic-Control-Center | **MrKonic** |
| ZTE NX789S kernel open-source release | **ZTE Devices** ([opensource.ztedevices.com](https://opensource.ztedevices.com/)) |

Every author named above retains credit for their original posts. If you contributed and aren't listed, or if you'd rather not be named, **open an issue or PR** — see [Contributing](/contributing).

### Why a wiki, not just the thread

XDA threads are precious but hard to navigate at 100+ pages. Forum software isn't built for "here's the canonical procedure for X" — it's built for chronological conversation. A wiki lets us:

- Surface the *current* working procedure without forcing readers to scroll past 50 pages of outdated attempts.
- Cross-link related topics (unlock ↔ EDL ↔ AVB ↔ kernel) in ways forum posts can't.
- Accept community PRs so corrections land in one place instead of buried mid-thread.
- Survive forum link rot.

The threads remain the **authoritative primary source** — anything here that disagrees with a current XDA post, trust XDA. Open a PR to correct the wiki.

## How to contribute

This wiki is **free** and **community-maintained**. Found a mistake? Procedure changed? New device variant supported? See [Contributing](/contributing). PRs welcome — small fixes to whole new sections.

## License

Content: **[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)** — credit the wiki and original posters, share-alike.
Tooling (the extractor script, build configs): **MIT**.
