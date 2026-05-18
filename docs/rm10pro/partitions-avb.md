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

## vbmeta header — flag byte

`vbmeta.img` is an AVB descriptor partition. The 4-byte flags field at **offset 0x0C** (little-endian) controls verification:

| Value | Meaning |
|-------|---------|
| `00 00 00 00` | Normal verification (stock) |
| `02 00 00 00` | `AVB_VBMETA_IMAGE_FLAGS_HASHTREE_DISABLED` + `AVB_VBMETA_IMAGE_FLAGS_VERIFICATION_DISABLED` (both bits set) |

Patch:
```python
with open('vbmeta_b_stock.img', 'rb') as f: data = bytearray(f.read())
data[12:16] = b'\x02\x00\x00\x00'
with open('vbmeta_b_patched.img', 'wb') as f: f.write(data)
```

Verify with avbtool:
```bash
avbtool info_image --image vbmeta_b_patched.img | grep Flags   # → Flags: 2
```

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
