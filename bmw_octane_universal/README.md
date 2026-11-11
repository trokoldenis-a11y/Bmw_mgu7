# BMW Octane — universal iDrive 7 / MGU foundation

**Version:** 0.2.0  
**Target head unit:** BMW MGU / iDrive 7  
**Initial ECU research target:** G30 LCI 520i B46 (2021)

## Scope

The app shell targets BMW vehicles using iDrive 7 / MGU, including G01, G05, G07,
G20 and G30/G31 families. This is head-unit/platform compatibility, not a claim
that all those vehicles share the same engine ECU, SGBD catalog, DID layout or
fuel-quality adaptation.

The code separates:
1. MGU application/runtime compatibility;
2. chassis/engine/ECU identity;
3. ECU-specific DID definitions and SGBD decoding;
4. the evidence required before any RON-equivalent estimate is enabled.

Unknown ECU combinations must remain in **Недостаточно данных** state.

## Safety and measurement policy

- Read-only diagnostic transport only.
- No DME coding, writes, adaptations, clearing faults or reset services.
- Do not parse raw DID payloads without catalog-defined field offsets, lengths,
  signedness and scaling.
- Do not infer RON directly from knock retard or ignition timing.
- RON-equivalent display requires a verified ECU identity, verified DID payload,
  verified scaling and a validated mapping against known fuel samples.
- Until those gates are met, show knock/ignition values only when their own
  decoding is confirmed; otherwise omit them.
- Tank-level rise is only a refuelling event hint. Volume is approximate, and
  consecutive confirmation is used to reduce false triggers.
- Refuelling history stores date (not time), odometer, estimated litres, estimate
  range and confidence/data-quality field. No tank level or time-of-day is shown.

## Current implementation status

### Implemented in this source package
- Universal MGU/iDrive 7 platform descriptor and chassis-family registry.
- Separate ECU profile registry; unknown combinations do not inherit B46 DIDs.
- G30 LCI B46 candidate profile clearly marked unverified.
- RON gate requires explicit profile verification flags.
- History helper: last five refuels, manual entry API and conservative tank-rise
  detection with confirmation.
- Diagnostic bootstrap discovers ECU 0x12 and logs SGBD index without decoding
  candidate DIDs.

### Not yet implemented / must be validated
- Exact SGBD index-to-engine/ECU mapping for each supported vehicle.
- DME catalog decoder integration and exact candidate DID semantics.
- Live display screens and history screen.
- Persistent storage wiring to `ctx.dataDir`.
- Odometer signal binding and manual fallback UI.
- Automatic refuel detection tested against actual tank-level signal behaviour.
- Validation against known petrol samples before RON estimates can be enabled.
- Full SDK build and installation on a physical MGU head unit.

## Why RON is currently disabled

The original candidate DID `0x5776` and associated knock/ignition identifiers
are not yet proven to have the same meaning, payload and scaling across the
vehicle fleet. A DME-adapted fuel-quality parameter is not itself a laboratory
RON measurement. The app therefore refuses to output a number until each
vehicle-specific validation gate is explicitly satisfied.

## Repository integration

This folder is intended to be copied into the upstream `idrive7-apps` repository
as `apps/bmw_octane/`. It depends on the repository's bundled `kit/` runtime,
especially `kit/mgu.js` and `kit/readonly-diag.js`.

A successful offline preview is not an installable package. A full build requires
the SDK extracted from the user's own MGU head unit. No SDK or private key is
included in this source archive.
