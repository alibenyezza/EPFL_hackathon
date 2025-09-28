# Script PowerShell pour création rapide d'ordre TWAP avec paramètres en ligne de commande
# Usage: .\quick-twap.ps1 [montant_sui] [nombre_ordres] [intervalle_secondes]
# Exemple: .\quick-twap.ps1 2.5 15 120

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

Write-Host "⚡ === CRÉATION RAPIDE D'ORDRE TWAP ===" -ForegroundColor Green
Write-Host ""

# Validation des paramètres
if ($MontantSui -le 0 -or $MontantSui -gt 10) {
    Write-Host "❌ Montant invalide. Doit être entre 0.01 et 10 SUI" -ForegroundColor Red
    exit 1
}

if ($NombreOrdres -le 1 -or $NombreOrdres -gt 100) {
    Write-Host "❌ Nombre d'ordres invalide. Doit être entre 2 et 100" -ForegroundColor Red
    exit 1
}

if ($IntervalleSecondes -lt 10 -or $IntervalleSecondes -gt 86400) {
    Write-Host "❌ Intervalle invalide. Doit être entre 10 et 86400 secondes" -ForegroundColor Red
    exit 1
}

# Calculs
$totalMist = [long]($MontantSui * 1000000000)
$mistPerOrder = [long]($totalMist / $NombreOrdres)
$intervalMs = $IntervalleSecondes * 1000
$dureeTotaleMinutes = ($NombreOrdres * $IntervalleSecondes) / 60

Write-Host "📊 Configuration:" -ForegroundColor Yellow
Write-Host "   💰 Montant total: $MontantSui SUI" -ForegroundColor White
Write-Host "   🔢 Nombre de swaps: $NombreOrdres" -ForegroundColor White
Write-Host "   📊 Montant par swap: $($MontantSui / $NombreOrdres) SUI" -ForegroundColor White
Write-Host "   ⏱️  Intervalle: $IntervalleSecondes secondes" -ForegroundColor White
Write-Host "   ⏳ Durée totale: $($dureeTotaleMinutes.ToString('F1')) minutes" -ForegroundColor White
Write-Host ""

# Récupération automatique des coins
Write-Host "🔍 Recherche des coins appropriés..." -ForegroundColor Blue

try {
    $objects = sui client objects --json | ConvertFrom-Json
    
    # Trouver un coin SUI approprié
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
        Write-Host "❌ Aucun coin SUI avec suffisamment de solde ($MontantSui SUI requis)" -ForegroundColor Red
        Write-Host "💡 Solde disponible:" -ForegroundColor Yellow
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
        Write-Host "❌ Aucun coin USDC trouvé pour l'initialisation" -ForegroundColor Red
        Write-Host "💡 Créez d'abord un coin USDC vide avec:" -ForegroundColor Yellow
        Write-Host "   sui client split-coin --coin-id [USDC_COIN_ID] --amounts 0 --gas-budget 3000000" -ForegroundColor Gray
        exit 1
    }
    
    Write-Host "✅ Coin SUI sélectionné: $bestSuiCoin" -ForegroundColor Green
    Write-Host "✅ Coin USDC pour init: $usdcCoin" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host "❌ Erreur lors de la récupération des coins: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Confirmation finale
Write-Host "⚠️  CONFIRMATION FINALE" -ForegroundColor Red
Write-Host "Créer l'ordre TWAP avec ces paramètres ? (o/n)" -ForegroundColor Yellow
$confirmation = Read-Host

if ($confirmation -ne "o" -and $confirmation -ne "O" -and $confirmation -ne "oui") {
    Write-Host "❌ Ordre annulé" -ForegroundColor Red
    exit 0
}

# Construction de la commande
Write-Host ""
Write-Host "🚀 Création de l'ordre TWAP..." -ForegroundColor Green

$command = "sui client call --package $PACKAGE_ID --module cetus_position --function create_twap_order --args $bestSuiCoin $usdcCoin $NombreOrdres $intervalMs 0x6 --type-args 0x2::sui::SUI 0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC --gas-budget 10000000"

Write-Host "📋 Commande exécutée:" -ForegroundColor Blue
Write-Host $command -ForegroundColor Gray
Write-Host ""

# Exécution
try {
    $result = Invoke-Expression $command
    
    Write-Host ""
    Write-Host "🎉 === ORDRE TWAP CRÉÉ AVEC SUCCÈS ! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Résumé:" -ForegroundColor Yellow
    Write-Host "   💰 $MontantSui SUI sera échangé en $NombreOrdres fois" -ForegroundColor White
    Write-Host "   📈 $($amountPerOrder.ToString('F4')) SUI toutes les $IntervalleSecondes secondes" -ForegroundColor White
    Write-Host "   ⏳ Durée totale: $($dureeTotaleMinutes.ToString('F1')) minutes" -ForegroundColor White
    Write-Host ""
    Write-Host "🔍 Pour surveiller l'ordre: .\monitor-twap.ps1" -ForegroundColor Yellow
    Write-Host "🚪 Pour annuler: .\cancel-twap.ps1 [ORDER_ID]" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Erreur lors de la création: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Vérifiez:" -ForegroundColor Yellow
    Write-Host "   - Que vous avez suffisamment de SUI" -ForegroundColor Gray
    Write-Host "   - Que les coins existent toujours" -ForegroundColor Gray
    Write-Host "   - Que le package ID est correct" -ForegroundColor Gray
}
