// Configuration exemple pour le Keeper Bot SNALMS
// Copier vers config.ts et modifier les valeurs

export const config = {
  // Configuration Sui
  sui: {
    rpcUrl: 'https://fullnode.testnet.sui.io:443',
    privateKey: 'your_private_key_here', // Format hex sans 0x
    network: 'testnet' as const,
    gasPrice: 1000,
    maxGasBudget: 100000000,
  },

  // IDs des contrats
  contracts: {
    vaultId: '0x...', // ID de l'objet Vault à surveiller
    strategyRegistryId: '0x...', // ID du registre de stratégies
    poolFactoryId: '0x...', // ID de la factory de pools
  },

  // Paramètres du keeper
  keeper: {
    loopIntervalSec: 300, // 5 minutes
    maxRetries: 3,
    retryDelay: 5000, // 5 secondes
  },

  // Paramètres des stratégies (fallback si non lisibles on-chain)
  strategies: {
    safe: {
      rangePercent: 12,
      rebalanceThreshold: 8,
      compoundThreshold: 0.5,
    },
    balanced: {
      baseRange: 7,
      rebalanceThreshold: 5,
      volatilityWindow: 24, // heures pour calcul ATR
    },
    aggressive: {
      rangePercent: 3.5,
      rebalanceThreshold: 3,
      minStepPercent: 1,
    },
  },

  // Logging
  logging: {
    level: 'info' as const,
    format: 'json' as const,
  },
};

export type Config = typeof config;
