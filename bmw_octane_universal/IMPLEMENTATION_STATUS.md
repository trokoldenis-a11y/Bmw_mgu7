# Implementation status — 0.2.0

- [x] Remove single-vehicle assumption from platform layer.
- [x] Add chassis-family registry for iDrive 7 / MGU.
- [x] Separate ECU profile registry from MGU compatibility.
- [x] Mark G30 LCI B46 DID set as candidate/unverified.
- [x] Keep RON estimate disabled unless ECU identity, DID payload, scaling and mapping are verified.
- [x] Add conservative refuel-rise confirmation logic.
- [x] Keep last-five history data model.
- [x] Add read-only ECU discovery bootstrap.
- [ ] Implement MGU UI screens.
- [ ] Integrate SGBD catalog decoder after exact catalog API is confirmed.
- [ ] Verify actual DME SGBD identifiers per vehicle/software.
- [ ] Wire persistent storage and odometer.
- [ ] Validate on real vehicle and known fuel samples.
- [ ] Build/install with a real MGU SDK.

This is a source foundation, not a finished installable OAP.
