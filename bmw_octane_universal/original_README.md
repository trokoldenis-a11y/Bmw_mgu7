# BMW Octane — G30 LCI B46 (prototype source)

Target: BMW G30 LCI 520i B46, model year 2021, MGU / iDrive 7.

This package is the first diagnostic/core layer. It is **not yet a ready-to-install MGU package**:
the B46 DME address, SGBD variant, DID availability, DID decoding and signal availability
must be verified on the actual vehicle before the RON display is enabled.

## Safety and interpretation
- All diagnostic requests go through the repository's `ReadOnlyDiag` API.
- Only UDS ReadDataByIdentifier (`0x22`) reads are used.
- No coding, adaptations, resets, write services or actuator commands.
- Knock retard and ignition corrections are not direct octane measurements.
- `5776` is treated as a candidate adapted fuel-quality value, not assumed valid.
- Until the DID is validated and its scaling confirmed, the UI must say
  **"Недостаточно данных"**, not invent a RON value.

## Files
- `apps/bmw_octane/octane.js`: profile, DID read plan, data validation, confidence gate,
  and persistent last-five refuelling history.
- `apps/bmw_octane/app.json`: initial MGU app metadata and required TASU signal.
- `apps/bmw_octane/main.js`: conservative runtime entry point; performs read-only discovery
  and records diagnostic availability. A final screen renderer is intentionally pending
  validation of the vehicle-specific DME response.

## Integration
Copy `apps/bmw_octane/` into the repository's `apps/` directory, then run the repository's
normal build and test tools. Do not install on the car until the app builds cleanly and the
DME values have been compared against a trusted diagnostic tool.

## Vehicle validation checklist
1. Read functional `22 F1 50`; confirm the engine ECU at address `0x12`.
2. Record the returned SGBD index and identify the actual B46 DME variant.
3. Read the candidate DIDs individually: `5776`, `59FA`, `4A36`, `554C`, `554A`.
4. Compare decoded values and units with ISTA / a trusted BMW diagnostic logger.
5. Confirm odometer and fuel-tank signals from SOME/IP on this specific G30.
6. Only then enable the adapted fuel-quality display and calculate confidence from valid,
   stable observations after refuelling.

No real-vehicle test has been performed as part of this source package.
