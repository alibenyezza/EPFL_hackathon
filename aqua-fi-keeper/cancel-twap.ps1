# Script PowerShell pour annuler un ordre TWAP

param(
    [Parameter(Position=0, Mandatory=$false)]
    [string]$OrderId
)

$PACKAGE_ID = "0x320f72b44af6155c55d921dfd10d4447649b2a9463f95b535caa39cf7582e3dc"

Write-Host "🚪 === ANNULATION D'ORDRE TWAP ===" -ForegroundColor Red
Write-Host ""

# Si aucun ID fourni, lister les ordres TWAP disponibles
if (-not $OrderId) {
    Write-Host "🔍 Recherche de vos ordres TWAP..." -ForegroundColor Blue
    
    try {
        $objects = sui client objects --json | ConvertFrom-Json
        $twapOrders = @()
        
        foreach ($obj in $objects) {
            if ($obj.objectType -like "*TWAPOrder*") {
                $twapOrders += $obj.objectId
            }
        }
        
        if ($twapOrders.Count -eq 0) {
            Write-Host "❌ Aucun ordre TWAP trouvé" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "📋 Ordres TWAP trouvés:" -ForegroundColor Yellow
        for ($i = 0; $i -lt $twapOrders.Count; $i++) {
            Write-Host "   $($i + 1). $($twapOrders[$i])" -ForegroundColor White
            
            # Afficher les détails de l'ordre
            try {
                $orderInfo = sui client object $twapOrders[$i] --json | ConvertFrom-Json
                $fields = $orderInfo.content.fields
                $remaining = [int]$fields.total_orders - [int]$fields.orders_executed
                $amountRemaining = ([long]$fields.coin_in_treasury.fields.balance) / 1000000000
                
                Write-Host "      📊 Statut: $($fields.is_active ? 'Actif' : 'Inactif')" -ForegroundColor Gray
                Write-Host "      💰 SUI restant: $($amountRemaining.ToString('F4')) SUI" -ForegroundColor Gray
                Write-Host "      🔢 Swaps restants: $remaining/$($fields.total_orders)" -ForegroundColor Gray
                Write-Host ""
            } catch {
                Write-Host "      ❌ Impossible de récupérer les détails" -ForegroundColor Red
            }
        }
        
        # Demander quel ordre annuler
        if ($twapOrders.Count -eq 1) {
            $OrderId = $twapOrders[0]
            Write-Host "📋 Sélection automatique de l'ordre unique: $OrderId" -ForegroundColor Yellow
        } else {
            $selection = Read-Host "Quel ordre voulez-vous annuler ? (1-$($twapOrders.Count))"
            $index = [int]$selection - 1
            
            if ($index -ge 0 -and $index -lt $twapOrders.Count) {
                $OrderId = $twapOrders[$index]
            } else {
                Write-Host "❌ Sélection invalide" -ForegroundColor Red
                exit 1
            }
        }
    } catch {
        Write-Host "❌ Erreur lors de la recherche des ordres: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🎯 Ordre sélectionné: $OrderId" -ForegroundColor Yellow

# Afficher les détails de l'ordre avant annulation
try {
    Write-Host "📊 Détails de l'ordre avant annulation:" -ForegroundColor Blue
    $orderInfo = sui client object $OrderId --json | ConvertFrom-Json
    $fields = $orderInfo.content.fields
    
    $remaining = [int]$fields.total_orders - [int]$fields.orders_executed
    $amountRemaining = ([long]$fields.coin_in_treasury.fields.balance) / 1000000000
    $amountAccumulated = ([long]$fields.coin_out_treasury.fields.balance) / 1000000
    
    Write-Host "   📈 Swaps exécutés: $($fields.orders_executed)/$($fields.total_orders)" -ForegroundColor White
    Write-Host "   💰 SUI restant: $($amountRemaining.ToString('F4')) SUI" -ForegroundColor White
    Write-Host "   💰 USDC accumulé: $($amountAccumulated.ToString('F6')) USDC" -ForegroundColor White
    Write-Host "   🔄 Statut: $($fields.is_active ? 'Actif' : 'Inactif')" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "⚠️  Impossible de récupérer les détails de l'ordre" -ForegroundColor Yellow
}

# Confirmation d'annulation
Write-Host "⚠️  ATTENTION: Cette action est irréversible!" -ForegroundColor Red
Write-Host "💰 Vous récupérerez tous les fonds restants (SUI non échangé + USDC accumulé)" -ForegroundColor Yellow
Write-Host ""
$confirmation = Read-Host "Confirmer l'annulation de l'ordre TWAP ? (oui/non)"

if ($confirmation -ne "oui") {
    Write-Host "❌ Annulation annulée" -ForegroundColor Yellow
    exit 0
}

# Exécution de l'annulation
Write-Host ""
Write-Host "🚪 Annulation de l'ordre TWAP..." -ForegroundColor Red

$command = "sui client call --package $PACKAGE_ID --module cetus_position --function cancel_twap_order --args $OrderId --type-args 0x2::sui::SUI 0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC --gas-budget 5000000"

Write-Host "📋 Commande exécutée:" -ForegroundColor Blue
Write-Host $command -ForegroundColor Gray
Write-Host ""

try {
    Invoke-Expression $command
    Write-Host ""
    Write-Host "✅ Ordre TWAP annulé avec succès!" -ForegroundColor Green
    Write-Host "💰 Vos fonds ont été retournés à votre wallet" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📊 Vérifiez votre nouveau solde:" -ForegroundColor Blue
    sui client balance
    
} catch {
    Write-Host "❌ Erreur lors de l'annulation: $($_.Exception.Message)" -ForegroundColor Red
}
