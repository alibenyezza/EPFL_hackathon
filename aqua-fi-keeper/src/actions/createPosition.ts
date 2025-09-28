// Fichier: src/actions/createPosition.ts
// Action pour créer une nouvelle position sur Cetus

import { Transaction } from '@mysten/sui/transactions';
import { suiClient, cetusSdk, keypair } from '../utils/sui';
import { POOL_ID, COIN_TYPE_SUI, COIN_TYPE_USDC } from '../utils/constants';

const AQUA_FI_PACKAGE_ID = process.env.AQUA_FI_PACKAGE_ID || '0x63108ff9f857574a5cea51f7a61b9781d581e4b974761617f72d53a27982bc8c';

export async function createPosition() {
    console.log('🔍 Recherche des coins disponibles...');
    
    try {
        // Récupérer les objets du wallet
        const objects = await suiClient.getOwnedObjects({
            owner: keypair.getPublicKey().toSuiAddress(),
            options: { showContent: true, showType: true }
        });

        // Trouver les coins SUI et USDC
        let suiCoins: any[] = [];
        let usdcCoin: any = null;

        for (const obj of objects.data) {
            if (obj.data?.type?.includes('::sui::SUI')) {
                suiCoins.push(obj.data);
            } else if (obj.data?.type?.includes('::usdc::USDC')) {
                usdcCoin = obj.data;
            }
        }

        // Sélectionner le premier coin SUI pour la transaction (le plus gros sera automatiquement utilisé pour le gas)
        const suiCoin = suiCoins[0];

        if (!suiCoin || !usdcCoin) {
            throw new Error('Coins SUI ou USDC introuvables dans le wallet');
        }

        if (suiCoins.length < 2) {
            console.log('⚠️  Attention: Un seul coin SUI trouvé. Il sera utilisé à la fois pour la transaction et le gas.');
        }

        console.log(`✅ SUI Coin trouvé: ${suiCoin.objectId}`);
        console.log(`✅ USDC Coin trouvé: ${usdcCoin.objectId}`);

        // Créer la transaction
        const txb = new Transaction();
        
        txb.moveCall({
            target: `${AQUA_FI_PACKAGE_ID}::cetus_position::create_position`,
            arguments: [
                txb.pure.address(POOL_ID),
                txb.pure.u32(36020),  // tick_lower
                txb.pure.u32(88730),  // tick_upper
                txb.object(suiCoin.objectId),
                txb.object(usdcCoin.objectId),
                txb.object('0x6') // Clock object
            ],
            typeArguments: [COIN_TYPE_SUI, COIN_TYPE_USDC]
        });

        // Spécifier explicitement le gas payment si on a plusieurs coins SUI
        if (suiCoins.length > 1) {
            // Utiliser un autre coin SUI pour le gas
            txb.setGasPayment([{
                objectId: suiCoins[1].objectId,
                version: suiCoins[1].version,
                digest: suiCoins[1].digest
            }]);
        }
        
        // Utiliser un gas budget plus petit pour éviter le problème
        txb.setGasBudget(5_000_000);

        console.log('🚀 Création de la position...');
        
        const result = await suiClient.signAndExecuteTransaction({
            signer: keypair,
            transaction: txb,
            options: {
                showEffects: true,
                showEvents: true,
                showObjectChanges: true
            }
        });

        if (result.effects?.status.status === 'success') {
            console.log('✅ Position créée avec succès!');
            console.log(`📜 Transaction: ${result.digest}`);

            // Trouver l'ID de la position créée
            const createdObjects = result.objectChanges?.filter((change: any) => 
                change.type === 'created' && 
                change.objectType?.includes('CetusPosition')
            );

            if (createdObjects && createdObjects.length > 0) {
                const positionId = (createdObjects[0] as any).objectId;
                console.log(`🎯 Position ID: ${positionId}`);
                console.log('💡 Ajoutez cette ligne à votre fichier .env:');
                console.log(`POSITION_ID=${positionId}`);
            }

            // Afficher les événements
            if (result.events && result.events.length > 0) {
                result.events.forEach((event: any, index: number) => {
                    if (event.type.includes('PositionCreated')) {
                        console.log(`📢 Événement ${index + 1}:`, event.parsedJson);
                    }
                });
            }
        } else {
            console.error('❌ Échec de la création de position:', result.effects?.status.error);
        }

    } catch (error) {
        console.error('❌ Erreur lors de la création de position:', error);
    }
}
