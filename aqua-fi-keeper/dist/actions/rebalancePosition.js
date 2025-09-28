"use strict";
// Fichier: src/actions/rebalancePosition.ts
// Action pour rééquilibrer une position existante
Object.defineProperty(exports, "__esModule", { value: true });
exports.rebalancePosition = rebalancePosition;
const transactions_1 = require("@mysten/sui/transactions");
const sui_1 = require("../utils/sui");
const AQUA_FI_PACKAGE_ID = process.env.AQUA_FI_PACKAGE_ID || '0x63108ff9f857574a5cea51f7a61b9781d581e4b974761617f72d53a27982bc8c';
async function rebalancePosition(positionId, newTickLower, newTickUpper) {
    console.log(`🔄 Rééquilibrage de la position ${positionId}`);
    console.log(`📊 Nouveaux ticks: [${newTickLower}, ${newTickUpper}]`);
    try {
        const txb = new transactions_1.Transaction();
        txb.moveCall({
            target: `${AQUA_FI_PACKAGE_ID}::cetus_position::rebalance_position_entry`,
            arguments: [
                txb.object(positionId),
                txb.pure.u32(Math.floor(newTickLower)),
                txb.pure.u32(Math.floor(newTickUpper))
            ]
        });
        txb.setGasBudget(10000000);
        const result = await sui_1.suiClient.signAndExecuteTransaction({
            signer: sui_1.keypair,
            transaction: txb,
            options: {
                showEffects: true,
                showEvents: true
            }
        });
        if (result.effects?.status.status === 'success') {
            console.log('✅ Rééquilibrage réussi!');
            console.log(`📜 Transaction: ${result.digest}`);
            // Afficher les événements
            if (result.events && result.events.length > 0) {
                result.events.forEach((event, index) => {
                    if (event.type.includes('PositionRebalanced')) {
                        console.log(`📢 Événement ${index + 1}:`, event.parsedJson);
                    }
                });
            }
        }
        else {
            console.error('❌ Échec du rééquilibrage:', result.effects?.status.error);
        }
    }
    catch (error) {
        console.error('❌ Erreur lors du rééquilibrage:', error);
    }
}
