# 📑 SNALM — Sui Native Auto-Liquidity Manager

Gestionnaire automatisé de liquidité sur Sui Testnet avec stratégies avancées et NFT-Position.

## 🎯 Vision

Combiner :
- La richesse en stratégies de **Bunni (Ethereum)**
- La simplicité fluide de **Meteora (Solana)** 
- Les avantages uniques de **Sui** (Move Objects, exécution parallèle, frais très bas)

## 🗂️ Structure du projet (monorepo)

```
snalms/
├─ contracts/snalms_core/     # Smart contracts Move
├─ services/
│  ├─ keeper/                 # Bot de rebalance automatique
│  ├─ indexer/               # Indexation événements + KPIs
│  └─ api/                   # API REST
└─ webapp/                   # Interface utilisateur
```

## 🧩 Stratégies implémentées

### Actives (MVP Hackathon)
- **Safe Range** - ±12%, rebalance @ 8%, compound @ 0.5%
- **Balanced** - ±7% base, ajuste selon volatilité, rebalance @ 5%
- **Aggressive Scalper** - ±3.5%, rebalance @ 3%, min_step 1%

### Coming Soon (V2+)
- Stable Pair Booster
- Volatility Fader
- Adaptive AI Strategy
- Cross-Pool Hedged LP
- Event-Triggered LP
- Community Vaults
- NFT-Tradable Strategies
- IL Insurance Mode
- Real-World Index Strategy

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- Sui CLI
- SQLite

### Installation

```bash
# Cloner le projet
git clone <repo-url>
cd snalms

# Déployer les contrats
cd contracts/snalms_core
sui move build
sui move test
sui client publish --gas-budget 100000000

# Lancer les services
cd ../../services/keeper
npm install && npm run dev

cd ../indexer  
npm install && npm run dev

cd ../api
npm install && npm run dev

# Lancer l'interface
cd ../../webapp
npm install && npm run dev
```

## 🔧 Configuration

Chaque service a son propre `.env.example` à copier et configurer :

- **Keeper** : RPC Sui, clé privée, ID du vault
- **Indexer** : RPC Sui, base SQLite  
- **API** : Port, connexion à l'indexer
- **WebApp** : URL de l'API

## 📊 Fonctionnalités

### Smart Contracts (Move)
- Pool AMM x*y=k (basé sur sc-dex)
- Vault non-custodial avec NFT-Position
- Registre de stratégies paramétrable
- Événements pour indexation

### Services Backend
- **Keeper** : Surveillance et rebalance automatique
- **Indexer** : Calcul des KPIs en temps réel
- **API** : Endpoints pour stratégies, métriques et positions

### Interface Web
- Sélection de stratégie et dépôt
- Suivi de position avec NFT
- Métriques détaillées (APR, fees, rebalances)

## 🧪 Tests

```bash
# Tests des contrats
cd contracts/snalms_core
sui move test

# Tests des services (à implémenter)
cd services/keeper
npm test
```

## 📈 Métriques trackées

- Value per share
- APR estimé
- Fees collectés
- Nombre de rebalances
- Coûts de transaction
- TVL par stratégie

## 🤝 Contribution

Voir les README spécifiques de chaque module pour les détails d'implémentation.

## 📄 Licence

MIT
