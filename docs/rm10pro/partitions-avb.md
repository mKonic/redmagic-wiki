# Partitions, AVB, vbmeta

## A/B layout

NX789J is A/B (no recovery image needed in main flow; recovery is bundled into `boot`/`init_boot`). All system partitions exist as `_a` and `_b` pairs. Active slot determines which set the bootloader uses.

```bash
adb shell ls /dev/block/by-name/ | head -30
fastboot getvar current-slot
```

## LUN 4 GPT — known sectors (sector size 4096)

From BD_Security's dump [#423 p22]:

| Partition | Start sector | Sectors | Size |
|-----------|--------------|---------|------|
| `xbl_b` | 184 | 15360 | 60 MB |
| `abl_b` | 448832 | 256 | 1 MB |
| `vbmeta_vendor_b` | 492584 | 16 | 64 KB |
| `vbmeta_b` | 490260 | 16 | 64 KB |
| `vbmeta_system_b` | 520120 | 16 | 64 KB |
| `boot_b` | 683040 | 32768 | 128 MB |
| `init_boot_b` | 686048 | 2048 | 8 MB |

`_a` equivalents live elsewhere — dump full GPT to capture both. Slot-A sectors are *not* a simple offset from slot-B; trust the GPT, not arithmetic.

## What AVB verifies

From Reminon's experiments [#315 p16, #263 p14]:

| Partition / change | AVB result | Boot result |
|-------------------|-----------|-------------|
| Modify `init_boot` | Tolerated | Boots |
| Modify `recovery` | Tolerated | Boots |
| Modify `boot` | **Triggers AVB**, forces factory reset | Won't boot until restored |
| `fastboot flash vbmeta --disable-verity --disable-verification` | **Bootloader mode loop**, requires EDL restore | Won't boot |
| Flash patched `vbmeta` with flags=0x02 (offline patch) | Tolerated | Boots |
| Install DSU/GSI ROM with root | Shows "device is corrupt" warning | Boots anyway |
| Change settings via settings DB editor | Shows "corrupt" warning | Boots anyway |
| Boot A16 ROM on A15 stock | A16 leaves files in `/metadata` that break A15 permission controller | Boots but app permissions break |

