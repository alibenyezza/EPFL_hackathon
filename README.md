# 📑 SNALM — Sui Native Auto-Liquidity Manager  
### Résumé technique & fonctionnel (Hackathon Testnet)

---

## 🎯 Vision
Construire un gestionnaire automatisé de liquidité (LP) sur **Sui Testnet**, qui combine :  
- la richesse en stratégies de **Bunni (Ethereum)**,  
- la simplicité fluide de **Meteora (Solana)**,  
- et les avantages uniques de **Sui** *(Move Objects, exécution parallèle, frais très bas)*.  

---

## 🛠️ Objectif Hackathon
- **Réseau :** Sui Testnet  
- **DEX supporté (MVP) :** Cetus (SUI/USDC)  
- **Stratégies livrées :**
  - 3 actives et testables : **Safe Range**, **Balanced**, **Aggressive Scalper**  
  - Un catalogue design de stratégies avancées (*Stable Booster, Volatility Fader, etc.*) → visibles dans l’UI, mais activées après le hackathon.  
- **NFT-Position :** chaque dépôt = NFT Move affichant infos (stratégie, parts, TVL, fees).  
- **Automatisation :** compound + rebalance via un **keeper off-chain**.  
- **Front simple :** choisir stratégie → déposer → suivre position.  

---

## 🧩 Catalogue des stratégies

### A — Stratégies de base (livrées au hackathon)

| Nom                     | Description                                                     | Paramètres MVP |
|--------------------------|-----------------------------------------------------------------|----------------|
| **Safe Range (Passive LP)** | Large bande de prix, très peu de rebalances. Viable grâce aux frais Sui quasi nuls. | range ±12%, rebalance_threshold 8%, compound_threshold 0,5% |
| **Balanced (Dynamic Rebalance)** | Ajuste la largeur de range selon la volatilité (proxy simple off-chain). | range base ±7%, élargir si vol ↑, resserrer si vol ↓, rebalance_threshold 5% |
| **Aggressive Scalper (HF market-making)** | Range serrée + rebalances fréquents, exploite le parallélisme de Sui. | range ±3,5%, rebalance_threshold 3%, min step 1% |

### B — Stratégies avancées (design pour V2+)

- **Stable Pair Booster** — Optimisation spécifique paires stables, micro-compound.  
- **Volatility Fader** — Range variable selon calme/volatilité.  
- **Adaptive AI Strategy** — Moteur ML off-chain qui ajuste la largeur du range en continu.  
- **Cross-Pool Hedged LP** — Deux positions corrélées (SUI/USDC & SUI/ETH) pour réduire l’IL.  
- **Event-Triggered LP** — Stratégie qui s’adapte à un événement oraclé (macro, tweet, météo).  
- **Community Vaults** — Dépôts groupés + votes DAO sur les paramètres.  
- **NFT-Tradable Strategies** — Positions LP transformées en NFT revendables.  
- **IL Insurance Mode** — Fonds d’assurance alimenté par une fraction des fees.  
- **Real-World Index Strategy** — Range adossé à un indice macro (volatilité crypto, taux US).  

👉 **Hackathon :** montrer 3 stratégies qui tournent. Les autres seront listées dans l’UI comme *coming soon* pour prouver la vision.  

---

## ⚙️ Architecture

### On-chain (Move / Sui Testnet)
- **StrategyRegistry (lite)** : stocke les paramètres des 3 stratés actives.  
- **VaultFactory** : instancie un Vault par {pair, stratégie}.  
- **Vault** : gère dépôts/retraits, calcule parts, émet événements (*Deposit, Withdraw, Rebalance, CollectFees*), frappe/brûle un **NFT-Position**.  
- **DEXAdapter (Cetus)** : appels add/remove liquidity, collect fees, lecture prix pool.  
- **Oracle (MVP)** : prix du pool comme proxy. *(Optionnel → intégrer Pyth).*  

### Off-chain
- **Keeper Bot (Node/TS ou Python)** : boucle X minutes → lit prix & état vault → déclenche `rebalance()` ou `collectFees()` selon règles de la stratégie.  
- **Mini-Indexer** : écoute événements → persiste dans SQLite.  
- **API (FastAPI/NestJS)** :
  - `GET /strategies` (paramètres & status active/soon)  
  - `GET /vault/metrics` (TVL, fees, nb rebalances, APR estimé)  
  - `GET /user/:addr/positions`  

### Front
- UI minimale avec 2 pages :  
  - **Stratégies** (cartes : Safe, Balanced, Aggressive + les autres en “coming soon”)  
  - **Ma position** (NFT, parts, TVL, fees, APR, nb rebalances)  

---

## 🔢 Paramètres par défaut
- **Safe Range :** ±12%, rebalance si écart > 8%  
- **Balanced :** ±7% ajusté (±10% si vol ↑, ±5% si vol ↓), rebalance si écart > 5%  
- **Aggressive Scalper :** ±3,5%, rebalance si écart > 3%, tick time-based (N min)  

*(à durcir en Move et afficher via API/Front)*  

