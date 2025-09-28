#!/bin/bash
# Script pour créer les positions multi-range Buy The Dip

echo "🚀 === CRÉATION DES POSITIONS MULTI-RANGE BUY THE DIP ==="

# Configuration
PACKAGE_ID="0xb77c5df0d1ce9d4513069e657e4beca98350ed3d5b9e296696d31412487336fc"
POOL_ID="0x51e883ba7c0b566a26cbc8a94cd33eb0abd418a77cc1e60ad22fd9b1f29cd2ab"

# Récupérer le tick actuel du pool
echo "📈 Récupération du prix actuel..."
CURRENT_TICK=57617  # Remplacez par le tick actuel

echo "📊 Prix actuel (tick): $CURRENT_TICK"

# Calculer les ranges pour Buy The Dip
# Range 1: 2% dip
TICK_1_CENTER=$((CURRENT_TICK - CURRENT_TICK * 2 / 100))
TICK_1_LOWER=$((TICK_1_CENTER - 25))
TICK_1_UPPER=$((TICK_1_CENTER + 25))

# Range 2: 5% dip  
TICK_2_CENTER=$((CURRENT_TICK - CURRENT_TICK * 5 / 100))
TICK_2_LOWER=$((TICK_2_CENTER - 50))
TICK_2_UPPER=$((TICK_2_CENTER + 50))

# Range 3: 10% dip
TICK_3_CENTER=$((CURRENT_TICK - CURRENT_TICK * 10 / 100))
TICK_3_LOWER=$((TICK_3_CENTER - 75))
TICK_3_UPPER=$((TICK_3_CENTER + 75))

# Range 4: 20% dip
TICK_4_CENTER=$((CURRENT_TICK - CURRENT_TICK * 20 / 100))
TICK_4_LOWER=$((TICK_4_CENTER - 100))
TICK_4_UPPER=$((TICK_4_CENTER + 100))

echo "📊 Ranges calculés:"
echo "   1. Dip léger (2%): [$TICK_1_LOWER, $TICK_1_UPPER]"
echo "   2. Dip modéré (5%): [$TICK_2_LOWER, $TICK_2_UPPER]" 
echo "   3. Dip important (10%): [$TICK_3_LOWER, $TICK_3_UPPER]"
echo "   4. Crash (20%): [$TICK_4_LOWER, $TICK_4_UPPER]"

echo ""
echo "💡 Utilisez ces commandes pour créer les positions manuellement:"
echo ""
echo "# Position 1 (2% dip):"
echo "sui client call --package $PACKAGE_ID --module cetus_position --function create_position --args $POOL_ID $TICK_1_LOWER $TICK_1_UPPER [SUI_COIN_ID] [USDC_COIN_ID] 0x6 --type-args 0x2::sui::SUI 0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC --gas-budget 5000000"
echo ""
echo "# Position 2 (5% dip):"
echo "sui client call --package $PACKAGE_ID --module cetus_position --function create_position --args $POOL_ID $TICK_2_LOWER $TICK_2_UPPER [SUI_COIN_ID] [USDC_COIN_ID] 0x6 --type-args 0x2::sui::SUI 0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC --gas-budget 5000000"
echo ""
echo "# Position 3 (10% dip):"
echo "sui client call --package $PACKAGE_ID --module cetus_position --function create_position --args $POOL_ID $TICK_3_LOWER $TICK_3_UPPER [SUI_COIN_ID] [USDC_COIN_ID] 0x6 --type-args 0x2::sui::SUI 0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC --gas-budget 5000000"
echo ""
echo "# Position 4 (20% dip):"
echo "sui client call --package $PACKAGE_ID --module cetus_position --function create_position --args $POOL_ID $TICK_4_LOWER $TICK_4_UPPER [SUI_COIN_ID] [USDC_COIN_ID] 0x6 --type-args 0x2::sui::SUI 0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC --gas-budget 5000000"
