# Play Integrity, attestation, and getting your keys back

Banking apps, Google Wallet, and RCS don't check for root — they check whether the device can produce a **hardware-backed attestation** that says "I am a genuine, verified-boot device". Unlocking, rooting, or restoring an EDL backup can all knock that out, and the usual community answer (import somebody else's leaked keybox) is the worst of the available fixes.

There is a better one on this family, and it uses the device's **own** keys.

## What actually breaks {#what-breaks}

Three distinct things get conflated in the threads:

| Symptom | Cause | Fix |
|---|---|---|
| `MEETS_STRONG_INTEGRITY` fails, `BASIC`/`DEVICE` pass | Bootloader state is visible to the attestation | [efisp "mode 2"](/rm10pro/reverse-engineering#efisp-modes) on RM11; on RM10, keep the bootloader locked and use [no-BL root](/rm10pro/bd-security-edl-root) |
| Everything attestation-related fails; Play Store shows "uncertified" | The attestation keys themselves are gone — typically after **restoring an EDL backup** | [RKP re-provisioning](#rkp-repair), below |
| Was working, then broke hours later after a purchase | A **custom kernel** (WildKernels/SUSFS) got detected and the keys were revoked server-side | Go back to a stock kernel — see [below](#what-re-breaks-it) |

The middle row is the one people misdiagnose. dev-reverse and several others confirm that a toolbox **Option 2 restore** leaves the device uncertified even though everything else looks healthy [RM11 #3,045 p153 Dimachi, #3,043 p153 pipes80]. Relocking the bootloader afterwards does **not** bring it back [RM11 #2848 p143].

## Diagnosing it in one command {#diagnosis}

```bash
adb shell cmd remote_provisioning certify default
```

A healthy device prints a certificate chain. A device with damaged keys throws:

```
android.security.rkp.service.RkpProxyException: ERROR_UNKNOWN: Failure in CSR v2 generation.
```

That exception is the signature of the broken state — the framework asked the TEE for a Certificate Signing Request and the TEE couldn't produce one. Confirmed on an NX789J running `RedMagicOS11.0.4MR1_GB`.

Also worth checking what provisioning instances exist:

```bash
adb shell cmd remote_provisioning list
```

A fully working device lists `default` (the TEE keymint instance) and, on builds that ship it, `avf` (the protected-VM instance).

## The RKP repair {#rkp-repair}

**Credit:** the original write-up is at [RM11 #1,565 p79], reproduced with screenshots by **Dimachi** [RM11 #3,037 p152] and endorsed over module-based fixes by **Bobo9996** [#3,046 p153] and **christopherrrg** [#3,155 p158].

### Why it works

Android has two ways to hold attestation credentials:

- The **factory keybox** — a static per-device key plus an OEM-signed certificate chain, burned in at manufacture. This is what "keybox" scene tooling fakes, using leaked boxes that Google eventually revokes and that thousands of devices share.
- **RKP (Remote Key Provisioning)** — the newer scheme. The device keeps one hardware-protected root key and asks Google's backend to issue short-lived attestation certificates on demand. The root key never leaves the TEE.

If the RKP root key is intact but the *issued* certificates are gone or stale, the device can simply ask for new ones. That's the entire trick: you are not installing keys, you are telling the device to re-provision the keys it already owns.

The vehicle is a ZTE vendor binary, `/vendor/bin/KmInstallKeybox`, which normally installs a keybox from an XML file. Its argument list is `<xml> <device-id> <scan-device-id> <rkp-mode>`, and with RKP mode enabled it **ignores the XML entirely** — which is why the procedure passes a deliberately empty one. Nothing is written over your real keybox.

### Procedure

Requires **root** and **stock RedMagic OS** — the binary and the keymint path it drives don't exist on custom ROMs, which is why this fails on EvoX and similar [RM11 #3,040 p153].

```bash
# 1. An empty file. It is never read; it just satisfies the argument parser.
adb shell su -c "touch /data/local/tmp/empty.xml"

# 2. Trigger a device-ID scan and RKP provisioning, preserving the original keybox.
#    args: <xml> <device-id=0, auto-detect> <scan device id=true> <RKP mode=true>
adb shell su -c "LD_LIBRARY_PATH=/vendor/lib64/hw /vendor/bin/KmInstallKeybox /data/local/tmp/empty.xml 0 true true"

adb reboot

# 3. Confirm the TEE can now produce a CSR.
adb shell cmd remote_provisioning certify default
adb shell cmd remote_provisioning list      # expect: default (and avf where present)

# 4. Drop Play Services' cached failure state so it re-attests.
adb shell pm clear com.google.android.gms
adb reboot
```

Afterwards, Play Store → **About** → tap the certification line → **Fix** should flip the device back to *Certified* [RM11 #3,046 p153].

:::warning `pm clear com.google.android.gms` is not free
It wipes Play Services' local state. Expect to re-approve device registration and to see some Google apps re-sync; it can also drop the Play Store's cached licences until you next go online. It is not destructive to user data, but don't run it five minutes before you need Wallet at a checkout.
:::

:::tip This is not a keybox forgery
Because the certificates come from Google's own provisioning backend, signed against the key already in your TEE, there is nothing to revoke and nothing shared with other devices. This is why the thread moved to it: **christopherrrg** replaced four modules with these five commands [RM11 #3,142 p158], and **borygo77** reports the integrity survives even after removing the helper module and rebooting [RM11 #3,132 p157].
:::

### If it doesn't work

- **Nothing happens and `certify` still throws** — the RKP root key itself may be gone rather than just the issued certs, which is the unrecoverable case. That is the point at which the thread falls back to the module stack below.
- **`su` not found** — you aren't rooted, or the shell doesn't have root granted in your manager's list [RM11 #3,041 p153].
- **You're on a custom ROM** — see above; this path is stock-only.

## The module stack, if you need it anyway {#module-stack}

Reported working together on RM11S Pro `11.5.5_GB` — all three integrity verdicts green, RCS restored, Google Pay working over NFC [RM11 #3,031, #3,033 p152 christopherrrg; corroborated #3,034, #3,036 p152 kravnos]:

- **Play Integrity Fork**
- **Tricky Store**
- **Yurikey Manager**

The standing objection from the people who moved to RKP is that fake keyboxes are **emulated keys, not your device's** [RM11 #3,155 p158] — they get revoked, and you are back where you started. Prefer the repair above; keep this as the fallback.

For hiding root itself (a separate problem from attestation), **HMA-OSS in Zygisk whitelist mode** is what borygo77 runs, and it's what fixed a PayPal login loop that survived everything else [RM11 #3,137 p157].

## What re-breaks it {#what-re-breaks-it}

:::danger A custom kernel will cost you RCS and Wallet
christopherrrg flashed an AnyKernel3 SUSFS build, got working SUSFS, and then found **RCS messages silently stopped sending** — while every integrity check still showed green [RM11 #3,152, #3,164 p158–159]. Google Wallet died on the first real purchase [RM11 #3,167 p159]. He retracted the recommendation and restored the stock kernel.
:::

borygo77's summary is the standing advice on both threads: run **LKM root on the stock kernel**, and don't reach for SUSFS unless something is actually failing without it — *"I don't need susfs to hide better if everything is working"* [RM11 #3,166 p159]. The failure is delayed by hours or days, which is what makes it so easy to misattribute to something else.
