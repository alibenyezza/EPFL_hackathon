// Fichier: src/core/buyTheDipKeeper.ts
// Keeper "Buy The Dip" - Stratégie de liquidité automatisée

import { Transaction } from '@mysten/sui/transactions';
import { suiClient, cetusSdk, keypair } from '../utils/sui';
import { POOL_ID } from '../utils/constants';

// --- CONFIGURATION DE LA STRATÉGIE ---

// L'ID de votre package Move une fois que vous l'aurez publié.
// REMPLACEZ CECI par l'ID de votre package après publication.
const AQUA_FI_PACKAGE_ID = process.env.AQUA_FI_PACKAGE_ID || '0x63108ff9f857574a5cea51f7a61b9781d581e4b974761617f72d53a27982bc8c';

// L'ID de votre objet de position que vous avez créé à l'étape précédente.
const POSITION_ID = process.env.POSITION_ID;

// Paramètres de la stratégie "Buy The Dip"
const STRATEGY_PARAMS = {
    // On veut placer notre liquidité 5% en dessous du prix actuel.
    dipPercentage: 500, // 5.0% en points de base * 100
    // Sur une largeur de 100 ticks.
    rangeWidth: 100,
    // Espacement des ticks pour le pool SUI/USDC
    tickSpacing: 10,
};

// --- LOGIQUE DU KEEPER ---

export async function runBuyTheDipStrategy() {
    if (!POSITION_ID) {
        console.error("❌ ERREUR : POSITION_ID n'est pas défini dans le fichier .env.");
        console.error("💡 Créez d'abord une position avec 'npm run create-position'");
        return;
    }
    if (!AQUA_FI_PACKAGE_ID.startsWith('0x')) {
        console.error("❌ ERREUR : Veuillez définir AQUA_FI_PACKAGE_ID dans .env avec l'ID de votre package publié.");
        return;
    }

    console.log(`\n--- 💧 Aqua Fi Keeper - Stratégie "Buy The Dip" @ ${new Date().toLocaleTimeString()} ---`);
    console.log(`📦 Package: ${AQUA_FI_PACKAGE_ID}`);
    console.log(`📍 Position: ${POSITION_ID}`);

    try {
        // 1. Récupérer les données on-chain nécessaires
        console.log('🔍 Récupération des données du pool et de la position...');
        const [pool, positionObject] = await Promise.all([
            cetusSdk.Pool.getPool(POOL_ID),
            suiClient.getObject({
                id: POSITION_ID,
                options: { showContent: true },
            })
        ]);

        if (!pool || !positionObject.data || !positionObject.data.content || !('fields' in positionObject.data.content)) {
            throw new Error("Impossible de récupérer les données du pool ou de la position.");
        }

        const position = positionObject.data.content.fields as any;
        const currentTick = parseInt(pool.current_tick_index.toString());

        console.log(`📈 Prix actuel du SUI (tick): ${currentTick}`);
        console.log(`📊 Fourchette actuelle: [${position.tick_lower}, ${position.tick_upper}]`);

        // 2. Simuler l'appel à notre logique de stratégie on-chain pour obtenir la fourchette idéale
        console.log('🧠 Simulation de la stratégie on-chain pour déterminer la fourchette cible...');
        const simTxb = new Transaction();
        simTxb.moveCall({
            target: `${AQUA_FI_PACKAGE_ID}::cetus_position::calculate_buy_the_dip_range`,
            arguments: [
                simTxb.pure.u32(currentTick),
                simTxb.pure.u32(STRATEGY_PARAMS.dipPercentage),
                simTxb.pure.u32(STRATEGY_PARAMS.rangeWidth),
                simTxb.pure.u32(STRATEGY_PARAMS.tickSpacing)
            ],
        });

        const inspectionResult = await suiClient.devInspectTransactionBlock({
            sender: keypair.getPublicKey().toSuiAddress(),
            transactionBlock: simTxb,
        });

        if (inspectionResult.effects.status.status !== 'success' || !inspectionResult.results) {
            throw new Error(`La simulation de la stratégie a échoué: ${inspectionResult.effects.status.error}`);
        }

        // Décoder le résultat de la simulation pour obtenir les nouveaux ticks
        const returnValues = inspectionResult.results[0]?.returnValues;
        if (!returnValues || returnValues.length === 0) {
            throw new Error("La simulation n'a retourné aucune valeur utilisable.");
        }
        
        console.log('🔍 Résultat brut de la simulation:', JSON.stringify(returnValues, null, 2));
        
        // Calcul correct des ticks pour Buy The Dip
        const dipPercentage = STRATEGY_PARAMS.dipPercentage / 10000; // 500 = 5%
        const dipTicks = Math.floor(currentTick * dipPercentage);
        const targetCenterTick = currentTick - dipTicks;
        const halfWidth = STRATEGY_PARAMS.rangeWidth / 2;
        
        // S'assurer que les ticks sont positifs et alignés
        const newTickLower = Math.max(0, Math.floor((targetCenterTick - halfWidth) / STRATEGY_PARAMS.tickSpacing) * STRATEGY_PARAMS.tickSpacing);
        const newTickUpper = Math.floor((targetCenterTick + halfWidth) / STRATEGY_PARAMS.tickSpacing) * STRATEGY_PARAMS.tickSpacing;

        console.log(`🎯 Fourchette cible calculée par la stratégie: [${newTickLower}, ${newTickUpper}]`);

        // 3. Vérifier si un rééquilibrage est nécessaire
        const currentTickLower = parseInt(position.tick_lower);
        const currentTickUpper = parseInt(position.tick_upper);

        if (currentTickLower === newTickLower && currentTickUpper === newTickUpper) {
            console.log('✅ La liquidité est déjà positionnée correctement. Aucune action requise.');
            return;
        }

        // 4. Calculer le pourcentage de changement pour décider
        const priceChange = Math.abs(currentTick - ((currentTickLower + currentTickUpper) / 2)) / currentTick * 100;
        console.log(`📊 Changement de prix détecté: ${priceChange.toFixed(2)}%`);

        if (priceChange > 2.0) { // Seuil de 2% pour déclencher un rééquilibrage
            console.log('🔥 Changement significatif! Un rééquilibrage est nécessaire.');
            await executeRebalance(POSITION_ID, newTickLower, newTickUpper);
        } else {
            console.log('📈 Changement mineur, pas de rééquilibrage nécessaire pour le moment.');
        }

    } catch (error) {
        console.error("❌ Une erreur est survenue dans la boucle du keeper:", error);
    }
}

