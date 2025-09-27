# SNALMS Core Contracts

Smart contracts Move pour le gestionnaire automatisé de liquidité sur Sui.

## Structure

- `sources/` - Code source des contrats Move
  - `pool_factory.move` - Factory pour créer des pools AMM
  - `pool_volatile.move` - Implémentation AMM x*y=k (basé sur sc-dex)
  - `lp_token.move` - Token LP en objet Move avec Display
  - `snalm_vault.move` - Vault non-custodial + NFT-Position
  - `strategy_registry.move` - Registre des 3 stratégies (Safe/Balanced/Aggressive)
  - `events.move` - Structures d'événements centralisées
  - `utils.move` - Utilitaires mathématiques et helpers

- `tests/` - Tests unitaires
  - `pool_volatile_tests.move` - Tests pour l'AMM
  - `vault_tests.move` - Tests pour le vault
  - `strategy_registry_tests.move` - Tests pour le registre de stratégies

## Stratégies implémentées

1. **Safe Range** - ±12%, rebalance @ 8%, compound @ 0.5%
2. **Balanced** - ±7% base, ajuste selon volatilité, rebalance @ 5%
3. **Aggressive** - ±3.5%, rebalance @ 3%, min_step 1% TVL

## Déploiement

```bash
sui move build
sui move test
sui client publish --gas-budget 100000000
```
