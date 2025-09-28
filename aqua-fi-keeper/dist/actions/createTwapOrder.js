"use strict";
// Fichier: src/actions/createTwapOrder.ts
// Action pour créer un nouvel ordre TWAP
Object.defineProperty(exports, "__esModule", { value: true });
exports.TWAP_PRESETS = void 0;
exports.cancelTwapOrder = cancelTwapOrder;
exports.createTwapOrder = createTwapOrder;
const transactions_1 = require("@mysten/sui/transactions");
const sui_1 = require("../utils/sui");
const constants_1 = require("../utils/constants");
const AQUA_FI_PACKAGE_ID = process.env.AQUA_FI_PACKAGE_ID || '0xb77c5df0d1ce9d4513069e657e4beca98350ed3d5b9e296696d31412487336fc';
async function createTwapOrderImpl(config) {
    console.log('🔄 === CRÉATION D\'UN ORDRE TWAP ===');
    console.log(`💰 Montant total: ${config.totalAmount / 1000000000} SUI`);
    console.log(`🔢 Nombre de swaps: ${config.totalOrders}`);
    console.log(`⏱️  Intervalle: ${config.intervalSeconds}s`);
    console.log(`📊 Montant par swap: ${(config.totalAmount / config.totalOrders) / 1000000000} SUI`);
    try {
        // 1. Récupérer les coins disponibles
        const objects = await sui_1.suiClient.getOwnedObjects({
            owner: sui_1.keypair.getPublicKey().toSuiAddress(),
            options: { showContent: true, showType: true }
        });
        let suiCoins = [];
        let usdcCoins = [];
        for (const obj of objects.data) {
            if (obj.data?.type?.includes('::sui::SUI')) {
                suiCoins.push(obj.data);
            }
            else if (obj.data?.type?.includes('::usdc::USDC')) {
                usdcCoins.push(obj.data);
            }
        }
        if (suiCoins.length === 0) {
            throw new Error('Aucun coin SUI trouvé dans le wallet');
        }
        console.log(`✅ ${suiCoins.length} coin(s) SUI trouvé(s)`);
        console.log(`✅ ${usdcCoins.length} coin(s) USDC trouvé(s)`);
        // 2. Sélectionner le coin SUI approprié
        let selectedSuiCoin = null;
        for (const coin of suiCoins) {
            const balance = await getCoinBalance(coin.objectId);
            if (balance >= config.totalAmount) {
                selectedSuiCoin = coin;
                break;
            }
        }
        if (!selectedSuiCoin) {
            throw new Error(`Aucun coin SUI avec suffisamment de solde (${config.totalAmount / 1000000000} SUI requis)`);
        }
        // 3. Créer un coin USDC vide pour initialiser le trésor de sortie
        const txb = new transactions_1.Transaction();
        // Si on a des coins USDC, utiliser le premier, sinon créer un coin vide
        let initialUsdcCoin;
        if (usdcCoins.length > 0) {
            const [zeroCoin] = txb.splitCoins(txb.object(usdcCoins[0].objectId), [txb.pure.u64(0)]);
            initialUsdcCoin = zeroCoin;
        }
        else {
            // Créer un coin USDC vide à partir du gas
            const [zeroCoin] = txb.splitCoins(txb.gas, [txb.pure.u64(0)]);
            initialUsdcCoin = zeroCoin;
        }
        // 4. Diviser le coin SUI pour l'ordre TWAP
        let suiCoinForOrder;
        const coinBalance = await getCoinBalance(selectedSuiCoin.objectId);
        if (coinBalance > config.totalAmount) {
            const [splitCoin] = txb.splitCoins(txb.object(selectedSuiCoin.objectId), [txb.pure.u64(config.totalAmount)]);
            suiCoinForOrder = splitCoin;
        }
        else {
            suiCoinForOrder = txb.object(selectedSuiCoin.objectId);
        }
        // 5. Créer l'ordre TWAP
        txb.moveCall({
            target: `${AQUA_FI_PACKAGE_ID}::cetus_position::create_twap_order`,
            typeArguments: [constants_1.COIN_TYPE_SUI, constants_1.COIN_TYPE_USDC],
            arguments: [
                suiCoinForOrder,
                initialUsdcCoin,
                txb.pure.u64(config.totalOrders),
                txb.pure.u64(config.intervalSeconds * 1000), // Convertir en millisecondes
                txb.object('0x6') // Clock object
            ],
        });
        txb.setGasBudget(10000000);
        console.log('🚀 Création de l\'ordre TWAP...');
        const result = await sui_1.suiClient.signAndExecuteTransaction({
            signer: sui_1.keypair,
            transaction: txb,
            options: {
                showEffects: true,
                showEvents: true,
                showObjectChanges: true
            }
        });
        if (result.effects?.status.status === 'success') {
            console.log('✅ Ordre TWAP créé avec succès!');
            console.log(`📜 Transaction: ${result.digest}`);
            // Trouver l'ID de l'ordre créé
            const createdObjects = result.objectChanges?.filter((change) => change.type === 'created' &&
                change.objectType?.includes('TWAPOrder'));
            if (createdObjects && createdObjects.length > 0) {
                const orderId = createdObjects[0].objectId;
                console.log(`📋 Ordre TWAP ID: ${orderId}`);
                console.log('💡 Ajoutez cette ligne à votre fichier .env:');
                console.log(`TWAP_ORDER_ID=${orderId}`);
            }
            // Afficher les événements
            if (result.events && result.events.length > 0) {
                result.events.forEach((event, index) => {
                    if (event.type.includes('TWAPOrderCreated')) {
                        console.log(`📢 Événement ${index + 1}:`, event.parsedJson);
                    }
                });
            }
        }
        else {
            console.error('❌ Échec de la création de l\'ordre TWAP:', result.effects?.status.error);
        }
    }
    catch (error) {
        console.error('❌ Erreur lors de la création de l\'ordre TWAP:', error);
    }
}
// Fonction pour annuler un ordre TWAP
async function cancelTwapOrder(orderId) {
    const TWAP_ORDER_ID = process.env.TWAP_ORDER_ID;
    const targetOrderId = orderId || TWAP_ORDER_ID;
    if (!targetOrderId) {
        console.error('❌ Aucun ordre TWAP spécifié');
        return;
    }
    console.log(`🚪 Annulation de l'ordre TWAP: ${targetOrderId}`);
    try {
        const txb = new transactions_1.Transaction();
        txb.moveCall({
            target: `${AQUA_FI_PACKAGE_ID}::cetus_position::cancel_twap_order`,
            typeArguments: [constants_1.COIN_TYPE_SUI, constants_1.COIN_TYPE_USDC],
            arguments: [
                txb.object(targetOrderId)
            ],
        });
        txb.setGasBudget(5000000);
        const result = await sui_1.suiClient.signAndExecuteTransaction({
            signer: sui_1.keypair,
            transaction: txb,
            options: {
                showEffects: true,
                showEvents: true
            }
        });
        if (result.effects?.status.status === 'success') {
            console.log('✅ Ordre TWAP annulé avec succès!');
            console.log('💰 Les fonds restants ont été retournés à votre wallet');
        }
        else {
            console.error('❌ Échec de l\'annulation:', result.effects?.status.error);
        }
    }
    catch (error) {
        console.error('❌ Erreur lors de l\'annulation de l\'ordre TWAP:', error);
    }
}
// Fonction utilitaire pour obtenir le solde d'un coin
async function getCoinBalance(coinId) {
    try {
        const coinObject = await sui_1.suiClient.getObject({
            id: coinId,
            options: { showContent: true }
        });
        if (coinObject.data && coinObject.data.content && 'fields' in coinObject.data.content) {
            const fields = coinObject.data.content.fields;
            return parseInt(fields.balance);
        }
        return 0;
    }
    catch (error) {
        return 0;
    }
}
// Configurations prédéfinies pour différents types de TWAP
exports.TWAP_PRESETS = {
    // DCA conservateur: 1 SUI sur 10 minutes
    conservative: {
        totalAmount: 1000000000, // 1 SUI
        totalOrders: 10,
        intervalSeconds: 60 // 1 minute
    },
    // DCA modéré: 2 SUI sur 30 minutes
    moderate: {
        totalAmount: 2000000000, // 2 SUI
        totalOrders: 15,
        intervalSeconds: 120 // 2 minutes
    },
    // DCA agressif: 5 SUI sur 1 heure
    aggressive: {
        totalAmount: 5000000000, // 5 SUI
        totalOrders: 20,
        intervalSeconds: 180 // 3 minutes
    }
};
// Fonction wrapper pour l'export
async function createTwapOrder(config) {
    return await createTwapOrderImpl(config);
}
