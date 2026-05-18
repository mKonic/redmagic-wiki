# De-Googling without root

This is **zcink's path** [#501 p26]: for users who want to take control of their device but can't or won't go through the unlock/root process, you can still meaningfully reduce Google's footprint via Settings → Apps → Disable / Uninstall (for user) on stock RedMagicOS.

> *"Google is fixin' to destroy Android by August/September. If we cannot root this phone we can DeGoogle it without root."*

## What zcink confirmed works (no root)

- Disable / uninstall (for user) the Google apps that RM10 Pro's UI offers a button for.
- Install replacements you trust (keyboard, gallery, photos, etc.).
- **Uninstall the Android updater app** to prevent forced upgrades (this is the part most relevant to keeping the unlock window open).

## What you can't do without root

- Flash custom ROMs (bootloader stays locked)
- Block ads/telemetry at the system level
- Remove pre-installed Google services (Play Services, GMS) — these are required for many third-party apps to work and refuse to uninstall

## Why he recommends not updating past current A16 build

> *"I don't suggest any more updates beyond the current Android 16 because no doubt it will lock down the phone in compliance with Google's new policies. I don't think RedMagic is going to do anymore updates anyway. I uninstalled the Android updater app so it cannot be updated further."*

This dovetails with the ZTE-fuse warnings — even if you're not chasing root, killing the updater protects your unlock path for future use.

## Pre-installed app inventory

Not captured in-thread; varies between Global, EEA, and CN ROMs. Use a system app lister (e.g. `App Manager` from F-Droid) to enumerate before bulk-disabling. **Test one disable at a time** if you go beyond the obvious Google bundle — wrong removals can cause boot loops or services crashes [zcink].

## ADB-level removal (still no root)

For Google apps that won't disable via Settings, you can use ADB without root:

```bash
adb shell pm list packages | grep google
adb shell pm uninstall --user 0 com.google.example.package
```

This removes for the primary user only and is reversible with:
```bash
adb shell cmd package install-existing com.google.example.package
```

zcink didn't mention this method explicitly — included here for completeness since it's the standard no-root degoogling path and applies cleanly to NX789J.

## Related: zcink's stance on unlocking

He pursued unlock + root for full degoogling but found this stop-gap useful while the toolbox unlock was still RM11-only. With unlock now landed (May 2026), this path is mostly for users who deliberately want to keep the bootloader locked (banking apps, SafetyNet) — pair with [Path D: toolbox no-BL root via KernelSU](/rm10pro/root-magisk#path-d--toolbox-driven-kernelsu-no-bl-root) if you change your mind.
