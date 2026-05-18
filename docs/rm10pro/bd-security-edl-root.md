# BD_Security's complete EDL root guide

**Source:** [#423 p22 BD_Security · Feb 22, 2026]. Preserved here close to verbatim because it's a complete, self-contained workflow worth not paraphrasing.

**Bottom line:** root a RM10 Pro **with the bootloader still locked**, by flashing patched `vbmeta_b` + Magisk-patched `init_boot_b` via EDL/firehose directly. The bootloader never participates — it just boots what's on UFS, and AVB is disabled by the vbmeta flag patch.

> *Based on 26+ hours of debugging a bricked device. The most important lessons:*
> - **Don't trust the 8-second window.** The programmer is alive for ~8 s but you have to catch it in the first 2 s after USB re-enumeration. Clean 9008 via volume buttons gives that timing.
> - **The ZLP issue** cost 10+ hours. Firehose with `ZLPAwareHost="1"` is strict — one ZLP at the end, not after every chunk.
> - **vbmeta is NOT optional** — flashing modified `init_boot` without patching vbmeta to flags=0x02 gives "device is corrupt" every time.
> - **The programmer IS correct** — `devprg.melf` from ZTE dump mode is a valid firehose programmer. Don't waste time hunting another one.

---

## The problem this solves

Device stuck in **ZTE MemoryDump Mode** (VID `19D2`/PID `0112`) showing "Your device is corrupt and will not boot". Custom scripts fail with USB errors, programmer crashes, Sahara uploads succeed (38 chunks) but firehose never starts.

## Critical discoveries

### What DOESN'T work
- ZTE → SWITCH_MODE → 9008 transition (corrupts USB state, kills programmer)
- `clear_halt()` after Sahara DONE (hangs 6–8 s, misses programmer window)
- Reconnecting to the same handle after programmer starts (device disappears)
- Zero-Length Packet after every chunk (corrupts data)
- Using `1,2,3,4,5,6` in HELLO_RESP reserved bytes (causes mode mismatch)

### What DOES work
1. Clean 9008 entry via volume buttons (bypass ZTE crash handler)
2. Exact Sahara protocol from `edl_v5` (all-zero reserved bytes)
3. NO post-DONE delays — read immediately
4. Continuous data + ONE ZLP at the very end
5. Flash BOTH patched `init_boot` AND patched `vbmeta`
6. Direct 9008 entry = success. ZTE transition = failure.

### The real insight

`devprg.melf` **is** a valid firehose programmer. Sahara uploads 38 chunks successfully every time with `DONE_RSP status=0`. The problem: after Sahara DONE the programmer:
1. Restarts the USB controller
2. Re-enumerates as a new 9008 device (max packet `512 → 1024`)
3. Our old USB handle dies → `Errno 19: No such device`
4. Windows takes 60+ s to load drivers → programmer's 8-s watchdog fires → crash → back to ZTE dump

The "8-second window" is a myth — we were talking to a dead PBL handle, never the actual programmer.

## Prerequisites

### Hardware
- RM10 Pro (NX789J)
- USB-C data cable
- Windows PC (Linux/Mac can adapt)

### Software
```powershell
# Python 3.8+
pip install pyusb libusb

# bkerler/edl (optional but helpful)
git clone https://github.com/bkerler/edl
cd edl
pip install -r requirements.txt
```

### Files
| File | Source | Size |
|------|--------|------|
| `devprg.melf` | extract via EDL / from ZTE dump mode | ~1.6 MB |
| `abl_b_dump.bin` | backup of stock `abl_b` | 1 MB |
| `init_boot_b.img` | stock from device or firmware | 8 MB |
| `vbmeta_b.img` | stock from device or firmware | 64 KB |

## Phase 1 — enter clean 9008

```
1. Unplug USB cable
2. Press and hold BOTH Volume Up + Volume Down
3. While holding, plug USB cable back in
4. Keep holding for 5–10 seconds
5. Device should appear as "Qualcomm HS-USB QDLoader 9008"
```

Verify on Windows:
```powershell
Get-PnpDevice | Where-Object { $_.InstanceId -match "VID_05C6.*PID_9008" }
# Status OK, FriendlyName contains "9008"
```

This bypasses ZTE's crash handler, putting the SoC in clean PBL Sahara mode; the programmer stays alive ~8 s after loading.

## Phase 2 — backup partitions

### Partition layout (LUN 4, sector size 4096)

| Partition | Start sector | Sectors | Size |
|-----------|--------------|---------|------|
| `xbl_b` | 184 | 15360 | 60 MB |
| `abl_b` | 448832 | 256 | 1 MB |
| `vbmeta_vendor_b` | 492584 | 16 | 64 KB |
| `vbmeta_b` | 490260 | 16 | 64 KB |
| `vbmeta_system_b` | 520120 | 16 | 64 KB |
| `boot_b` | 683040 | 32768 | 128 MB |
| `init_boot_b` | 686048 | 2048 | 8 MB |

### Critical addresses (Python)

```python
VBMETA_B = {
    'lun': 4, 'start': 490260, 'sectors': 16, 'size': 65536
}
INIT_BOOT_B = {
    'lun': 4, 'start': 686048, 'sectors': 2048, 'size': 8388608
}
```

## Phase 3 — patch vbmeta

```python
def patch_vbmeta_flags(input_file, output_file):
    """Set AVB flags to 0x02 (verification disabled)."""
    with open(input_file, 'rb') as f:
        data = bytearray(f.read())
    # Flags at offset 0x0C, 4-byte LE: 00 00 00 00 → 02 00 00 00
    data[12:16] = b'\x02\x00\x00\x00'
    with open(output_file, 'wb') as f:
        f.write(data)

patch_vbmeta_flags("vbmeta_b_stock.img", "vbmeta_b_patched.img")
```

Verify:
```bash
avbtool info_image --image vbmeta_b_patched.img | grep Flags
# Flags: 2

hexdump -C -n 64 vbmeta_b_patched.img | head
# At offset 0x0C: 02 00 00 00
```

## Phase 4 — Magisk-patch init_boot

1. Install Magisk APK
2. Copy stock `init_boot_b.img` to `/sdcard/Download/`
3. In Magisk app: Install → Select and Patch a File → choose the img
4. Pull `/sdcard/Download/magisk_patched.img`

## Phase 5 — flash both in one EDL session

Working files in working directory:
- `devprg.melf`
- `vbmeta_b_patched.img` (64 KB)
- `magisk_patched.img` (8 MB)

The full working script — see source post for the complete `root_redmagic.py` (Sahara upload, firehose configure, firehose program for vbmeta_b then init_boot_b). The key constants:

```python
LUN = 4
VBMETA_SECTOR    = 490260; VBMETA_SECTORS   = 16
INITBOOT_SECTOR  = 686048; INITBOOT_SECTORS = 2048
```

Configure XML:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<data><configure MemoryName="UFS" Verbose="0" AlwaysValidate="0"
                MaxDigestTableSizeInBytes="2048"
                MaxPayloadSizeToTargetInBytes="1048576"
                ZLPAwareHost="1" SkipStorageInit="0" SkipWrite="0" Oem="ZTE"/></data>
```

Program XML template (per partition):
```xml
<?xml version="1.0" ?>
<data><program SECTOR_SIZE_IN_BYTES="4096"
              num_partition_sectors="{num}" physical_partition_number="4"
              start_sector="{start}" filename="{name}"/></data>
```

Send-data loop: chunk size 64 KB over `ep_out`, then **one** empty write to send the ZLP, then wait for the final `value="ACK"` from firehose.

After both partitions ACK:
```xml
<?xml version="1.0" ?><data><power value="reset"/></data>
```
First boot 2–3 min — Magisk should appear.

## Phase 6 — troubleshooting reference

| Symptom | Cause | Fix |
|---------|-------|-----|
| No 9008 device | Vol-button method failed | Drain battery, retry. Last resort: EDL test point. |
| Sahara not 38 chunks | Wrong programmer | Check `devprg.melf` size ~1.6 MB and `b'configure'` in binary |
| Configure NAK | ZTE→9008 transition, not clean | Re-enter via vol buttons |
| Flash succeeds but won't boot | vbmeta not patched, or wrong slot | Re-verify flags=0x02; check active slot via `fastboot getvar current-slot` |
| Stuck at "Your device is corrupt" | vbmeta verification still on | Re-flash patched vbmeta, check correct slot |

## FAQ excerpts

**Is the bootloader unlocked after this?**
> No — this method bypasses the bootloader via EDL. The bootloader remains locked. Rooted with a locked bootloader is possible on Qualcomm devices via EDL.

**Why doesn't ZTE→SWITCH_MODE work?**
> ZTE crash handler leaves USB dirty. After transition, programmer's USB reset creates a new device that Windows takes 60+ s to enumerate — programmer's 8-s watchdog fires first.

**ZLP semantics?**
> Firehose with `ZLPAwareHost="1"` expects a ZLP after data transfers that are exact multiples of USB packet size. 8 MB is a multiple of 512/1024, so ZLP is required at end. Sending ZLP after every chunk corrupts data.

**Will this work on other RM models?**
> Principles port, partition addresses don't. Dump GPT for your specific model first.

## Why this matters even now (May 2026)

Even with the toolbox unlock available, BD_Security's procedure remains the canonical *recovery* path:
- Unbricks a phone stuck in MemoryDump
- Roots a phone where the user wants to keep the bootloader locked (SafetyNet / banking-app reasons)
- Documents the firehose protocol details that any future tooling will need
