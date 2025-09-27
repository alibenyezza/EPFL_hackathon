# SNALMS API

API REST pour exposer les données des vaults et stratégies.

## Structure

- `src/server.ts` - Serveur FastAPI/NestJS/Express
- `src/routes/` - Définition des routes
  - `strategies.ts` - GET /strategies
  - `vault.ts` - GET /vault/metrics
  - `user.ts` - GET /user/:address/positions
- `src/services/` - Services pour accéder aux données de l'indexer

## Endpoints

### GET /strategies
Retourne la liste des stratégies disponibles avec leurs paramètres.

### GET /vault/metrics
Retourne les métriques globales des vaults :
- TVL total
- Fees collectés
- Nombre de rebalances
- APR moyen

### GET /user/:address/positions
Retourne les positions d'un utilisateur :
- NFT-Position IDs
- Valeur des parts
- Fees gagnés
- Historique des transactions

## Lancement

```bash
npm install
npm run dev
```

API disponible sur http://localhost:3001
