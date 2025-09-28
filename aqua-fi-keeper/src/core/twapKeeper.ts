// Fichier: src/core/twapKeeper.ts
// Keeper TWAP (Time-Weighted Average Price) - Exécution automatique d'ordres DCA

import { Transaction } from '@mysten/sui/transactions';
import { suiClient, cetusSdk, keypair } from '../utils/sui';
import { POOL_ID, COIN_TYPE_SUI, COIN_TYPE_USDC } from '../utils/constants';

// --- CONFIGURATION DU KEEPER TWAP ---

const AQUA_FI_PACKAGE_ID = process.env.TWAP_PACKAGE_ID || '0x320f72b44af6155c55d921dfd10d4447649b2a9463f95b535caa39cf7582e3dc';

// L'ID de l'ordre TWAP que vous voulez gérer.
const TWAP_ORDER_ID = process.env.TWAP_ORDER_ID;

// --- LOGIQUE DU KEEPER ---

export async function runTwapKeeper() {
    if (!TWAP_ORDER_ID) {
        console.error("❌ ERREUR : TWAP_ORDER_ID n'est pas défini dans le fichier .env.");
        console.error("💡 Créez d'abord un ordre TWAP avec 'npm run create-twap-order'");
        return;
    }
    if (!AQUA_FI_PACKAGE_ID.startsWith('0x')) {
        console.error("❌ ERREUR : Veuillez définir AQUA_FI_PACKAGE_ID dans .env.");
        return;
    }

    console.log(`\n--- ⏳ Aqua Fi TWAP Keeper @ ${new Date().toLocaleTimeString()} ---`);
    console.log(`📦 Package: ${AQUA_FI_PACKAGE_ID}`);
    console.log(`📋 Ordre TWAP: ${TWAP_ORDER_ID}`);

    try {
        // 1. Récupérer l'état de l'ordre TWAP
        console.log('🔍 Vérification de l\'état de l\'ordre TWAP...');
        const orderObject = await suiClient.getObject({
            id: TWAP_ORDER_ID,
            options: { showContent: true },
        });

        if (!orderObject.data || !orderObject.data.content || !('fields' in orderObject.data.content)) {
            throw new Error("Impossible de récupérer les données de l'ordre TWAP.");
        }

        const order = orderObject.data.content.fields as any;

        // 2. Analyser l'état de l'ordre
        const isActive = order.is_active;
        const ordersExecuted = parseInt(order.orders_executed);
        const totalOrders = parseInt(order.total_orders);
        const intervalMs = parseInt(order.interval_ms);
        const lastExecutionTime = parseInt(order.last_execution_time_ms);
        const orderAmount = parseInt(order.order_amount);

        console.log(`📊 Statut de l'ordre:`);
        console.log(`   🔄 Actif: ${isActive}`);
        console.log(`   📈 Progrès: ${ordersExecuted}/${totalOrders} swaps`);
        console.log(`   ⏱️  Intervalle: ${intervalMs / 1000}s`);
        console.log(`   💰 Montant par swap: ${orderAmount / 1000000000} SUI`);

        // 3. Vérifier si l'ordre est éligible pour une exécution
        if (!isActive || ordersExecuted >= totalOrders) {
            console.log('✅ Ordre inactif ou terminé. Aucune action requise.');
            return;
        }

        const currentTime = Date.now();
        const nextExecutionTime = lastExecutionTime + intervalMs;

        if (currentTime < nextExecutionTime) {
            const waitTime = Math.round((nextExecutionTime - currentTime) / 1000);
            console.log(`🕒 Prochain swap prévu dans ${waitTime} secondes.`);
            return;
        }

        console.log('🔥 Conditions remplies! Déclenchement du prochain swap TWAP...');
        await executeTwapSwap(TWAP_ORDER_ID);

    } catch (error) {
        console.error("❌ Une erreur est survenue dans la boucle du keeper TWAP:", error);
    }
}

async function executeTwapSwap(orderId: string) {
    console.log(`🚀 Exécution du swap TWAP pour l'ordre ${orderId}...`);

    try {
        // Pour la simulation, nous créons un coin USDC vide pour le swap
        const txb = new Transaction();

        // Créer un coin USDC vide pour la simulation
        const [zeroCoin] = txb.splitCoins(txb.gas, [txb.pure.u64(0)]);

        txb.moveCall({
            target: `${AQUA_FI_PACKAGE_ID}::cetus_position::execute_twap_swap_simulation`,
            typeArguments: [COIN_TYPE_SUI, COIN_TYPE_USDC],
            arguments: [
                txb.object(orderId),
                zeroCoin, // Coin de simulation
                txb.object('0x6') // Clock
            ],
        });

        txb.setGasBudget(10_000_000);

        const result = await suiClient.signAndExecuteTransaction({
            signer: keypair,
            transaction: txb,
            options: { 
                showEffects: true,
                showEvents: true 
            },
        });

        if (result.effects?.status.status === 'success') {
            console.log('✅ Swap TWAP exécuté avec succès!');
            console.log(`📜 Transaction: ${result.digest}`);
            
            // Afficher les événements émis
            if (result.events && result.events.length > 0) {
                result.events.forEach((event: any, index: number) => {
                    if (event.type.includes('TWAPSwapExecuted')) {
                        console.log(`📢 Événement ${index + 1}:`, event.parsedJson);
                    } else if (event.type.includes('TWAPOrderCompleted')) {
                        console.log(`🎉 Ordre TWAP terminé!`, event.parsedJson);
                    }
                });
            }
        } else {
            console.error('❌ Échec du swap TWAP:', result.effects?.status.error);
        }
    } catch (error) {
        console.error("❌ Erreur lors de l'exécution de la transaction de swap:", error);
    }
}

// Fonction pour surveiller plusieurs ordres TWAP
export async function monitorAllTwapOrders() {
    console.log('\n📊 === SURVEILLANCE DES ORDRES TWAP ===');
    
    // TODO: Implémenter la récupération de tous les ordres TWAP de l'utilisateur
    // Pour l'instant, on surveille l'ordre configuré dans .env
    if (TWAP_ORDER_ID) {
        await runTwapKeeper();
    } else {
        console.log('ℹ️  Aucun ordre TWAP configuré dans .env');
    }
}

// Fonction pour tester la stratégie TWAP
export async function testTwapStrategy() {
    console.log('\n🧪 === TEST DE LA STRATÉGIE TWAP ===');
    
    // Simuler différents scénarios de TWAP
    const testScenarios = [
        { amount: 1000000000, orders: 10, interval: 60000 }, // 1 SUI, 10 ordres, 1 min
        { amount: 500000000, orders: 5, interval: 300000 },  // 0.5 SUI, 5 ordres, 5 min
        { amount: 2000000000, orders: 20, interval: 30000 }, // 2 SUI, 20 ordres, 30s
    ];

    console.log('📊 Scénarios de test:');
    testScenarios.forEach((scenario, index) => {
        const duration = (scenario.orders * scenario.interval) / 1000 / 60; // en minutes
        const amountPerOrder = scenario.amount / scenario.orders / 1000000000; // en SUI
        
        console.log(`   ${index + 1}. ${scenario.amount / 1000000000} SUI sur ${duration.toFixed(1)} min`);
        console.log(`      → ${amountPerOrder.toFixed(4)} SUI toutes les ${scenario.interval / 1000}s`);
    });

    console.log('\n✅ Utilisez create-twap-order pour créer un ordre réel');
}
