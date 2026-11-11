'use strict';

const HISTORY_LIMIT = 5;
const finite = (v) => typeof v === 'number' && Number.isFinite(v);
const validDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

class RefuelHistory {
    constructor(saved, options = {}) {
        this.items = Array.isArray(saved) ? saved.filter(RefuelHistory.valid).slice(0, HISTORY_LIMIT) : [];
        this.thresholdLitres = finite(options.thresholdLitres) ? options.thresholdLitres : 5;
        this.confirmationsRequired = finite(options.confirmationsRequired) ? options.confirmationsRequired : 2;
        this.previousTankLitres = null;
        this.pendingRise = null;
    }

    static valid(x) {
        return !!x && validDate(x.date) &&
            finite(x.odometerKm) && x.odometerKm >= 0 &&
            finite(x.litres) && x.litres > 0;
    }

    add({ date, odometerKm, litres, ronRange = null, confidence = null, source = 'manual' }) {
        const entry = {
            date, odometerKm, litres,
            ronRange: Array.isArray(ronRange) ? ronRange.slice(0, 2) : null,
            confidence: finite(confidence) ? Math.max(0, Math.min(100, confidence)) : null,
            source
        };
        if (!RefuelHistory.valid(entry)) throw new Error('Некорректные данные заправки');
        this.items.unshift(entry);
        this.items = this.items.slice(0, HISTORY_LIMIT);
        return entry;
    }

    /**
     * Tank level is an internal trigger only; never expose it in the history UI.
     * A rise must persist across consecutive observations to reduce slope/slosh
     * false positives. Litres are explicitly an estimate from tank-level delta.
     */
    observeTank({ date, odometerKm, tankLitres, ronRange = null, confidence = null }) {
        if (!finite(tankLitres) || tankLitres < 0) return null;
        if (!finite(this.previousTankLitres)) {
            this.previousTankLitres = tankLitres;
            return null;
        }
        const rise = tankLitres - this.previousTankLitres;
        this.previousTankLitres = tankLitres;

        if (rise >= this.thresholdLitres) {
            if (!this.pendingRise || Math.abs(this.pendingRise.rise - rise) > 3) {
                this.pendingRise = { rise, count: 1 };
                return null;
            }
            this.pendingRise.rise = Math.max(this.pendingRise.rise, rise);
            this.pendingRise.count += 1;
            if (this.pendingRise.count < this.confirmationsRequired) return null;
            const litres = this.pendingRise.rise;
            this.pendingRise = null;
            return this.add({
                date, odometerKm, litres, ronRange, confidence,
                source: 'estimated_from_tank_level'
            });
        }
        this.pendingRise = null;
        return null;
    }

    toJSON() { return this.items.slice(0, HISTORY_LIMIT); }
}

module.exports = { HISTORY_LIMIT, RefuelHistory };
