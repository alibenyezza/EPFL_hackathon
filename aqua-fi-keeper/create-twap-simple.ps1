# Script PowerShell simple pour creer un ordre TWAP

param(
    [Parameter(Position=0)]
    [double]$MontantSui = 1.0,
    
    [Parameter(Position=1)]
    [int]$NombreOrdres = 10,
    
    [Parameter(Position=2)]
    [int]$IntervalleSecondes = 60
)

# Configuration
$PACKAGE_ID = "0x320f72b44af6155c55d921dfd10d4447649b2a9463f95b535caa39cf7582e3dc"

Write-Host "=== CREATION D'ORDRE TWAP ===" -ForegroundColor Green
Write-Host ""

# Calculs
$totalMist = [long]($MontantSui * 1000000000)
$intervalMs = $IntervalleSecondes * 1000
$dureeTotaleMinutes = ($NombreOrdres * $IntervalleSecondes) / 60

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "   Montant total: $MontantSui SUI" -ForegroundColor White
Write-Host "   Nombre de swaps: $NombreOrdres" -ForegroundColor White
Write-Host "   Montant par swap: $($MontantSui / $NombreOrdres) SUI" -ForegroundColor White
Write-Host "   Intervalle: $IntervalleSecondes secondes" -ForegroundColor White
Write-Host "   Duree totale: $($dureeTotaleMinutes.ToString('F1')) minutes" -ForegroundColor White
Write-Host ""

# Recuperation automatique des coins
Write-Host "Recherche des coins appropries..." -ForegroundColor Blue

try {
    $objects = sui client objects --json | ConvertFrom-Json
    
    # Trouver un coin SUI approprie
    $bestSuiCoin = $null
    $bestBalance = 0
    
    foreach ($obj in $objects) {
        if ($obj.objectType -like "*::sui::SUI*") {
            $coinInfo = sui client object $obj.objectId --json | ConvertFrom-Json
            $balance = [long]$coinInfo.content.fields.balance
            
            if ($balance -ge $totalMist -and $balance -gt $bestBalance) {
                $bestSuiCoin = $obj.objectId
                $bestBalance = $balance
            }
        }
    }
    
    if (-not $bestSuiCoin) {
        Write-Host "Aucun coin SUI avec suffisamment de solde ($MontantSui SUI requis)" -ForegroundColor Red
        sui client balance
        exit 1
    }
    
    # Trouver un coin USDC pour l'initialisation
    $usdcCoin = $null
    foreach ($obj in $objects) {
        if ($obj.objectType -like "*::usdc::USDC*") {
            $usdcCoin = $obj.objectId
            break
        }
    }
    
    if (-not $usdcCoin) {
        Write-Host "Aucun coin USDC trouve pour l'initialisation" -ForegroundColor Red
        Write-Host "Creez d'abord un coin USDC vide avec:" -ForegroundColor Yellow
        Write-Host "   sui client split-coin --coin-id [USDC_COIN_ID] --amounts 0 --gas-budget 3000000" -ForegroundColor Gray
        exit 1
    }
    
    Write-Host "Coin SUI selectionne: $bestSuiCoin" -ForegroundColor Green
    Write-Host "Coin USDC pour init: $usdcCoin" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host "Erreur lors de la recuperation des coins: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Confirmation finale
Write-Host "CONFIRMATION FINALE" -ForegroundColor Red
Write-Host "Creer l'ordre TWAP avec ces parametres ? (o/n)" -ForegroundColor Yellow
$confirmation = Read-Host

if ($confirmation -ne "o" -and $confirmation -ne "O" -and $confirmation -ne "oui") {
    Write-Host "Ordre annule" -ForegroundColor Red
    exit 0
}

# Construction de la commande
Write-Host ""
Write-Host "Creation de l'ordre TWAP..." -ForegroundColor Green

$command = "sui client call --package $PACKAGE_ID --module cetus_position --function create_twap_order --args $bestSuiCoin $usdcCoin $NombreOrdres $intervalMs 0x6 --type-args 0x2::sui::SUI 0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC --gas-budget 10000000"

Write-Host "Commande executee:" -ForegroundColor Blue
Write-Host $command -ForegroundColor Gray
Write-Host ""

# Execution
try {
    $result = Invoke-Expression $command
    
    Write-Host ""
    Write-Host "=== ORDRE TWAP CREE AVEC SUCCES ! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Resume:" -ForegroundColor Yellow
    Write-Host "   $MontantSui SUI sera echange en $NombreOrdres fois" -ForegroundColor White
    Write-Host "   $($MontantSui / $NombreOrdres) SUI toutes les $IntervalleSecondes secondes" -ForegroundColor White
    Write-Host "   Duree totale: $($dureeTotaleMinutes.ToString('F1')) minutes" -ForegroundColor White
    Write-Host ""
    Write-Host "Pour surveiller l'ordre: .\monitor-twap.ps1" -ForegroundColor Yellow
    Write-Host "Pour annuler: .\cancel-twap-fixed.ps1 [ORDER_ID]" -ForegroundColor Yellow
    
} catch {
    Write-Host "Erreur lors de la creation: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifiez:" -ForegroundColor Yellow
    Write-Host "   - Que vous avez suffisamment de SUI" -ForegroundColor Gray
    Write-Host "   - Que les coins existent toujours" -ForegroundColor Gray
    Write-Host "   - Que le package ID est correct" -ForegroundColor Gray
}
