# Script de demonstration du systeme TWAP complet

Write-Host "=== DEMONSTRATION DU SYSTEME TWAP ===" -ForegroundColor Magenta
Write-Host ""

# 1. Lister les ordres existants
Write-Host "1. Verification des ordres TWAP existants..." -ForegroundColor Blue
.\list-twap.ps1
Write-Host ""

# 2. Creer un ordre de demonstration
Write-Host "2. Creation d'un ordre TWAP de demonstration..." -ForegroundColor Blue
Write-Host "   - Montant: 0.5 SUI" -ForegroundColor Gray
Write-Host "   - Swaps: 3" -ForegroundColor Gray
Write-Host "   - Intervalle: 60 secondes" -ForegroundColor Gray
Write-Host ""

.\create-twap-simple.ps1 0.5 3 60

Write-Host ""
Write-Host "3. Verification de l'ordre cree..." -ForegroundColor Blue
.\list-twap.ps1

Write-Host ""
Write-Host "4. Attente de 10 secondes avant annulation..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "5. Annulation de tous les ordres TWAP..." -ForegroundColor Blue
.\cancel-all-twap.ps1

Write-Host ""
Write-Host "6. Verification finale..." -ForegroundColor Blue
.\list-twap.ps1

Write-Host ""
Write-Host "=== DEMONSTRATION TERMINEE ===" -ForegroundColor Magenta
Write-Host "Vous avez maintenant tous les outils pour gerer vos ordres TWAP!" -ForegroundColor Green
