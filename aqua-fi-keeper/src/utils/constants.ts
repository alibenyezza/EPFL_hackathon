// Fichier: src/utils/constants.ts
// Constantes pour le projet Aqua Fi

// Adresses des types de jetons sur le Mainnet
export const COIN_TYPE_SUI = '0x2::sui::SUI';
export const COIN_TYPE_USDC = '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC';

// ID du Pool SUI/USDC sur le Mainnet de Cetus
export const POOL_ID = '0xb8d7d9e66a60c239e7a60110efcf8de6c705580ed924d0dde141f4a0e2c90105';

// Montants MINIMAUX pour la création de la position initiale (pour tester)
// SUI a 9 décimales, donc 100000 = 0.0001 SUI
export const DEPOSIT_SUI_AMOUNT = '100000';
// USDC a 6 décimales, donc 100 = 0.0001 USDC
export const DEPOSIT_USDC_AMOUNT = '100';

// Configuration de la stratégie "Adaptive"
export const STRATEGY_CONFIG = {
    // Si le prix sort de 25% du centre de notre fourchette, on rééquilibre.
    rebalanceThreshold: 0.25,
    // Largeur de la nouvelle fourchette (en ticks). Plus c'est petit, plus c'est concentré.
    rangeWidth: 100,
};
