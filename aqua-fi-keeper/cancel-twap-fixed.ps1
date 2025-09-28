# Script PowerShell corrige pour annuler un ordre TWAP

param(
    [Parameter(Position=0, Mandatory=$false)]
    [string]$OrderId
)

$PACKAGE_ID = "0x320f72b44af6155c55d921dfd10d4447649b2a9463f95b535caa39cf7582e3dc"

Write-Host "=== ANNULATION D'ORDRE TWAP ===" -ForegroundColor Red
Write-Host ""

# Si aucun ID fourni, lister les ordres TWAP disponibles
if (-not $OrderId) {
    Write-Host "Recherche de vos ordres TWAP..." -ForegroundColor Blue
    
    try {
        $objects = sui client objects --json | ConvertFrom-Json
        $twapOrders = @()
        
        foreach ($obj in $objects) {
            if ($obj.objectType -like "*TWAPOrder*") {
                $twapOrders += $obj.objectId
            }
        }
        
        if ($twapOrders.Count -eq 0) {
            Write-Host "Aucun ordre TWAP trouve" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "Ordres TWAP trouves:" -ForegroundColor Yellow
        for ($i = 0; $i -lt $twapOrders.Count; $i++) {
            Write-Host "   $($i + 1). $($twapOrders[$i])" -ForegroundColor White
        }
        
        # Demander quel ordre annuler
        if ($twapOrders.Count -eq 1) {
            $OrderId = $twapOrders[0]
            Write-Host "Selection automatique de l'ordre unique: $OrderId" -ForegroundColor Yellow
        } else {
            $selection = Read-Host "Quel ordre voulez-vous annuler ? (1-$($twapOrders.Count))"
            $index = [int]$selection - 1
            
            if ($index -ge 0 -and $index -lt $twapOrders.Count) {
                $OrderId = $twapOrders[$index]
            } else {
                Write-Host "Selection invalide" -ForegroundColor Red
                exit 1
            }
        }
    } catch {
        Write-Host "Erreur lors de la recherche des ordres: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Ordre selectionne: $OrderId" -ForegroundColor Yellow

# Confirmation d'annulation
Write-Host ""
Write-Host "ATTENTION: Cette action est irreversible!" -ForegroundColor Red
Write-Host "Vous recupererez tous les fonds restants" -ForegroundColor Yellow
Write-Host ""
$confirmation = Read-Host "Confirmer l'annulation de l'ordre TWAP ? (oui/non)"

if ($confirmation -ne "oui") {
    Write-Host "Annulation annulee" -ForegroundColor Yellow
    exit 0
}

# Execution de l'annulation
Write-Host ""
Write-Host "Annulation de l'ordre TWAP..." -ForegroundColor Red

$command = "sui client call --package $PACKAGE_ID --module cetus_position --function cancel_twap_order --args $OrderId --type-args 0x2::sui::SUI 0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC --gas-budget 5000000"

Write-Host "Commande executee:" -ForegroundColor Blue
Write-Host $command -ForegroundColor Gray
Write-Host ""

# Execution
try {
    Invoke-Expression $command
    Write-Host ""
    Write-Host "Ordre TWAP annule avec succes!" -ForegroundColor Green
    Write-Host "Vos fonds ont ete retournes a votre wallet" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Verifiez votre nouveau solde:" -ForegroundColor Blue
    sui client balance
    
} catch {
    Write-Host "Erreur lors de l'annulation: $($_.Exception.Message)" -ForegroundColor Red
}
