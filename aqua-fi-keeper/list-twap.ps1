# Script PowerShell pour lister tous les ordres TWAP

Write-Host "=== LISTE DE VOS ORDRES TWAP ===" -ForegroundColor Cyan
Write-Host ""

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
        Write-Host "Votre wallet ne contient aucun ordre TWAP actif" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host "Ordres TWAP trouves: $($twapOrders.Count)" -ForegroundColor Yellow
    Write-Host ""
    
    for ($i = 0; $i -lt $twapOrders.Count; $i++) {
        $orderId = $twapOrders[$i]
        Write-Host "=== ORDRE $($i + 1) ===" -ForegroundColor White
        Write-Host "ID: $orderId" -ForegroundColor Gray
        Write-Host ""
        
        try {
            $orderInfo = sui client object $orderId --json | ConvertFrom-Json
            $fields = $orderInfo.content.fields
            
            $isActive = $fields.is_active
            $ordersExecuted = [int]$fields.orders_executed
            $totalOrders = [int]$fields.total_orders
            $intervalMs = [long]$fields.interval_ms
            $orderAmount = ([long]$fields.order_amount) / 1000000000
            $remainingBalance = ([long]$fields.coin_in_treasury.fields.balance) / 1000000000
            $amountAccumulated = ([long]$fields.coin_out_treasury.fields.balance) / 1000000
            $lastExecutionTime = [long]$fields.last_execution_time_ms
            
            Write-Host "   Statut: $(if($isActive) {'🟢 Actif'} else {'🔴 Inactif'})" -ForegroundColor $(if($isActive) {'Green'} else {'Red'})
            Write-Host "   Progres: $ordersExecuted/$totalOrders swaps" -ForegroundColor White
            Write-Host "   Montant par swap: $($orderAmount.ToString('F4')) SUI" -ForegroundColor White
            Write-Host "   SUI restant: $($remainingBalance.ToString('F4')) SUI" -ForegroundColor White
            Write-Host "   USDC accumule: $($amountAccumulated.ToString('F6')) USDC" -ForegroundColor White
            Write-Host "   Intervalle: $($intervalMs / 1000) secondes" -ForegroundColor White
            
            if ($isActive -and $ordersExecuted -lt $totalOrders) {
                $currentTime = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
                $nextExecutionTime = $lastExecutionTime + $intervalMs
                $waitTime = ($nextExecutionTime - $currentTime) / 1000
                
                if ($currentTime -ge $nextExecutionTime) {
                    Write-Host "   Prochain swap: MAINTENANT (en attente)" -ForegroundColor Yellow
                } else {
                    Write-Host "   Prochain swap: dans $([math]::Max(0, [math]::Ceiling($waitTime))) secondes" -ForegroundColor Yellow
                }
            } elseif ($ordersExecuted -ge $totalOrders) {
                Write-Host "   Statut: TERMINE (tous les swaps executes)" -ForegroundColor Green
            }
            
        } catch {
            Write-Host "   ❌ Impossible de recuperer les details" -ForegroundColor Red
        }
        
        Write-Host ""
    }
    
    Write-Host "=== COMMANDES UTILES ===" -ForegroundColor Cyan
    Write-Host "Annuler tous les ordres: .\cancel-all-twap.ps1" -ForegroundColor Yellow
    Write-Host "Annuler un ordre specifique: .\cancel-twap-fixed.ps1 [ORDER_ID]" -ForegroundColor Yellow
    Write-Host "Executer manuellement: .\execute-twap.ps1 [ORDER_ID]" -ForegroundColor Yellow
    Write-Host "Surveiller: .\monitor-twap.ps1" -ForegroundColor Yellow
    
} catch {
    Write-Host "Erreur lors de la recherche des ordres: $($_.Exception.Message)" -ForegroundColor Red
}
