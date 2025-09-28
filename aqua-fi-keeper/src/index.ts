// Fichier principal - Aqua Fi Keeper
// Gestionnaire de liquidité automatisé pour Cetus sur Sui

import { createPosition } from './actions/createPosition';
import { runKeeperLoop } from './core/keeper';
import { runBuyTheDipStrategy, testBuyTheDipStrategy } from './core/buyTheDipKeeper';
import { createMultiRangeBuyTheDipStrategy, closeAllBuyTheDipPositions, monitorBuyTheDipPositions } from './core/multiRangeBuyTheDip';
// import { createGasVault, depositToGasVault, withdrawFromGasVault, checkGasVaultStatus } from './core/gasManager';
import { listGasCoins, analyzeGas, splitSuiCoin } from './core/simpleGasManager';
import { runTwapKeeper, monitorAllTwapOrders, testTwapStrategy } from './core/twapKeeper';
import { createTwapOrder, cancelTwapOrder, TWAP_PRESETS } from './actions/createTwapOrder';

async function main() {
    const command = process.argv[2];
    
    switch (command) {
        case 'create-position':
            console.log('🚀 Démarrage de la création de position...');
            await createPosition();
            break;
            
        case 'start-keeper':
            console.log('🤖 Démarrage du keeper Aqua Fi classique...');
            console.log('🔄 Le keeper va surveiller votre position et la rééquilibrer automatiquement.');
            console.log('⏰ Vérification toutes les 60 secondes...');
            console.log('🛑 Appuyez sur Ctrl+C pour arrêter.\n');
            
            // Première vérification immédiate
            await runKeeperLoop();
            // Puis vérification toutes les 60 secondes
            setInterval(runKeeperLoop, 60000);
            break;
            
        case 'start-buy-the-dip':
            console.log('💧 Démarrage du keeper Aqua Fi - Stratégie Buy The Dip...');
            console.log('📈 Le keeper va automatiquement positionner la liquidité en dessous du prix actuel.');
            console.log('🎯 Objectif: Capturer les baisses de prix et gagner des frais de trading.');
            console.log('⏰ Vérification toutes les 30 secondes...');
            console.log('🛑 Appuyez sur Ctrl+C pour arrêter.\n');
            
            // Première vérification immédiate
            await runBuyTheDipStrategy();
            // Puis vérification toutes les 30 secondes (plus réactif pour cette stratégie)
            setInterval(runBuyTheDipStrategy, 30000);
            break;
            
        case 'test-buy-the-dip':
            console.log('🧪 Test de la stratégie Buy The Dip...');
            await testBuyTheDipStrategy();
            break;
            
        case 'create-multi-range':
            console.log('🏗️  Création de la stratégie Multi-Range Buy The Dip...');
            await createMultiRangeBuyTheDipStrategy();
            break;
            
        case 'close-all-positions':
            console.log('🚪 Fermeture de toutes les positions Buy The Dip...');
            await closeAllBuyTheDipPositions();
            break;
            
        case 'monitor':
            console.log('👁️  Mode monitoring - Statut des positions...');
            await monitorBuyTheDipPositions();
            break;
            
        case 'create-gas-vault':
            console.log('🏦 Création du coffre-fort pour le gas...');
            console.log('⚠️  Fonctionnalité temporairement désactivée - utilisez split-sui');
            break;
            
        case 'deposit-gas':
            console.log('💰 Dépôt de SUI dans le coffre-fort...');
            console.log('⚠️  Fonctionnalité temporairement désactivée');
            break;
            
        case 'withdraw-gas':
            console.log('💸 Retrait de SUI du coffre-fort...');
            console.log('⚠️  Fonctionnalité temporairement désactivée');
            break;
            
        case 'gas-status':
            console.log('🏦 Vérification du statut du coffre-fort...');
            console.log('⚠️  Fonctionnalité temporairement désactivée');
            break;
            
        case 'list-gas':
            console.log('💰 Liste des coins SUI disponibles...');
            await listGasCoins();
            break;
            
        case 'analyze-gas':
            console.log('🔍 Analyse de l\'optimisation du gas...');
            await analyzeGas();
            break;
            
        case 'split-sui':
            console.log('🔄 Division du coin SUI...');
            await splitSuiCoin();
            break;
            
        case 'create-twap-order':
            console.log('📋 Création d\'un ordre TWAP...');
            const preset = process.argv[3] || 'conservative';
            if (TWAP_PRESETS[preset as keyof typeof TWAP_PRESETS]) {
                await createTwapOrder(TWAP_PRESETS[preset as keyof typeof TWAP_PRESETS]);
            } else {
                console.log('❌ Preset non reconnu. Presets disponibles: conservative, moderate, aggressive');
            }
            break;
            
        case 'start-twap':
            console.log('⏳ Démarrage du keeper TWAP...');
            console.log('🔄 Le keeper va exécuter automatiquement vos ordres TWAP.');
            console.log('⏰ Vérification toutes les 30 secondes...');
            console.log('🛑 Appuyez sur Ctrl+C pour arrêter.\n');
            
            // Première vérification immédiate
            await runTwapKeeper();
            // Puis vérification toutes les 30 secondes
            setInterval(runTwapKeeper, 30000);
            break;
            
        case 'cancel-twap':
            console.log('🚪 Annulation de l\'ordre TWAP...');
            const orderIdToCancel = process.argv[3];
            await cancelTwapOrder(orderIdToCancel);
            break;
            
        case 'test-twap':
            console.log('🧪 Test de la stratégie TWAP...');
            await testTwapStrategy();
            break;
            
        case 'monitor-twap':
            console.log('👁️  Surveillance des ordres TWAP...');
            await monitorAllTwapOrders();
            break;
            
        default:
            console.log('🎯 Aqua Fi - Gestionnaire de liquidité automatisé pour Cetus');
            console.log('='.repeat(70));
            console.log('Commandes disponibles :');
            console.log('');
            console.log('📋 GESTION DES POSITIONS :');
            console.log('  📤 npm run create-position     : Créer une position de liquidité');
            console.log('');
            console.log('🤖 KEEPERS AUTOMATISÉS :');
            console.log('  🔄 npm run start-keeper        : Keeper classique (rééquilibrage adaptatif)');
            console.log('  💧 npm run start-buy-the-dip   : Keeper "Buy The Dip" (capture les baisses)');
            console.log('');
            console.log('🧪 OUTILS DE TEST :');
            console.log('  🔬 npm run test-buy-the-dip    : Tester la stratégie Buy The Dip');
            console.log('  🧪 npm run test-twap           : Tester la stratégie TWAP');
            console.log('  👁️  npm run monitor            : Mode monitoring (lecture seule)');
            console.log('  👁️  npm run monitor-twap       : Surveiller les ordres TWAP');
            console.log('');
            console.log('🎯 STRATÉGIES AVANCÉES :');
            console.log('  🏗️  npm run create-multi-range : Créer positions multi-range Buy The Dip');
            console.log('  🚪 npm run close-all-positions : Fermer toutes les positions');
            console.log('');
            console.log('⏳ STRATÉGIE TWAP (DCA) :');
            console.log('  📋 npm run create-twap-order [preset] : Créer ordre TWAP (conservative|moderate|aggressive)');
            console.log('  ⏳ npm run start-twap              : Démarrer le keeper TWAP automatique');
            console.log('  🚪 npm run cancel-twap [order_id]    : Annuler un ordre TWAP');
            console.log('');
            console.log('🏦 GESTION DU GAS :');
            console.log('  🏦 npm run create-gas-vault    : Créer un coffre-fort pour le gas');
            console.log('  💰 npm run deposit-gas [amount] : Déposer SUI (ex: npm run deposit-gas 1.5)');
            console.log('  💸 npm run withdraw-gas [amount]: Retirer SUI (ex: npm run withdraw-gas 0.5)');
            console.log('  📊 npm run gas-status          : Vérifier le solde du coffre-fort');
            console.log('  💰 npm run list-gas           : Lister tous les coins SUI');
            console.log('  🔍 npm run analyze-gas         : Analyser l\'optimisation du gas');
            console.log('  🔄 npm run split-sui           : Diviser un coin SUI');
            console.log('');
            console.log('='.repeat(70));
            console.log('💡 Astuce: Assurez-vous d\'avoir configuré votre .env avec POSITION_ID');
            console.log('');
    }
}

main().catch((error) => {
    console.error('💥 Une erreur fatale est survenue :', error);
    process.exit(1);
});
