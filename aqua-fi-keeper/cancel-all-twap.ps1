# Script PowerShell pour annuler TOUS les ordres TWAP actifs

$PACKAGE_ID = "0x320f72b44af6155c55d921dfd10d4447649b2a9463f95b535caa39cf7582e3dc"

Write-Host "=== ANNULATION DE TOUS LES ORDRES TWAP ===" -ForegroundColor Red
Write-Host ""

# Recherche de tous les ordres TWAP
Write-Host "Recherche de tous vos ordres TWAP..." -ForegroundColor Blue

try {
    $objects = sui client objects --json | ConvertFrom-Json
    $twapOrders = @()
    
    foreach ($obj in $objects) {
        if ($obj.objectType -like "*TWAPOrder*") {
            $twapOrders += $obj.objectId
        }
    }
    
    if ($twapOrders.Count -eq 0) {
        Write-Host "Aucun ordre TWAP trouve" -ForegroundColor Green
        Write-Host "Tous vos ordres TWAP sont deja annules ou termines" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host "Ordres TWAP trouves: $($twapOrders.Count)" -ForegroundColor Yellow
    Write-Host ""
    
    # Afficher les details de chaque ordre
    for ($i = 0; $i -lt $twapOrders.Count; $i++) {
        $orderId = $twapOrders[$i]
        Write-Host "Ordre $($i + 1): $orderId" -ForegroundColor White
        
        try {
            $orderInfo = sui client object $orderId --json | ConvertFrom-Json
            $fields = $orderInfo.content.fields
            
            $isActive = $fields.is_active
            $ordersExecuted = [int]$fields.orders_executed
            $totalOrders = [int]$fields.total_orders
            $remainingBalance = ([long]$fields.coin_in_treasury.fields.balance) / 1000000000
            $amountAccumulated = ([long]$fields.coin_out_treasury.fields.balance) / 1000000
            
            Write-Host "   Statut: $(if($isActive) {'Actif'} else {'Inactif'})" -ForegroundColor Gray
            Write-Host "   Progres: $ordersExecuted/$totalOrders swaps" -ForegroundColor Gray
            Write-Host "   SUI restant: $($remainingBalance.ToString('F4')) SUI" -ForegroundColor Gray
            Write-Host "   USDC accumule: $($amountAccumulated.ToString('F6')) USDC" -ForegroundColor Gray
            Write-Host ""
            
        } catch {
            Write-Host "   Impossible de recuperer les details" -ForegroundColor Red
            Write-Host ""
        }
    }
    
} catch {
    Write-Host "Erreur lors de la recherche des ordres: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Confirmation d'annulation
Write-Host "ATTENTION: Cette action est irreversible!" -ForegroundColor Red
Write-Host "Vous allez annuler $($twapOrders.Count) ordre(s) TWAP" -ForegroundColor Yellow
Write-Host "Vous recupererez tous les fonds restants (SUI + USDC accumule)" -ForegroundColor Yellow
Write-Host ""
$confirmation = Read-Host "Confirmer l'annulation de TOUS les ordres TWAP ? (oui/non)"

if ($confirmation -ne "oui") {
    Write-Host "Annulation annulee" -ForegroundColor Yellow
    exit 0
}

# Annulation de tous les ordres
Write-Host ""
Write-Host "Annulation de tous les ordres TWAP..." -ForegroundColor Red
Write-Host ""

$successCount = 0
$errorCount = 0

for ($i = 0; $i -lt $twapOrders.Count; $i++) {
    $orderId = $twapOrders[$i]
    Write-Host "Annulation de l'ordre $($i + 1)/$($twapOrders.Count): $orderId" -ForegroundColor Yellow
    
    $command = "sui client call --package $PACKAGE_ID --module cetus_position --function cancel_twap_order --args $orderId --type-args 0x2::sui::SUI 0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC --gas-budget 5000000"
    
    try {
        Invoke-Expression $command
        Write-Host "   ✅ Ordre $($i + 1) annule avec succes" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "   ❌ Erreur lors de l'annulation de l'ordre $($i + 1): $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
    
    Write-Host ""
}

# Resume final
Write-Host "=== RESUME DE L'ANNULATION ===" -ForegroundColor Cyan
Write-Host "Ordres traites: $($twapOrders.Count)" -ForegroundColor White
Write-Host "Annulations reussies: $successCount" -ForegroundColor Green
Write-Host "Erreurs: $errorCount" -ForegroundColor Red
Write-Host ""

if ($successCount -gt 0) {
    Write-Host "Vos fonds ont ete retournes a votre wallet" -ForegroundColor Yellow
    Write-Host "Verifiez votre nouveau solde:" -ForegroundColor Blue
    sui client balance
} else {
    Write-Host "Aucun ordre n'a pu etre annule" -ForegroundColor Red
    Write-Host "Verifiez que les ordres existent encore et que vous avez les permissions" -ForegroundColor Yellow
}
