# Implementation status

## Implemented in this source package
- G30 LCI B46 target profile.
- Read-only diagnostic discovery through the repository's `ReadOnlyDiag`.
- Candidate DID read plan for adapted fuel quality, ignition and knock.
- Conservative confidence gate: no RON result until DID and scaling are validated.
- Last-five refuelling history model with date, odometer, litres, estimate range and confidence.
- Conservative tank-rise event detector; tank-delta volume is explicitly marked estimated.

## Not yet completed / requires the car
- Confirm actual B46 DME SGBD and physical ECU address on the target G30.
- Confirm DID 5776 response format and conversion against ISTA.
- Validate all ignition/knock DID lengths and scaling.
- Confirm odometer SOME/IP signal on the actual head unit.
- Finish the visual HMI screen and wire history persistence to `ctx.dataDir`.
- Run repository build/test tools and install-test on the vehicle.

`main.js` is a diagnostic bring-up stub, not a finished dashboard or installable release.
