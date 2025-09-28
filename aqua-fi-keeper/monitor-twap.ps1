# Script PowerShell pour surveiller l'ordre TWAP

$TWAP_ORDER_ID = "0x3a5d2771ba759ffa57b1fb77ad8795d96ed24ae096b08f7f52b3b97f8b5d4114"

Write-Host "👁️  === SURVEILLANCE DE L'ORDRE TWAP ===" -ForegroundColor Green
Write-Host "📋 Ordre ID: $TWAP_ORDER_ID" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔍 Vérification de l'état de l'ordre..." -ForegroundColor Blue
sui client object $TWAP_ORDER_ID

Write-Host ""
Write-Host "💡 Pour exécuter manuellement un swap TWAP (quand l'intervalle est écoulé):" -ForegroundColor Yellow
Write-Host "sui client call --package 0x320f72b44af6155c55d921dfd10d4447649b2a9463f95b535caa39cf7582e3dc --module cetus_position --function execute_twap_swap_simulation --args $TWAP_ORDER_ID [USDC_COIN_ID] 0x6 --type-args 0x2::sui::SUI 0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC --gas-budget 10000000" -ForegroundColor Gray

Write-Host ""
Write-Host "🚪 Pour annuler l'ordre et récupérer les fonds:" -ForegroundColor Red  
Write-Host "sui client call --package 0x320f72b44af6155c55d921dfd10d4447649b2a9463f95b535caa39cf7582e3dc --module cetus_position --function cancel_twap_order --args $TWAP_ORDER_ID --type-args 0x2::sui::SUI 0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC --gas-budget 5000000" -ForegroundColor Gray
