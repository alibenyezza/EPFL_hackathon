# Script PowerShell interactif pour créer un ordre TWAP personnalisé

Write-Host "⏳ === CRÉATEUR D'ORDRE TWAP PERSONNALISÉ ===" -ForegroundColor Green
Write-Host ""

# Configuration du package
$PACKAGE_ID = "0x320f72b44af6155c55d921dfd10d4447649b2a9463f95b535caa39cf7582e3dc"
$POOL_ID = "0x51e883ba7c0b566a26cbc8a94cd33eb0abd418a77cc1e60ad22fd9b1f29cd2ab"

# Fonction pour valider les entrées numériques
function Get-ValidNumber {
    param(
        [string]$Prompt,
        [double]$Min = 0,
        [double]$Max = [double]::MaxValue,
        [string]$Unit = ""
    )
    
    do {
        $input = Read-Host "$Prompt $Unit"
        if ([double]::TryParse($input, [ref]$null)) {
            $number = [double]$input
            if ($number -ge $Min -and $number -le $Max) {
                return $number
            } else {
                Write-Host "❌ Valeur invalide. Doit être entre $Min et $Max $Unit" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Veuillez entrer un nombre valide" -ForegroundColor Red
        }
    } while ($true)
}

# Afficher les coins SUI disponibles
Write-Host "💰 Vérification de vos coins SUI disponibles..." -ForegroundColor Blue
sui client balance
Write-Host ""

# 1. Configuration du montant total
Write-Host "📊 ÉTAPE 1: Montant total à investir" -ForegroundColor Yellow
Write-Host "💡 Conseil: Gardez au moins 0.5 SUI pour les frais de gas" -ForegroundColor Gray
$totalSui = Get-ValidNumber "Combien de SUI voulez-vous investir au total ?" 0.01 10 "SUI"
$totalMist = [long]($totalSui * 1000000000)

Write-Host "✅ Montant sélectionné: $totalSui SUI ($totalMist MIST)" -ForegroundColor Green
Write-Host ""

# 2. Configuration du nombre d'ordres
Write-Host "🔢 ÉTAPE 2: Nombre de swaps" -ForegroundColor Yellow
Write-Host "💡 Conseil: Plus d'ordres = meilleur lissage, mais plus de frais de gas" -ForegroundColor Gray
$totalOrders = [int](Get-ValidNumber "Combien de swaps voulez-vous exécuter ?" 2 100 "swaps")

$amountPerOrder = $totalSui / $totalOrders
$mistPerOrder = [long]($totalMist / $totalOrders)

Write-Host "✅ Configuration: $totalOrders swaps de $($amountPerOrder.ToString('F4')) SUI chacun" -ForegroundColor Green
Write-Host ""

# 3. Configuration de l'intervalle
Write-Host "⏱️  ÉTAPE 3: Intervalle entre les swaps" -ForegroundColor Yellow
Write-Host "💡 Options suggérées:" -ForegroundColor Gray
Write-Host "   🚀 Agressif: 30-60 secondes" -ForegroundColor Gray
Write-Host "   ⚖️  Modéré: 5-15 minutes" -ForegroundColor Gray
Write-Host "   🐌 Conservateur: 30+ minutes" -ForegroundColor Gray

$intervalSeconds = [int](Get-ValidNumber "Intervalle entre chaque swap ?" 10 86400 "secondes")
$intervalMs = $intervalSeconds * 1000

$totalDurationMinutes = ($totalOrders * $intervalSeconds) / 60
Write-Host "✅ Intervalle: $intervalSeconds secondes (durée totale: $($totalDurationMinutes.ToString('F1')) minutes)" -ForegroundColor Green
Write-Host ""

# 4. Récapitulatif
Write-Host "📋 === RÉCAPITULATIF DE VOTRE ORDRE TWAP ===" -ForegroundColor Cyan
Write-Host "💰 Montant total: $totalSui SUI" -ForegroundColor White
Write-Host "🔢 Nombre de swaps: $totalOrders" -ForegroundColor White
Write-Host "📊 Montant par swap: $($amountPerOrder.ToString('F4')) SUI" -ForegroundColor White
Write-Host "⏱️  Intervalle: $intervalSeconds secondes" -ForegroundColor White
Write-Host "⏳ Durée totale: $($totalDurationMinutes.ToString('F1')) minutes" -ForegroundColor White
Write-Host ""

# 5. Sélection des coins
Write-Host "🔍 Recherche des coins appropriés..." -ForegroundColor Blue

# Récupérer les objets disponibles
$objects = sui client objects --json | ConvertFrom-Json

# Trouver les coins SUI avec suffisamment de solde
$suiCoins = @()
$usdcCoins = @()

foreach ($obj in $objects) {
    if ($obj.objectType -like "*::sui::SUI*") {
        $coinInfo = sui client object $obj.objectId --json | ConvertFrom-Json
        $balance = [long]$coinInfo.content.fields.balance
        if ($balance -ge $totalMist) {
            $suiCoins += @{
                id = $obj.objectId
                balance = $balance
                balanceSui = $balance / 1000000000
            }
        }
    } elseif ($obj.objectType -like "*::usdc::USDC*") {
        $usdcCoins += $obj.objectId
    }
}

if ($suiCoins.Count -eq 0) {
    Write-Host "❌ Aucun coin SUI avec suffisamment de solde trouvé!" -ForegroundColor Red
    Write-Host "💡 Vous avez besoin d'au moins $totalSui SUI dans un seul coin" -ForegroundColor Yellow
    exit 1
}

# Sélectionner le meilleur coin SUI
$selectedSuiCoin = $suiCoins | Sort-Object balance -Descending | Select-Object -First 1
Write-Host "✅ Coin SUI sélectionné: $($selectedSuiCoin.id)" -ForegroundColor Green
Write-Host "💰 Solde du coin: $($selectedSuiCoin.balanceSui.ToString('F4')) SUI" -ForegroundColor Green

# Créer un coin USDC vide si nécessaire
$usdcCoinEmpty = $null
if ($usdcCoins.Count -gt 0) {
    $usdcCoinEmpty = $usdcCoins[0]
    Write-Host "✅ Coin USDC trouvé pour initialisation: $usdcCoinEmpty" -ForegroundColor Green
} else {
    Write-Host "⚠️  Aucun coin USDC trouvé. Création d'un coin vide..." -ForegroundColor Yellow
    # Créer un coin USDC vide (cette commande doit être exécutée séparément)
    Write-Host "💡 Exécutez d'abord: sui client split-coin --coin-id [UN_COIN_USDC] --amounts 0 --gas-budget 3000000" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# 6. Confirmation finale
Write-Host "⚠️  CONFIRMATION FINALE" -ForegroundColor Red
Write-Host "Voulez-vous créer cet ordre TWAP ? (o/n)" -ForegroundColor Yellow
$confirmation = Read-Host

if ($confirmation -ne "o" -and $confirmation -ne "O" -and $confirmation -ne "oui") {
    Write-Host "❌ Ordre annulé par l'utilisateur" -ForegroundColor Red
    exit 0
}

# 7. Construction et exécution de la commande
Write-Host ""
Write-Host "🚀 Création de l'ordre TWAP..." -ForegroundColor Green

$command = "sui client call --package $PACKAGE_ID --module cetus_position --function create_twap_order --args $($selectedSuiCoin.id) $usdcCoinEmpty $totalOrders $intervalMs 0x6 --type-args 0x2::sui::SUI 0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC --gas-budget 10000000"

Write-Host "📋 Commande exécutée:" -ForegroundColor Blue
Write-Host $command -ForegroundColor Gray
Write-Host ""

# Exécuter la commande
try {
    Invoke-Expression $command
    Write-Host ""
    Write-Host "🎉 Ordre TWAP créé avec succès!" -ForegroundColor Green
    Write-Host "💡 Surveillez l'exécution avec: .\monitor-twap.ps1" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Erreur lors de la création de l'ordre: $($_.Exception.Message)" -ForegroundColor Red
}
