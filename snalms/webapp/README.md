# SNALMS Web App

Interface utilisateur pour interagir avec les vaults SNALMS.

## Structure

- `src/pages/` - Pages de l'application
  - `index.tsx` - Page des stratégies (3 cartes actives + coming soon)
  - `me.tsx` - Page "Ma position" (NFT + KPIs)
- `src/components/` - Composants réutilisables
  - `WalletConnectButton.tsx` - Bouton de connexion wallet
  - `StrategyCard.tsx` - Carte d'une stratégie
  - `DepositModal.tsx` - Modal de dépôt
  - `KpiTile.tsx` - Tuile d'affichage des KPIs
  - `TxToast.tsx` - Toast de notification de transaction
- `src/lib/` - Bibliothèques utilitaires
  - `api.ts` - Client API pour les appels read-only
  - `sui.ts` - Adapter wallet Sui pour signer les transactions

## Fonctionnalités

### Page Stratégies
- Affichage des 3 stratégies actives (Safe, Balanced, Aggressive)
- Liste des stratégies "Coming Soon" pour montrer la vision
- Modal de dépôt avec sélection des montants SUI/USDC
- Gestion du slippage

### Page Ma Position
- Affichage du NFT-Position
- KPIs : fees gagnés, nombre de rebalances, value_per_share, APR, coûts
- Fonction de retrait

## Lancement

```bash
npm install
npm run dev
```

Application disponible sur http://localhost:3000
