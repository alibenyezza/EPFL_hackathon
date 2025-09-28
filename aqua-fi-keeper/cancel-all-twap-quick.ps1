# Script PowerShell rapide pour annuler TOUS les ordres TWAP (sans confirmation)

$PACKAGE_ID = "0x320f72b44af6155c55d921dfd10d4447649b2a9463f95b535caa39cf7582e3dc"

Write-Host "=== ANNULATION RAPIDE DE TOUS LES ORDRES TWAP ===" -ForegroundColor Red
Write-Host ""

# Recherche et annulation automatique
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
        exit 0
    }
    
    Write-Host "Ordres TWAP trouves: $($twapOrders.Count)" -ForegroundColor Yellow
    Write-Host "Annulation en cours..." -ForegroundColor Blue
    Write-Host ""
    
    $successCount = 0
    
    foreach ($orderId in $twapOrders) {
        Write-Host "Annulation: $orderId" -ForegroundColor Yellow
        
        $command = "sui client call --package $PACKAGE_ID --module cetus_position --function cancel_twap_order --args $orderId --type-args 0x2::sui::SUI 0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC --gas-budget 5000000"
        
        try {
            Invoke-Expression $command | Out-Null
            Write-Host "   ✅ Annule" -ForegroundColor Green
            $successCount++
        } catch {
            Write-Host "   ❌ Erreur" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "=== TERMINE ===" -ForegroundColor Cyan
    Write-Host "Ordres annules: $successCount/$($twapOrders.Count)" -ForegroundColor White
    
    if ($successCount -gt 0) {
        Write-Host "Vos fonds ont ete retournes" -ForegroundColor Yellow
        Write-Host "Nouveau solde:" -ForegroundColor Blue
        sui client balance
    }
    
} catch {
    Write-Host "Erreur generale: $($_.Exception.Message)" -ForegroundColor Red
}
