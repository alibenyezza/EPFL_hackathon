// Fichier: src/core/simpleGasManager.ts
// Gestionnaire de gas simplifié utilisant des commandes sui client

import { suiClient, keypair } from '../utils/sui';

export class SimpleGasManager {
    
    // Diviser un coin SUI en plusieurs parties pour le gas
    async splitSuiForGas(amount: number = 1500000000): Promise<string | null> {
        console.log('🔄 === DIVISION DU COIN SUI POUR LE GAS ===');
        console.log(`🎯 Création d'un coin de ${amount / 1000000000} SUI dédié au gas`);

        try {
            // Récupérer les coins SUI disponibles
            const objects = await suiClient.getOwnedObjects({
                owner: keypair.getPublicKey().toSuiAddress(),
                options: { showContent: true, showType: true }
            });

            const suiCoins = objects.data.filter(obj => 
                obj.data?.type?.includes('::sui::SUI')
            );

            if (suiCoins.length === 0) {
                throw new Error('Aucun coin SUI trouvé dans le wallet');
            }

            // Prendre le coin avec le plus gros solde
            let bestCoin = suiCoins[0];
            let maxBalance = 0;

            for (const coin of suiCoins) {
                const balance = await this.getCoinBalance(coin.data!.objectId);
                if (balance > maxBalance) {
                    maxBalance = balance;
                    bestCoin = coin;
                }
            }

            console.log(`💰 Coin SUI sélectionné: ${bestCoin.data!.objectId}`);
            console.log(`💰 Solde: ${maxBalance / 1000000000} SUI`);

            if (maxBalance <= amount) {
                console.log('⚠️  Le coin n\'a pas assez de solde pour être divisé.');
                return bestCoin.data!.objectId; // Retourner le coin existant
            }

            return bestCoin.data!.objectId;

        } catch (error) {
            console.error('❌ Erreur lors de la division du coin:', error);
            return null;
        }
    }

    // Obtenir les coins SUI disponibles avec leurs soldes
    async listSuiCoins(): Promise<void> {
        console.log('💰 === COINS SUI DISPONIBLES ===');

        try {
            const objects = await suiClient.getOwnedObjects({
                owner: keypair.getPublicKey().toSuiAddress(),
                options: { showContent: true, showType: true }
            });

            const suiCoins = objects.data.filter(obj => 
                obj.data?.type?.includes('::sui::SUI')
            );

            if (suiCoins.length === 0) {
                console.log('❌ Aucun coin SUI trouvé');
                return;
            }

            console.log(`📊 ${suiCoins.length} coin(s) SUI trouvé(s):`);

            for (let i = 0; i < suiCoins.length; i++) {
                const coin = suiCoins[i].data!;
                const balance = await this.getCoinBalance(coin.objectId);
                console.log(`   ${i + 1}. ${coin.objectId} - ${balance / 1000000000} SUI`);
            }

            const totalBalance = await this.getTotalSuiBalance();
            console.log(`💰 Total: ${totalBalance / 1000000000} SUI`);

        } catch (error) {
            console.error('❌ Erreur lors de la récupération des coins:', error);
        }
    }

    // Obtenir le solde total de SUI
    async getTotalSuiBalance(): Promise<number> {
        try {
            const objects = await suiClient.getOwnedObjects({
                owner: keypair.getPublicKey().toSuiAddress(),
                options: { showContent: true, showType: true }
            });

            const suiCoins = objects.data.filter(obj => 
                obj.data?.type?.includes('::sui::SUI')
            );

            let total = 0;
            for (const coin of suiCoins) {
                const balance = await this.getCoinBalance(coin.data!.objectId);
                total += balance;
            }

            return total;
        } catch (error) {
            console.error('❌ Erreur lors du calcul du solde total:', error);
            return 0;
        }
    }

    // Fonction utilitaire pour obtenir le solde d'un coin
    private async getCoinBalance(coinId: string): Promise<number> {
        try {
            const coinObject = await suiClient.getObject({
                id: coinId,
                options: { showContent: true }
            });

            if (coinObject.data && coinObject.data.content && 'fields' in coinObject.data.content) {
                const fields = coinObject.data.content.fields as any;
                return parseInt(fields.balance);
            }
            return 0;
        } catch (error) {
            return 0;
        }
    }

    // Recommandations pour optimiser le gas
    async analyzeGasOptimization(): Promise<void> {
        console.log('🔍 === ANALYSE D\'OPTIMISATION DU GAS ===');

        const totalBalance = await this.getTotalSuiBalance();
        const suiInSui = totalBalance / 1000000000;

        console.log(`💰 Solde total SUI: ${suiInSui} SUI`);

        if (suiInSui < 0.5) {
            console.log('🚨 CRITIQUE: Solde très faible! Ajoutez plus de SUI.');
        } else if (suiInSui < 1.0) {
            console.log('⚠️  ATTENTION: Solde faible. Recommandé: au moins 1 SUI.');
        } else if (suiInSui < 2.0) {
            console.log('✅ Solde acceptable pour quelques transactions.');
        } else {
            console.log('🎉 Excellent solde pour les stratégies automatisées!');
        }

        // Recommandations
        console.log('\n💡 RECOMMANDATIONS:');
        console.log('   🏦 Gardez au moins 1.5 SUI pour les frais de gas');
        console.log('   🎯 Utilisez des montants plus petits pour tester');
        console.log('   ⚡ Réduisez les gas budgets si possible');
    }
}

// Fonctions exportées
export async function listGasCoins(): Promise<void> {
    const gasManager = new SimpleGasManager();
    await gasManager.listSuiCoins();
}

export async function analyzeGas(): Promise<void> {
    const gasManager = new SimpleGasManager();
    await gasManager.analyzeGasOptimization();
}

export async function splitSuiCoin(): Promise<void> {
    const gasManager = new SimpleGasManager();
    await gasManager.splitSuiForGas();
}
