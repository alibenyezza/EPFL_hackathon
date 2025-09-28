# 🚀 Système TWAP - Guide Complet

## 📋 Scripts Disponibles

### **Création d'Ordres TWAP**

#### `create-twap-simple.ps1` - Création Simple
```bash
.\create-twap-simple.ps1 [MONTANT] [NOMBRE_ORDRES] [INTERVALLE_SECONDES]

# Exemples :
.\create-twap-simple.ps1 2.0 10 120    # 2 SUI, 10 swaps, 2 minutes
.\create-twap-simple.ps1 1.5 5 60     # 1.5 SUI, 5 swaps, 1 minute
.\create-twap-simple.ps1 0.5 3 30     # 0.5 SUI, 3 swaps, 30 secondes
```

### **Gestion des Ordres TWAP**

#### `list-twap.ps1` - Lister Tous les Ordres
```bash
.\list-twap.ps1
```
- Affiche tous vos ordres TWAP actifs
- Montre le statut, progression, et détails de chaque ordre

#### `cancel-twap-fixed.ps1` - Annuler un Ordre Spécifique
```bash
.\cancel-twap-fixed.ps1 [ORDER_ID]
.\cancel-twap-fixed.ps1  # Liste les ordres et demande lequel annuler
```

#### `cancel-all-twap.ps1` - Annuler TOUS les Ordres (avec confirmation)
```bash
.\cancel-all-twap.ps1
```
- Affiche les détails de chaque ordre
- Demande confirmation avant annulation
- Annule tous les ordres TWAP en une fois

#### `cancel-all-twap-quick.ps1` - Annulation Rapide (sans confirmation)
```bash
.\cancel-all-twap-quick.ps1
```
- Annule automatiquement tous les ordres TWAP
- Pas de confirmation requise
- Idéal pour les scripts automatisés

### **Surveillance et Exécution**

#### `monitor-twap.ps1` - Surveillance Continue
```bash
.\monitor-twap.ps1
```
- Surveille l'exécution des ordres TWAP
- Affiche les swaps en temps réel

#### `execute-twap.ps1` - Exécution Manuelle
```bash
.\execute-twap.ps1 [ORDER_ID]
```
- Exécute manuellement un swap TWAP
- Utile pour forcer l'exécution avant l'intervalle

### **Démonstration**

#### `demo-twap.ps1` - Démonstration Complète
```bash
.\demo-twap.ps1
```
- Crée un ordre de test
- Montre le fonctionnement complet
- Annule automatiquement l'ordre de test

## 🎯 **Commandes Directes Sui**

### Créer un Ordre TWAP
```bash
sui client call --package 0x320f72b44af6155c55d921dfd10d4447649b2a9463f95b535caa39cf7582e3dc --module cetus_position --function create_twap_order --args [SUI_COIN_ID] [USDC_COIN_EMPTY] [NOMBRE_ORDRES] [INTERVALLE_MS] 0x6 --type-args 0x2::sui::SUI 0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC --gas-budget 10000000
```

### Annuler un Ordre TWAP
```bash
sui client call --package 0x320f72b44af6155c55d921dfd10d4447649b2a9463f95b535caa39cf7582e3dc --module cetus_position --function cancel_twap_order --args [ORDER_ID] --type-args 0x2::sui::SUI 0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC --gas-budget 5000000
```

## 📊 **Stratégies TWAP Recommandées**

### 🚀 **Agressif** (Volatilité élevée)
- **Intervalle** : 30-60 secondes
- **Nombre d'ordres** : 20-50
- **Usage** : Marchés très volatils

### ⚖️ **Modéré** (Volatilité moyenne)
- **Intervalle** : 2-5 minutes
- **Nombre d'ordres** : 10-20
- **Usage** : Marchés normaux

### 🐌 **Conservateur** (Volatilité faible)
- **Intervalle** : 10-30 minutes
- **Nombre d'ordres** : 5-15
- **Usage** : Marchés stables

## 🔧 **Configuration Avancée**

### Paramètres Personnalisés
```bash
# TWAP Ultra-Rapide (pour scalping)
.\create-twap-simple.ps1 1.0 30 15    # 1 SUI, 30 swaps, 15 secondes

# TWAP Long Terme (pour DCA)
.\create-twap-simple.ps1 5.0 20 1800   # 5 SUI, 20 swaps, 30 minutes

# TWAP de Test (petit montant)
.\create-twap-simple.ps1 0.1 3 30      # 0.1 SUI, 3 swaps, 30 secondes
```

## ⚠️ **Points Importants**

1. **Frais de Gas** : Chaque swap coûte des frais de gas
2. **Coins USDC** : Créez des coins USDC vides avec `sui client split-coin`
3. **Surveillance** : Utilisez `list-twap.ps1` pour vérifier l'état
4. **Annulation** : `cancel-all-twap.ps1` pour tout annuler rapidement

## 🎉 **Workflow Recommandé**

1. **Vérifier** : `.\list-twap.ps1`
2. **Créer** : `.\create-twap-simple.ps1 [paramètres]`
3. **Surveiller** : `.\monitor-twap.ps1`
4. **Annuler si besoin** : `.\cancel-all-twap.ps1`

**Vous maîtrisez maintenant complètement le système TWAP !** 🚀
