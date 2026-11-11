'use strict';

const { HISTORY_LIMIT, RefuelHistory } = require('./history');
const { PROFILES, resolveProfile, canEstimateRon } = require('./profiles');

const finite = (v) => typeof v === 'number' && Number.isFinite(v);

function numericValue(x) {
    if (finite(x)) return x;
    if (x && finite(x.value)) return x.value;
    if (x && finite(x.n)) return x.n;
    return null;
}

/**
 * The function accepts already-decoded values from the repository's SGBD decoder.
 * It intentionally does not parse raw UDS frames or invent DID byte layouts.
 */
function assessFuelQuality(profile, values, validation = {}) {
    const v = values || {};
    const knockRetard = numericValue(v.knockRetardMean);
    const knockAdaptation = numericValue(v.knockAdaptation);
    const knockDetected = v.knockDetected === undefined ? null : v.knockDetected;
    if (!canEstimateRon(profile)) {
        return {
            status: 'insufficient_data',
            label: 'Недостаточно данных',
            ronEquivalent: null,
            range: null,
            confidence: null,
            reason: 'Для этой комбинации DME/SGBD не подтверждены DID, формат ответа и шкала. RON не рассчитывается.',
            diagnostics: { knockRetard, knockAdaptation, knockDetected }
        };
    }

    const adapted = numericValue(v.adaptedFuelQuality);
    if (adapted === null || !finite(validation.stableSamples) || validation.stableSamples < 12) {
        return {
            status: 'insufficient_data',
            label: 'Недостаточно данных',
            ronEquivalent: null,
            range: null,
            confidence: null,
            reason: 'Нет валидного значения или недостаточно наблюдений после заправки.',
            diagnostics: { knockRetard, knockAdaptation, knockDetected }
        };
    }
    if (adapted < 70 || adapted > 110) {
        return {
            status: 'invalid_value',
            label: 'Недостаточно данных',
            ronEquivalent: null,
            range: null,
            confidence: null,
            reason: 'Значение DME вне контрольного диапазона.',
            diagnostics: { knockRetard, knockAdaptation, knockDetected }
        };
    }

    // Confidence is intentionally not fabricated: until empirically calibrated,
    // only a data coverage indicator is returned.
    return {
        status: 'estimated',
        label: 'Расчётный эквивалент RON',
        ronEquivalent: adapted,
        range: null,
        confidence: null,
        dataQuality: 'validated_signal_only',
        reason: 'Оценка по адаптации DME, а не лабораторное измерение бензина.',
        diagnostics: { knockRetard, knockAdaptation, knockDetected }
    };
}

module.exports = {
    PROFILES,
    resolveProfile,
    assessFuelQuality,
    numericValue,
    HISTORY_LIMIT,
    RefuelHistory
};