> *"In simple terms ztecfg has to give permission to the eng-abl to allow unlocking. So the ztecfg partition is modified to allow the eng-abl, then it's signed and flashed. Followed by the eng-abl, which has all of the commands."* [#315 p16 Reminon]

## vbmeta header — flag byte {#vbmeta-header-flag-byte}

`vbmeta.img` is an AVB descriptor partition. The 4-byte flags field lives at **offset 0x78**, and every integer in the AVB header is **big-endian**:

| Value at 0x78 | Meaning |
|-------|---------|
| `00 00 00 00` | Normal verification (stock) |
| `00 00 00 01` | `AVB_VBMETA_IMAGE_FLAGS_HASHTREE_DISABLED` |
| `00 00 00 02` | `AVB_VBMETA_IMAGE_FLAGS_VERIFICATION_DISABLED` |
| `00 00 00 03` | Both bits set — what the no-BL root flow flashes |

:::danger Offset 0x0C is not the flags field
Older copies of this procedure (including earlier revisions of this page) said offset `0x0C`, little-endian. That is wrong and it is not a harmless error: `0x0C` is inside `authentication_data_block_size`, so writing there produces a vbmeta whose declared block sizes no longer match its contents, and the bootloader rejects it. Recovering needs [EDL](/rm10pro/edl-9008).
:::

You can confirm the layout on any image you have, without trusting this page: the `release_string` field is at offset `0x80` and reads `avbtool 1.3.0` in plain ASCII. Everything above is positioned relative to that anchor.

```
00000070: 0000 0000 0000 0000  0000 0003 0000 0000
                               ^^^^^^^^^ flags = 0x03
00000080: 6176 6274 6f6f 6c20  312e 332e 3000 0000
          a v b t o o l _ 1 .  3 . 0            <- anchor
```

Patch:
```python
with open('vbmeta_stock.img', 'rb') as f: data = bytearray(f.read())
assert data[:4] == b'AVB0' and data[0x80:0x87] == b'avbtool'
data[0x78:0x7C] = (0x03).to_bytes(4, 'big')
with open('vbmeta_patched.img', 'wb') as f: f.write(data)
```

Verify with `avbtool`, which parses the header properly rather than trusting a byte offset:
```bash
avbtool info_image --image vbmeta_patched.img | grep Flags   # → Flags: 3
```

### Observed on a live device

A shipping NX789J on `RedMagicOS11.0.4MR1_GB`, rooted with a KernelSU-patched `init_boot` and a **locked** bootloader, reads:

| | `_a` (active) | `_b` |
|---|---|---|
| `init_boot` | KernelSU-patched (`Hello, KernelSU!`, `kernelsu.ko`, `/data/adb/ksud`) | stock |
| `vbmeta` flags @ 0x78 | `0x00` — **stock** | `0x03` |
| `ro.boot.verifiedbootstate` | `green` | |
| `ro.boot.flash.locked` | `1` | |

This is the practical proof of the first table on this page: **`init_boot` is not covered by the enforced AVB chain on this device**, so a patched `init_boot` boots green against an *unmodified* vbmeta. You do not need to disable verification to run KernelSU here — which is also why root can persist across reboots with the bootloader locked and Play Store still seeing a green verified-boot state.

## There is no `efisp` partition on the NX789J {#no-efisp}

The RM11 family's headline exploits — toolbox **Option 18**, the `efisp` "modes", the [pre-patch `abl` + `efisp` downgrade](/rm10pro/bootloader-unlock-status#abl-efisp-downgrade) — all act on a partition called `efisp`. **The RM10 Pro does not have one.**

A full `/dev/block/by-name/` enumeration from a shipping NX789J (`RedMagicOS11.0.4MR1_GB`, 121 entries) contains `ztecfg`, `uefi_a/b`, `uefisecapp_a/b`, `uefivarstore`, `xbl_config_a/b`, `multiimgoem_a/b` and `multiimgqti_a/b` — and no `efisp`, under that or any similar name.

```bash
adb shell su -c 'ls /dev/block/by-name/' | grep -i efisp   # no output on NX789J
```

This is a platform difference (SM8750 vs the RM11's newer SoC), not a firmware one, so it will not appear on a later RM10 build either. Practical consequences:

- RM11 procedures that name `efisp` **cannot be followed verbatim** on an RM10 Pro. Whatever plays the same role here has not been identified publicly.
- The fingerprint-after-unlock fix that Option 18 provides on the RM11 has no established RM10 equivalent — consistent with the RM10 thread never having produced one.
- If you are adapting RM11 work, `ztecfg` and `uefivarstore` are the obvious places to start looking, but nobody has published a result. See [Reverse engineering](/rm10pro/reverse-engineering).

## Why fastboot's `--disable-verity` doesn't work here

`fastboot flash vbmeta` with verity-disable flags writes the right flags to the image at flash time on most devices. On RM10 Pro this triggers a "bootloader mode loop" — the bootloader notices the flags but rejects them as inconsistent with the device-state policy. Workaround: patch the bytes manually and flash the modified image, with a *locked* bootloader the EDL path is required [#315 p16].

## ztecfg — the special partition

`ztecfg.img` is a ZTE-specific config blob, ~512 KB, stored on its own partition. It contains:
- Device identity fields: `serialno`, `udid_z`, `udid_t`, `udid_e` [#225 p12 hoahenry]
- Up to 3 signatures (`deviceid.sign.0..2`) of the device info
- An RSA-2048 public key fragment (key validated against the same data in `abl_eng`)

Key facts:
- The signature in ztecfg is **derived from the CRC32 of the UFS serial number** [#192 p10 ks75vl]
- Per-device — cannot be shared between devices [#189 p10 hoahenry]
- Edits from offset ~line 2000 (~hex ~0x07D0+) contain the encrypted/signed data; everything before is generic
- Modifying ztecfg to "look unlocked" is straightforward, but **signing** is what's gated (RSA key held by ZTE)

## Super partition

Hardcoded **16 GB** on RM10 Pro. Reminon's slot manipulation experience [#487 p25]:
- Stock slot-A logical partitions total ~8.8 GB
- His patched slot-B logical partitions needed 10.2 GB
- Result: ran out of space; had to delete all existing logical partitions and create only slot-B versions

If you're going to do full custom-ROM work, plan super layout up front. Don't expect both slots to fit if you're inflating partitions.

## Useful fastboot getvar commands

```bash
fastboot getvar unlocked            # yes / no
fastboot getvar current-slot        # a / b
fastboot getvar slot-count          # should be 2
fastboot getvar all                 # full dump — look for `unlocked:` line
```

[#216 p11 DarkestSpawn]
