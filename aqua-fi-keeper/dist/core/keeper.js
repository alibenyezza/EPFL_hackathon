"use strict";
// Fichier: src/core/keeper.ts
// Keeper classique avec stratégie adaptative
Object.defineProperty(exports, "__esModule", { value: true });
exports.runKeeperLoop = runKeeperLoop;
const sui_1 = require("../utils/sui");
const constants_1 = require("../utils/constants");
const strategy_1 = require("./strategy");
const rebalancePosition_1 = require("../actions/rebalancePosition");
async function runKeeperLoop() {
    const positionId = process.env.POSITION_ID;
    if (!positionId) {
        console.error("❌ ERREUR : POSITION_ID n'est pas défini dans .env.");
        console.error("💡 Exécutez 'npm run create-position' d'abord pour créer une position.");
        return;
    }
    console.log(`\n--- 🔄 Vérification à ${new Date().toLocaleTimeString()} ---`);
    console.log(`🏊 Pool: ${constants_1.POOL_ID}`);
    console.log(`📍 Position: ${positionId}`);
    try {
        // 1. Récupérer les informations du pool et de la position
        console.log('📊 Récupération des données...');
        const [pool] = await Promise.all([
            sui_1.cetusSdk.Pool.getPool(constants_1.POOL_ID)
        ]);
        // Récupérer la position depuis Sui client
        const positionObject = await sui_1.suiClient.getObject({
            id: positionId,
            options: { showContent: true }
        });
        if (!pool || !positionObject.data) {
            throw new Error("Impossible de récupérer les infos du pool ou de la position.");
        }
        const position = positionObject.data.content;
        console.log(`💰 Liquidité actuelle: ${position.fields?.liquidity_amount_a || 'N/A'}`);
        console.log(`📈 Prix actuel (tick): ${pool.current_tick_index}`);
        // 2. Analyser si un rééquilibrage est nécessaire
        const newTicks = (0, strategy_1.checkAdaptiveStrategy)(pool, position);
        if (newTicks) {
            console.log('🚀 Déclenchement du rééquilibrage...');
            await (0, rebalancePosition_1.rebalancePosition)(positionId, newTicks.tick_lower, newTicks.tick_upper);
        }
        else {
            console.log('😌 Position stable, pas d\'action nécessaire.');
        }
    }
    catch (error) {
        console.error('❌ Erreur dans la boucle du keeper:', error);
    }
}
