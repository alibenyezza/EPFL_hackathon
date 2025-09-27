# SNALMS Keeper Bot

Service automatisé qui surveille les vaults et déclenche les rebalances selon les stratégies définies.

## Structure

- `src/index.ts` - Boucle principale du keeper
- `src/sui.ts` - SDK Sui pour construire/signer/envoyer les transactions
- `src/strategies/` - Logique des 3 stratégies
  - `safe.ts` - Stratégie Safe Range
  - `balanced.ts` - Stratégie Balanced avec calcul de volatilité (ATR/TWAP)
  - `aggressive.ts` - Stratégie Aggressive Scalper
- `src/config.ts` - Configuration et variables d'environnement

## Configuration

Copier `.env.example` vers `.env` et remplir :

```env
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
PRIVATE_KEY=your_private_key
VAULT_ID=your_vault_object_id
LOOP_INTERVAL_SEC=300
```

## Lancement

```bash
npm install
npm run dev
```

## Logs

Le keeper génère des logs JSON avec :
- timestamp
- action (rebalance/collect)
- tx_hash
- gas_cost
- inputs (prix, volatilité, seuils)
