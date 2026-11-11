'use strict';

/**
 * Vehicle support is deliberately split into head-unit compatibility and ECU
 * calibration support. MGU/iDrive 7 does NOT imply a common DME, SGBD or DID map.
 *
 * Only profiles with an exact, verified ECU identity AND verified DID decoding
 * may enable a fuel-quality estimate. Unknown combinations remain diagnostics-only.
 */
const PLATFORM = Object.freeze({
    id: 'bmw_id7_mgu',
    label: 'BMW iDrive 7 / MGU',
    supportedChassisFamilies: Object.freeze([
        'G01', 'G02', 'G05', 'G06', 'G07', 'G20', 'G21',
        'G22', 'G23', 'G26', 'G29', 'G30', 'G31', 'G32'
    ])
});

// Candidate DID list is research metadata, NOT proof of applicability or scaling.
const PROFILES = Object.freeze({
    g30_lci_b46_candidate: Object.freeze({
        id: 'g30_lci_b46_candidate',
        chassis: 'G30 LCI',
        engine: 'B46',
        model: '520I',
        years: [2021, 2022, 2023],
        ecuAddress: 0x12,
        expectedSgbd: null, // Must be filled only from a verified ECU/SGBD catalog match.
        status: 'candidate_unverified',
        fuelQuality: {
            did: 0x5776,
            semantic: 'adapted_fuel_quality_candidate',
            payloadVerified: false,
            scalingVerified: false,
            ronMappingVerified: false
        },
        diagnostics: {
            ignitionAngle: 0x59FA,
            knockDetected: 0x4A36,
            knockRetardMean: 0x554C,
            knockAdaptation: 0x554A,
            cylinderIgnition: [0x4A49, 0x4A4A, 0x4A4C, 0x4A4D, 0x4A4E, 0x4A4F]
        },
        tank: { did: 0x583B, timeSinceRefuel: 0x57E3, verified: false }
    })
});

function normaliseIdentity(identity) {
    const x = identity || {};
    return {
        chassis: String(x.chassis || '').toUpperCase(),
        engine: String(x.engine || '').toUpperCase(),
        model: String(x.model || '').toUpperCase(),
        year: Number(x.year) || null,
        sgbd: String(x.sgbd || '').toUpperCase(),
        ecuAddress: Number.isInteger(x.ecuAddress) ? x.ecuAddress : null
    };
}

function resolveProfile(identity) {
    const x = normaliseIdentity(identity);
    for (const p of Object.values(PROFILES)) {
        if (p.chassis !== x.chassis || p.engine !== x.engine) continue;
        if (p.model && x.model && p.model !== x.model) continue;
        if (x.year && (x.year < p.years[0] || x.year > p.years[1])) continue;
        if (p.expectedSgbd && p.expectedSgbd !== x.sgbd) continue;
        if (p.ecuAddress !== x.ecuAddress) continue;
        return p;
    }
    return null;
}

function canEstimateRon(profile) {
    const f = profile && profile.fuelQuality;
    return !!(profile && profile.status === 'verified' && f &&
        f.payloadVerified && f.scalingVerified && f.ronMappingVerified);
}

module.exports = { PLATFORM, PROFILES, normaliseIdentity, resolveProfile, canEstimateRon };
