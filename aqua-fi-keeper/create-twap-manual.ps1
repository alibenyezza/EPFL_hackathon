# Script PowerShell pour créer un ordre TWAP manuellement
# Configuration TWAP Conservative: 1 SUI, 10 ordres, 60s d'intervalle

Write-Host "⏳ === CRÉATION MANUELLE D'ORDRE TWAP ===" -ForegroundColor Green
Write-Host "💰 Configuration Conservative:" -ForegroundColor Yellow
Write-Host "   - Montant total: 1 SUI (1000000000 MIST)" -ForegroundColor White
Write-Host "   - Nombre de swaps: 10" -ForegroundColor White  
Write-Host "   - Intervalle: 60 secondes" -ForegroundColor White
Write-Host "   - Montant par swap: 0.1 SUI" -ForegroundColor White
Write-Host ""

# Paramètres
$PACKAGE_ID = "0xb77c5df0d1ce9d4513069e657e4beca98350ed3d5b9e296696d31412487336fc"
$SUI_COIN = "0x21f6675c8108c9753b58de077d99225a6725ba05e7016081f9d209c099c462ef"  # Coin SUI principal
$USDC_COIN_EMPTY = "0x38dbf8728468d2719a019234e280b7ac010b998e9d88d34423cc13e2e5446bcc"  # Coin USDC vide créé
$TOTAL_AMOUNT = 1000000000  # 1 SUI
$TOTAL_ORDERS = 10
$INTERVAL_MS = 60000  # 60 secondes

Write-Host "🔄 Préparation de la transaction..." -ForegroundColor Blue

# Note: Cette commande ne fonctionnera que quand le contrat TWAP sera publié
$command = "sui client call --package $PACKAGE_ID --module cetus_position --function create_twap_order --args $SUI_COIN $USDC_COIN_EMPTY $TOTAL_ORDERS $INTERVAL_MS 0x6 --type-args 0x2::sui::SUI 0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC --gas-budget 10000000"

Write-Host "📋 Commande à exécuter une fois le contrat TWAP publié:" -ForegroundColor Green
Write-Host $command -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  ATTENTION: Le contrat TWAP n'est pas encore publié à cause du problème de permissions Move.lock" -ForegroundColor Red
Write-Host "💡 Solution temporaire: Utilisez les positions Buy The Dip qui sont déjà actives!" -ForegroundColor Yellow
