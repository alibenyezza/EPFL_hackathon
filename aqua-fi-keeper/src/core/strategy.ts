// Fichier: src/core/strategy.ts
// Stratégies de rééquilibrage

import { STRATEGY_CONFIG } from '../utils/constants';

export interface NewTicks {
    tick_lower: number;
    tick_upper: number;
}

export function checkAdaptiveStrategy(pool: any, position: any): NewTicks | null {
    const currentTick = parseInt(pool.current_tick_index);
    const positionLower = parseInt(position.tick_lower);
    const positionUpper = parseInt(position.tick_upper);
    
    // Centre de la position actuelle
    const positionCenter = (positionLower + positionUpper) / 2;
    
    // Distance du prix actuel par rapport au centre de la position
    const distanceFromCenter = Math.abs(currentTick - positionCenter);
    const positionWidth = positionUpper - positionLower;
    const threshold = positionWidth * STRATEGY_CONFIG.rebalanceThreshold;
    
    console.log(`📊 Distance du centre: ${distanceFromCenter}, Seuil: ${threshold}`);
    
    if (distanceFromCenter > threshold) {
        // Calculer une nouvelle fourchette centrée sur le prix actuel
        const halfWidth = STRATEGY_CONFIG.rangeWidth / 2;
        
        return {
            tick_lower: currentTick - halfWidth,
            tick_upper: currentTick + halfWidth
        };
    }
    
    return null;
}