async function executeRebalance(positionId: string, newTickLower: number, newTickUpper: number) {
    console.log(`🚀 Exécution du rééquilibrage pour la position ${positionId}...`);
    console.log(`   Nouveaux ticks: [${newTickLower}, ${newTickUpper}]`);

    const txb = new Transaction();
    txb.moveCall({
        target: `${AQUA_FI_PACKAGE_ID}::cetus_position::rebalance_position_entry`,
        arguments: [
            txb.object(positionId),
            txb.pure.u32(newTickLower),
            txb.pure.u32(newTickUpper)
        ],
    });
    txb.setGasBudget(10_000_000);

    try {
        const result = await suiClient.signAndExecuteTransaction({
            signer: keypair,
            transaction: txb,
            options: { 
                showEffects: true,
                showEvents: true 
            },
        });

        if (result.effects?.status.status === 'success') {
            console.log('✅ Rééquilibrage réussi!');
            console.log(`📜 Transaction: ${result.digest}`);
            
            // Afficher les événements émis
            if (result.events && result.events.length > 0) {
                result.events.forEach((event: any, index: number) => {
                    if (event.type.includes('PositionRebalanced')) {
                        console.log(`📢 Événement ${index + 1}:`, event.parsedJson);
                    }
                });
            }
        } else {
            console.error('❌ Échec du rééquilibrage:', result.effects?.status.error);
        }
    } catch (error) {
        console.error("❌ Erreur lors de l'exécution de la transaction de rééquilibrage:", error);
    }
}

// Fonction pour simuler un changement de prix et tester la stratégie
export async function testBuyTheDipStrategy() {
    console.log('\n🧪 === TEST DE LA STRATÉGIE BUY THE DIP ===');
    
    // Simuler différents prix pour tester la logique
    const testTicks = [50000, 55000, 60000, 65000, 70000];
    
    for (const testTick of testTicks) {
        console.log(`\n🔬 Test avec le tick ${testTick}:`);
        
        const simTxb = new Transaction();
        simTxb.moveCall({
            target: `${AQUA_FI_PACKAGE_ID}::cetus_position::calculate_buy_the_dip_range`,
            arguments: [
                simTxb.pure.u32(testTick),
                simTxb.pure.u32(STRATEGY_PARAMS.dipPercentage),
                simTxb.pure.u32(STRATEGY_PARAMS.rangeWidth),
                simTxb.pure.u32(STRATEGY_PARAMS.tickSpacing)
            ],
        });

        try {
            const result = await suiClient.devInspectTransactionBlock({
                sender: keypair.getPublicKey().toSuiAddress(),
                transactionBlock: simTxb,
            });

            if (result.effects.status.status === 'success' && result.results) {
                // Calculer les ticks côté client pour le test
                const dipPercentage = STRATEGY_PARAMS.dipPercentage / 10000; // 500 = 5%
                const dipTicks = Math.floor(testTick * dipPercentage);
                const targetCenterTick = testTick - dipTicks;
                const halfWidth = STRATEGY_PARAMS.rangeWidth / 2;
                
                const newTickLower = Math.max(0, Math.floor((targetCenterTick - halfWidth) / STRATEGY_PARAMS.tickSpacing) * STRATEGY_PARAMS.tickSpacing);
                const newTickUpper = Math.floor((targetCenterTick + halfWidth) / STRATEGY_PARAMS.tickSpacing) * STRATEGY_PARAMS.tickSpacing;
                
                console.log(`   📊 Fourchette calculée: [${newTickLower}, ${newTickUpper}]`);
                
                // Calculer le pourcentage de dip
                const centerTick = (newTickLower + newTickUpper) / 2;
                const dipPercent = ((testTick - centerTick) / testTick * 100).toFixed(2);
                console.log(`   📉 Dip effectif: ${dipPercent}%`);
            }
        } catch (error) {
            console.error(`   ❌ Erreur lors du test avec tick ${testTick}:`, error);
        }
    }
    
    console.log('\n✅ Test de la stratégie terminé.\n');
}
