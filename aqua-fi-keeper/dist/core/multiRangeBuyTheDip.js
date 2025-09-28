"use strict";
// Fichier: src/core/multiRangeBuyTheDip.ts
// Stratégie Buy The Dip avec plusieurs ranges et allocations
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiRangeBuyTheDipStrategy = void 0;
exports.createMultiRangeBuyTheDipStrategy = createMultiRangeBuyTheDipStrategy;
exports.closeAllBuyTheDipPositions = closeAllBuyTheDipPositions;
exports.monitorBuyTheDipPositions = monitorBuyTheDipPositions;
const transactions_1 = require("@mysten/sui/transactions");
const sui_1 = require("../utils/sui");
const constants_1 = require("../utils/constants");
// Configuration de la stratégie multi-ranges
const AQUA_FI_PACKAGE_ID = process.env.AQUA_FI_PACKAGE_ID || '0xb77c5df0d1ce9d4513069e657e4beca98350ed3d5b9e296696d31412487336fc';
const MULTI_RANGE_CONFIG = [
    {
        dipPercentage: 200, // 2% de baisse
        allocation: 20, // 20% des fonds
        rangeWidth: 50, // Range étroite
        description: "Dip léger (2%)"
    },
    {
        dipPercentage: 500, // 5% de baisse
        allocation: 30, // 30% des fonds
        rangeWidth: 100, // Range moyenne
        description: "Dip modéré (5%)"
    },
    {
        dipPercentage: 1000, // 10% de baisse
        allocation: 30, // 30% des fonds
        rangeWidth: 150, // Range large
        description: "Dip important (10%)"
    },
    {
        dipPercentage: 2000, // 20% de baisse
        allocation: 20, // 20% des fonds
        rangeWidth: 200, // Range très large
        description: "Crash (20%)"
    }
];
class MultiRangeBuyTheDipStrategy {
    constructor() {
        this.positions = [];
        this.tickSpacing = 10;
        console.log('🏗️  Initialisation de la stratégie Multi-Range Buy The Dip');
        console.log(`📊 ${MULTI_RANGE_CONFIG.length} ranges configurés:`);
        MULTI_RANGE_CONFIG.forEach((config, index) => {
            console.log(`   ${index + 1}. ${config.description} - ${config.allocation}% des fonds`);
        });
    }
    // Calculer les ranges basés sur le prix actuel
    calculateRanges(currentTick) {
        return MULTI_RANGE_CONFIG.map(config => {
            const dipTicks = Math.floor(currentTick * (config.dipPercentage / 10000));
            const targetCenterTick = currentTick - dipTicks;
            const halfWidth = config.rangeWidth / 2;
            const tickLower = Math.max(0, Math.floor((targetCenterTick - halfWidth) / this.tickSpacing) * this.tickSpacing);
            const tickUpper = Math.floor((targetCenterTick + halfWidth) / this.tickSpacing) * this.tickSpacing;
            return {
                tickLower,
                tickUpper,
                allocation: config.allocation,
                description: config.description
            };
        });
    }
    // Créer toutes les positions pour la stratégie
    async createMultiRangePositions(totalUsdcAmount) {
        console.log('\n🚀 === CRÉATION DES POSITIONS MULTI-RANGE ===');
        try {
            // 1. Récupérer le prix actuel
            const pool = await sui_1.cetusSdk.Pool.getPool(constants_1.POOL_ID);
            if (!pool) {
                throw new Error("Impossible de récupérer les données du pool");
            }
            const currentTick = parseInt(pool.current_tick_index.toString());
            console.log(`📈 Prix actuel (tick): ${currentTick}`);
            // 2. Calculer les ranges
            const ranges = this.calculateRanges(currentTick);
            console.log('\n📊 Ranges calculés:');
            ranges.forEach((range, index) => {
                console.log(`   ${index + 1}. ${range.description}: [${range.tickLower}, ${range.tickUpper}] - ${range.allocation}%`);
            });
            // 3. Récupérer les coins disponibles
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
            if (suiCoins.length === 0 || usdcCoins.length === 0) {
                throw new Error('Coins SUI ou USDC introuvables');
            }
            console.log(`💰 ${suiCoins.length} coin(s) SUI trouvé(s)`);
            console.log(`💰 ${usdcCoins.length} coin(s) USDC trouvé(s)`);
            // 4. Créer les positions une par une
            const createdPositions = [];
            for (let i = 0; i < ranges.length; i++) {
                const range = ranges[i];
                console.log(`\n🔨 Création de la position ${i + 1}/${ranges.length}: ${range.description}`);
                try {
                    const positionId = await this.createSinglePosition(range.tickLower, range.tickUpper, suiCoins[0], // Utiliser le premier coin SUI
                    usdcCoins[0], // Utiliser le premier coin USDC
                    range.description);
                    if (positionId) {
                        createdPositions.push(positionId);
                        this.positions.push({
                            id: positionId,
                            tickLower: range.tickLower,
                            tickUpper: range.tickUpper,
                            allocation: range.allocation,
                            description: range.description
                        });
                        console.log(`✅ Position créée: ${positionId}`);
                    }
                }
                catch (error) {
                    console.error(`❌ Erreur lors de la création de la position ${i + 1}:`, error);
                }
                // Petite pause entre les créations
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            console.log(`\n🎉 Stratégie déployée avec succès!`);
            console.log(`📈 ${createdPositions.length} positions créées sur ${ranges.length} prévues`);
            return createdPositions;
        }
        catch (error) {
            console.error('❌ Erreur lors de la création des positions multi-range:', error);
            return [];
        }
    }
    // Créer une position individuelle
    async createSinglePosition(tickLower, tickUpper, suiCoin, usdcCoin, description) {
        try {
            const txb = new transactions_1.Transaction();
            txb.moveCall({
                target: `${AQUA_FI_PACKAGE_ID}::cetus_position::create_position`,
                arguments: [
                    txb.pure.address(constants_1.POOL_ID),
                    txb.pure.u32(tickLower),
                    txb.pure.u32(tickUpper),
                    txb.object(suiCoin.objectId),
                    txb.object(usdcCoin.objectId),
                    txb.object('0x6') // Clock object
                ],
                typeArguments: [constants_1.COIN_TYPE_SUI, constants_1.COIN_TYPE_USDC]
            });
            txb.setGasBudget(5000000);
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
                // Trouver l'ID de la position créée
                const createdObjects = result.objectChanges?.filter((change) => change.type === 'created' &&
                    change.objectType?.includes('CetusPosition'));
                if (createdObjects && createdObjects.length > 0) {
                    return createdObjects[0].objectId;
                }
            }
            return null;
        }
        catch (error) {
            console.error(`❌ Erreur lors de la création de la position ${description}:`, error);
            return null;
        }
    }
    // Fermer toutes les positions
    async closeAllPositions() {
        console.log('\n🚪 === FERMETURE DE TOUTES LES POSITIONS ===');
        if (this.positions.length === 0) {
            console.log('ℹ️  Aucune position à fermer');
            return;
        }
        console.log(`🔄 Fermeture de ${this.positions.length} position(s)...`);
        for (const position of this.positions) {
            try {
                console.log(`🔨 Fermeture de la position: ${position.description} (${position.id})`);
                const txb = new transactions_1.Transaction();
                txb.moveCall({
                    target: `${AQUA_FI_PACKAGE_ID}::cetus_position::destroy_position`,
                    arguments: [
                        txb.object(position.id)
                    ]
                });
                txb.setGasBudget(3000000);
                const result = await sui_1.suiClient.signAndExecuteTransaction({
                    signer: sui_1.keypair,
                    transaction: txb,
                    options: {
                        showEffects: true,
                        showEvents: true
                    }
                });
                if (result.effects?.status.status === 'success') {
                    console.log(`✅ Position fermée: ${position.description}`);
                }
                else {
                    console.error(`❌ Échec de la fermeture: ${position.description}`);
                }
            }
            catch (error) {
                console.error(`❌ Erreur lors de la fermeture de ${position.description}:`, error);
            }
            // Petite pause entre les fermetures
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        // Vider la liste des positions
        this.positions = [];
        console.log('🎉 Toutes les positions ont été fermées');
    }
    // Obtenir le statut de toutes les positions
    async getPositionsStatus() {
        console.log('\n📊 === STATUT DES POSITIONS ===');
        if (this.positions.length === 0) {
            console.log('ℹ️  Aucune position active');
            return;
        }
        for (const position of this.positions) {
            try {
                const positionObject = await sui_1.suiClient.getObject({
                    id: position.id,
                    options: { showContent: true }
                });
                if (positionObject.data) {
                    console.log(`✅ ${position.description}:`);
                    console.log(`   📍 ID: ${position.id}`);
                    console.log(`   📊 Range: [${position.tickLower}, ${position.tickUpper}]`);
                    console.log(`   💰 Allocation: ${position.allocation}%`);
                }
                else {
                    console.log(`❌ ${position.description}: Position non trouvée (probablement fermée)`);
                }
            }
            catch (error) {
                console.log(`❌ ${position.description}: Erreur lors de la vérification`);
            }
        }
    }
    // Obtenir les positions actives
    getActivePositions() {
        return [...this.positions];
    }
}
exports.MultiRangeBuyTheDipStrategy = MultiRangeBuyTheDipStrategy;
// Fonctions exportées pour l'utilisation dans index.ts
async function createMultiRangeBuyTheDipStrategy() {
    const strategy = new MultiRangeBuyTheDipStrategy();
    await strategy.createMultiRangePositions(1000000); // 1 USDC par défaut
}
async function closeAllBuyTheDipPositions() {
    const strategy = new MultiRangeBuyTheDipStrategy();
    // TODO: Charger les positions existantes depuis un fichier ou la blockchain
    await strategy.closeAllPositions();
}
async function monitorBuyTheDipPositions() {
    const strategy = new MultiRangeBuyTheDipStrategy();
    // TODO: Charger les positions existantes
    await strategy.getPositionsStatus();
}
