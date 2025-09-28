// Fichier: src/actions/rebalancePosition.ts
// Action pour rééquilibrer une position existante

import { Transaction } from '@mysten/sui/transactions';
import { suiClient, keypair } from '../utils/sui';

const AQUA_FI_PACKAGE_ID = process.env.AQUA_FI_PACKAGE_ID || '0x63108ff9f857574a5cea51f7a61b9781d581e4b974761617f72d53a27982bc8c';

export async function rebalancePosition(positionId: string, newTickLower: number, newTickUpper: number) {
    console.log(`🔄 Rééquilibrage de la position ${positionId}`);
    console.log(`📊 Nouveaux ticks: [${newTickLower}, ${newTickUpper}]`);

    try {
        const txb = new Transaction();
        
        txb.moveCall({
            target: `${AQUA_FI_PACKAGE_ID}::cetus_position::rebalance_position_entry`,
            arguments: [
                txb.object(positionId),
                txb.pure.u32(Math.floor(newTickLower)),
                txb.pure.u32(Math.floor(newTickUpper))
            ]
        });

        txb.setGasBudget(10_000_000);

        const result = await suiClient.signAndExecuteTransaction({
            signer: keypair,
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
        console.error('❌ Erreur lors du rééquilibrage:', error);
    }
}
