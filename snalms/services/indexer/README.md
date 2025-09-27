# SNALMS Indexer

Service d'indexation des événements on-chain et calcul des KPIs.

## Structure

- `src/listener.ts` - Écoute les événements du pool et du vault
- `src/db.ts` - Gestion de la base SQLite et requêtes
- `src/kpi.ts` - Calcul des KPIs (value_per_share, APR, coûts)
- `schema.sql` - Schéma de la base de données

## Base de données

Tables principales :
- `events` - Tous les événements on-chain
- `vault_snapshots` - Snapshots périodiques des vaults
- `user_positions` - Positions des utilisateurs

## KPIs calculés

- `value_per_share` - Valeur par part du vault
- `apr_estimated` - APR estimé basé sur l'historique
- `tx_cost_total` - Coût total des transactions
- `rebalance_count` - Nombre de rebalances effectués

## Lancement

```bash
npm install
npm run dev
```
