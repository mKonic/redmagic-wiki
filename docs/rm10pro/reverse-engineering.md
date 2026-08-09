# Reverse engineering — abl_eng, ztecfg, RSA signing

The community work on understanding *how the unlock is gated* — independent of the (now-working) ZTE Family Toolbox exploit chain. Useful for kernel work because the same signature scheme applies anywhere a ZTE-signed image is checked.

## Actors

- **ks75vl** — primary RE driver; cryptographic analysis [#186, #190, #192, #204, #422]
- **hoahenry** — ztecfg field analysis; coordination of the data-gathering campaign [#189, #225, #237]
- **DarkestSpawn** — bkerler/edl Linux integration; high-level summary [#264, #392]

## The unlock check

Two binaries enforce it:
- **`abl_eng`** (engineering applications-bootloader) — contains the RSA-2048 public key fragment that validates `ztecfg` signatures and exposes the `fastboot flashing unlock` command path.
- **`ztecfg.img`** (~512 KB) — per-device config blob containing device identifiers and three signatures.

For `fastboot flashing unlock` to succeed:
1. `abl_eng` (rather than the production `abl`) has to be active.
2. The active `ztecfg.img` has to contain device identifiers signed by a key that `abl_eng` trusts.
3. Signatures are bound to the **CRC32 of the UFS serial number** [#192 p10 ks75vl] — so a ztecfg from another device won't validate on yours.

## The embedded public key

ks75vl extracted the modulus from `abl_eng` and confirmed RSA-2048 [#186 p10]:

```python
eng_abl_extracted_pubkey = bytes.fromhex(
    "0000080032DED7A1C3F63D29B3321CB2AEC98A3E06355DECC852DD65547FCCBB"
    "85DB860EA5E8311AA57065EC186F32B18975B3E85A57AA1B9A0E13FB241439AD"
    "647D9D3B5F149AEB10D6C8CB1BE883FBB3644F5CE8C08E84A1C6349D9F3F830A"
    "3CCF5026FEE5E1D34531A1E9FAD33EF8219CFCA4C9CAF22656A422E36096A0DB"
    "1DF63BC927894C13E68022893365AB8EAC8421215EB3E4D8AEA5ADEBF9099EA8"
    "F92B044EAE16A5933622ADEAAB90FAD6FBF0C6D42C2370831E67020FC4A63145"
    "86D90281ECBE70529AB00748B7FD0FB093EB951EC4320B3BCB1D6B76FAF32F1E"
    "A1E117953B82D53038CF1CDC706A88540F7FDC6B363B7494C6600DC2D2780CBA"
    "5C583761E3C3339F29A7B62C5D3ED123B959E3C5DD2E8E4B841BA626AC71422F"
    "A0766252D8051FF491A789C4AE7505FB83E67C0429BF5AC85B6EE114CFED41BA"
    "45188966B9E3E1830858CAA34C995AF5FFC77B1C8B23066DC9A25C2E65DAA1A6"
    "A9360BB5A0B9DFF16B0A918EEDA35EA21D2097D982B8C5843F469A62C535C083"
    "10AD3D01022A431B7BF6B912DD00B4CD733C4E41DB1BDFB69E8B3FFE732A80BB"
    "6AB98289DB91F80F8DEACD9DE4F9DBF85C2EDE7EB02C4B4E120325A757B49A41"
    "BE18BF7A03C740D0C73F8E718B092CF67535FAB7E66D75FAAEC9A172A58D7CF1"
    "4BEE114FE0C7133A4204B292B4FF404A8F03700EEB26E326FF997351F1E65B89"
    "01E4496E91DD0C45"
)
# Format: header(4B) + exponent(4B) + modulus(256B) + ... — typical Qualcomm A1 key blob
```

He confirmed the verification function runs cleanly under Unicorn emulation [#189 p10] — so the math is understood; what's missing is the **private key**.

## ztecfg layout

From hoahenry [#225 p12]:

```json
{
  "id": "Any Names",
  "deviceInfo": {
    "serialno": "...",
    "udid_z":   "...",
    "udid_t":   "...",
    "udid_e":   "...",
    "...":      "..."
  },
  "signature": [
    "...",   // deviceid.sign.0
    "...",   // deviceid.sign.1
    "..."    // deviceid.sign.2 — yes three slots, exact semantics unclear
  ]
}
```

Bytes ~0..2000 are generic / version metadata; from offset ~2000 onward is the per-device encrypted/signed payload [#189 p10 hoahenry]. The data **is decryptable** (ks75vl confirms via the embedded key) but **not forgeable** without the signing key [#192 p10].

## The "boot from USB" speculative bypass

ks75vl [#422 p22] proposed:
- Since the signature is computed against the UFS serial number, boot the device from an **external USB** storage that the host controls the serial number of.
- Pair the UFS-serial with a known-good signature blob from someone else's dumped ztecfg.
- The PBL/XBL doesn't care which storage as long as the secure-boot chain checks out per-image.

> *"if it don't use TZ, then we just modify devinfo partition to let the bootloader unlock (via edl write partition command)"*

This hasn't been implemented — it requires either a working external-boot path through the PBL (not documented) or TrustZone being unused on RM10 Pro (likely false). Treat as research direction, not procedure.

## DarkestSpawn's plain-English summary

[#392 p20]:
> Bootloader unlocking has been available for awhile. The problem is ztecfg partition needs to be pulled and signed and sent back for the bootloader to accept the `eng_abl fastboot command unlock`. What is not available to the public is the RSA algorithm used for signing atm. Without that, when you send the fastboot unlock command it will fail. That's what is being worked on behind the scenes:
> - cracking the RSA key (not likely), or
> - getting lucky and obtaining the signing algo/key (then someone makes a program with it), or
> - finding a CVE in Qualcomm bootloader + AVB (more likely, still not easy, possible hard bricks)
> - hardware paths: test points, board swaps

## What changed by May 2026

SYXZ's ZTE Family Toolbox **did** find a bypass that doesn't require the RSA private key. The exact mechanism isn't published in the thread but the symptoms (works on every supported device without per-device interaction, blocked by hardware fuse updates) suggest a *firmware-level* exploit in `abl`/`xbl` itself, not a cryptographic break. The reverse-engineering work above remains useful for:
- Understanding fuse semantics (what `eng_abl` will and won't accept once fused)
- Building tooling that interacts with `ztecfg` (e.g. moving between devices, fixing post-unlock state)
- Tracking new ZTE OTAs for fuse-related abl changes

## `efisp` bootloader-state spoofing — the "modes" {#efisp-modes}

A separate line of work centred on the **RM11 Pro (NX809J)** — conceptually portable to the RM10 Pro since both share the `efisp` partition and ABL behavior. This sidesteps the `ztecfg`/RSA signing problem entirely: instead of forging a signature, it makes a *genuinely* unlocked device *present* as locked.

- The ZTE toolbox's unlock already works by **writing a modified `efisp`** partition, then restoring the original after [RM11 #398 p20, around the OP's method notes]. The same lever can be pointed the other way — write a custom `efisp` so the ABL reports "locked" while booting unsigned images. The modded `efisp` is open-sourced via **[superturtlee/gbl_root_canoe](https://github.com/superturtlee/gbl_root_canoe)**.
- **SnowFuhrer** drives much of this: he maintains **[`SnowFuhrer/edl-ng`](https://github.com/SnowFuhrer/edl-ng)** (a modern, ZTE-patched EDL client) [RM11 #1954 p98] and develops the `efisp`/`GblPayloadLib` payloads, which he shares in-thread [RM11 #2202 p111].
- The community settled on **"modes"** for different use cases (the exact internal semantics are described inconsistently in-thread, so treat these as the working summary):
  - **mode 2** — stock ROM with unlocked-boot capability while keeping attestation, so **Google Wallet / Play Integrity still pass**; described as a TA-payload spoof at the QSEE/SPSS boundary with the ABL kept "honest" [RM11 #2150 p108, #2151 p108 EliteBlackKaiser]. Switching to it from the old fingerprint patches requires a reset (phone is now seen as unlocked) [RM11 #2202 p111 SnowFuhrer].
  - **mode 3** — full custom ROMs, which *will* fail attestation [RM11 #2199 p110 n00b-xda-disciple].

This is bootloader-state spoofing at the `efisp`/ABL layer rather than the `ztecfg`/RSA layer the rest of this chapter covers. It's also why a compilable kernel matters — see [Kernel source → GPLv2 dispute](/rm10pro/kernel-source#gplv2-kernel).

### Where this landed {#efisp-status}

- **In the toolbox.** The `efisp` write is exposed as **Option 18** ("Snapdragon 8E5 without unlocking BL + fingerprint protection") and its reversal as **Option 19** — see [Options 18 and 19](/rm10pro/zte-family-toolbox#option-18-19). You don't need to hand-flash payloads any more; SnowFuhrer himself now points people at the toolbox, or at `edl-ng` for Linux [RM11 #2885 p145].
- **SnowFuhrer considers his part done** — *"everything worked in the way I wanted so I moved to other things"* [RM11 #2885 p145].
- **ZTE patched it.** dev-reverse traces the fix into the ABL: *"The flags that used to exist inside the `abl` file are gone now… the names needed to change the flag in the hex code simply don't exist anymore. That exploit is dead"* [RM11 #2794 p140]. Confirmed dead from RM11 firmware `.19 MR2` [RM11 #2763 p139], and on the Z80 Ultra the `efisp` fix stops working at `.20` [RM11 #2476 p124].
- **It still works on older firmware**, which is the entire reason the "don't update" rule exists. borygo77 runs stock ROM with nothing but the `efisp` exploit applied and has Wallet and RCS working without a single module [RM11 #3024 p152].

The RM10 Pro shares the partition and the ABL behaviour, so the mechanism ports — but no RM10-specific `efisp` payload or version cutoff has been published.

## See also

- [Aleph Security: Exploiting Qualcomm EDL Programmers (1)](https://alephsecurity.com/2018/01/22/qualcomm-edl-1/) — background on PBL/firehose architecture [linked in #419 by c3c3]
