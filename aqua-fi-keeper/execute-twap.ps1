# Script PowerShell pour exécuter manuellement un swap TWAP

param(
    [Parameter(Position=0)]
    [string]$OrderId = "0x3a5d2771ba759ffa57b1fb77ad8795d96ed24ae096b08f7f52b3b97f8b5d4114"
)

$PACKAGE_ID = "0x320f72b44af6155c55d921dfd10d4447649b2a9463f95b535caa39cf7582e3dc"

Write-Host "⚡ === EXÉCUTION MANUELLE DE SWAP TWAP ===" -ForegroundColor Green
Write-Host "📋 Ordre ID: $OrderId" -ForegroundColor Yellow
Write-Host ""

# Vérifier l'état de l'ordre
Write-Host "🔍 Vérification de l'état de l'ordre..." -ForegroundColor Blue

try {
    $orderInfo = sui client object $OrderId --json | ConvertFrom-Json
    $fields = $orderInfo.content.fields
    
    $isActive = $fields.is_active
    $ordersExecuted = [int]$fields.orders_executed
    $totalOrders = [int]$fields.total_orders
    $intervalMs = [long]$fields.interval_ms
    $lastExecutionTime = [long]$fields.last_execution_time_ms
    $orderAmount = ([long]$fields.order_amount) / 1000000000
    $remainingBalance = ([long]$fields.coin_in_treasury.fields.balance) / 1000000000
    
    Write-Host "📊 État actuel de l'ordre:" -ForegroundColor Yellow
    Write-Host "   🔄 Actif: $isActive" -ForegroundColor White
    Write-Host "   📈 Progrès: $ordersExecuted/$totalOrders swaps" -ForegroundColor White
    Write-Host "   💰 SUI restant: $($remainingBalance.ToString('F4')) SUI" -ForegroundColor White
    Write-Host "   📊 Montant par swap: $($orderAmount.ToString('F4')) SUI" -ForegroundColor White
    Write-Host "   ⏱️  Intervalle: $($intervalMs / 1000) secondes" -ForegroundColor White
    Write-Host ""
    
    # Vérifier si l'ordre peut être exécuté
    if (-not $isActive) {
        Write-Host "❌ L'ordre n'est pas actif" -ForegroundColor Red
        exit 1
    }
    
    if ($ordersExecuted -ge $totalOrders) {
        Write-Host "✅ Tous les swaps ont été exécutés!" -ForegroundColor Green
        Write-Host "💡 Utilisez cancel-twap.ps1 pour récupérer les fonds" -ForegroundColor Yellow
        exit 0
    }
    
    # Vérifier le timing
    $currentTime = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    $nextExecutionTime = $lastExecutionTime + $intervalMs
    $waitTime = ($nextExecutionTime - $currentTime) / 1000
    
    if ($currentTime -lt $nextExecutionTime) {
        Write-Host "⏰ Prochain swap prévu dans $([math]::Max(0, [math]::Ceiling($waitTime))) secondes" -ForegroundColor Yellow
        Write-Host "⚠️  L'ordre ne peut pas encore être exécuté" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ L'ordre peut être exécuté maintenant!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erreur lors de la vérification de l'ordre: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Trouver un coin USDC pour la simulation du swap
Write-Host "🔍 Recherche d'un coin USDC pour la simulation..." -ForegroundColor Blue

try {
    $objects = sui client objects --json | ConvertFrom-Json
    $usdcCoin = $null
    
    foreach ($obj in $objects) {
        if ($obj.objectType -like "*::usdc::USDC*" -and $obj.objectId -ne $fields.coin_out_treasury.fields.id.id) {
            $usdcCoin = $obj.objectId
            break
        }
    }
    
    if (-not $usdcCoin) {
        Write-Host "❌ Aucun coin USDC disponible pour la simulation" -ForegroundColor Red
        Write-Host "💡 Créez un coin USDC vide avec:" -ForegroundColor Yellow
        Write-Host "   sui client split-coin --coin-id [USDC_COIN_ID] --amounts 0 --gas-budget 3000000" -ForegroundColor Gray
        exit 1
    }
    
    Write-Host "✅ Coin USDC pour simulation: $usdcCoin" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erreur lors de la recherche de coin USDC: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Confirmation d'exécution
Write-Host ""
Write-Host "⚠️  CONFIRMATION" -ForegroundColor Yellow
Write-Host "Exécuter le swap TWAP maintenant ? (o/n)" -ForegroundColor Yellow
$confirmation = Read-Host

if ($confirmation -ne "o" -and $confirmation -ne "O" -and $confirmation -ne "oui") {
    Write-Host "❌ Exécution annulée" -ForegroundColor Red
    exit 0
}

# Exécution du swap
Write-Host ""
Write-Host "🚀 Exécution du swap TWAP..." -ForegroundColor Green

$command = "sui client call --package $PACKAGE_ID --module cetus_position --function execute_twap_swap_simulation --args $OrderId $usdcCoin 0x6 --type-args 0x2::sui::SUI 0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC --gas-budget 10000000"

Write-Host "📋 Commande exécutée:" -ForegroundColor Blue
Write-Host $command -ForegroundColor Gray
Write-Host ""

try {
    Invoke-Expression $command
    
    Write-Host ""
    Write-Host "🎉 Swap TWAP exécuté avec succès!" -ForegroundColor Green
    Write-Host "📊 Progression: $($ordersExecuted + 1)/$totalOrders swaps" -ForegroundColor Yellow
    
    if (($ordersExecuted + 1) -eq $totalOrders) {
        Write-Host "🏁 ORDRE TWAP TERMINÉ!" -ForegroundColor Green
        Write-Host "💡 Utilisez cancel-twap.ps1 pour récupérer les fonds finaux" -ForegroundColor Yellow
    } else {
        Write-Host "⏰ Prochain swap dans $($intervalMs / 1000) secondes" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Erreur lors de l'exécution: $($_.Exception.Message)" -ForegroundColor Red
}
