'use strict';

/**
 * BMW Octane bootstrap.
 * The current release deliberately stops before polling candidate DIDs: the
 * vehicle identity and ECU catalog match must be verified first. This prevents
 * a guessed DID or byte scaling from being presented as a fuel octane reading.
 */
const mgu = require('./kit/mgu');
const { ReadOnlyDiag } = require('./kit/readonly-diag');
const { PLATFORM, PROFILES } = require('./profiles');

mgu.run({
    async start(ctx) {
        const { log } = ctx;
        const diag = new ReadOnlyDiag(ctx.signals, log);
        try {
            await diag.init();
            if (!diag.available) {
                log.warn('BMW Octane: diagnostic transport unavailable; showing no fuel-quality estimate.');
                return;
            }
            const units = await diag.discover({ idleMs: 2500, maxMs: 12000 });
            const dmeIndex = units.get(0x12) || null;
            log.info('BMW Octane: platform=' + PLATFORM.id + ', discovered ECUs=' + units.size);
            if (!dmeIndex) {
                log.warn('BMW Octane: DME at 0x12 was not discovered. No DID polling.');
                return;
            }
            log.info('BMW Octane: DME SGBD index=' + dmeIndex);
            log.warn('BMW Octane: SGBD-to-profile matching is not yet validated. Candidate profiles=' +
                Object.keys(PROFILES).join(', ') + '. RON estimate remains disabled.');
        } catch (e) {
            log.warn('BMW Octane diagnostic discovery failed: ' + String(e.message || e));
        }
    }
});
