"use strict";
// Fichier: src/core/strategy.ts
// Stratégies de rééquilibrage
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAdaptiveStrategy = checkAdaptiveStrategy;
const constants_1 = require("../utils/constants");
function checkAdaptiveStrategy(pool, position) {
    const currentTick = parseInt(pool.current_tick_index);
    const positionLower = parseInt(position.tick_lower);
    const positionUpper = parseInt(position.tick_upper);
    // Centre de la position actuelle
    const positionCenter = (positionLower + positionUpper) / 2;
    // Distance du prix actuel par rapport au centre de la position
    const distanceFromCenter = Math.abs(currentTick - positionCenter);
    const positionWidth = positionUpper - positionLower;
    const threshold = positionWidth * constants_1.STRATEGY_CONFIG.rebalanceThreshold;
    console.log(`📊 Distance du centre: ${distanceFromCenter}, Seuil: ${threshold}`);
    if (distanceFromCenter > threshold) {
        // Calculer une nouvelle fourchette centrée sur le prix actuel
        const halfWidth = constants_1.STRATEGY_CONFIG.rangeWidth / 2;
        return {
            tick_lower: currentTick - halfWidth,
            tick_upper: currentTick + halfWidth
        };
    }
    return null;
}
