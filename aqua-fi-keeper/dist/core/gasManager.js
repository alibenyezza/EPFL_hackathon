"use strict";
// Fichier: src/core/gasManager.ts
// Gestionnaire de gas pour les stratégies Aqua Fi
Object.defineProperty(exports, "__esModule", { value: true });
exports.GasManager = void 0;
exports.createGasVault = createGasVault;
exports.depositToGasVault = depositToGasVault;
exports.withdrawFromGasVault = withdrawFromGasVault;
exports.checkGasVaultStatus = checkGasVaultStatus;
const transactions_1 = require("@mysten/sui/transactions");
const sui_1 = require("../utils/sui");
const constants_1 = require("../utils/constants");
const AQUA_FI_PACKAGE_ID = process.env.AQUA_FI_PACKAGE_ID || '0xb77c5df0d1ce9d4513069e657e4beca98350ed3d5b9e296696d31412487336fc';
const TARGET_GAS_AMOUNT = 1500000000; // 1.5 SUI en MIST (1 SUI = 1,000,000,000 MIST)
class GasManager {
    constructor(gasVaultId) {
        this.gasVaultId = null;
        this.gasVaultId = gasVaultId || null;
    }
    // Créer un nouveau coffre-fort pour le gas
    async createGasVault() {
        console.log('🏦 === CRÉATION DU COFFRE-FORT GAZ ===');
        console.log(`🎯 Objectif: Stocker ${TARGET_GAS_AMOUNT / 1000000000} SUI pour les frais de transaction`);
        try {
            // Récupérer les coins SUI disponibles
            const objects = await sui_1.suiClient.getOwnedObjects({
                owner: sui_1.keypair.getPublicKey().toSuiAddress(),
                options: { showContent: true, showType: true }
            });
            const suiCoins = objects.data.filter(obj => obj.data?.type?.includes('::sui::SUI'));
            if (suiCoins.length === 0) {
                throw new Error('Aucun coin SUI trouvé dans le wallet');
            }
            console.log(`💰 ${suiCoins.length} coin(s) SUI trouvé(s)`);
            // Utiliser le premier coin SUI
            const suiCoin = suiCoins[0].data;
            console.log(`✅ Utilisation du coin SUI: ${suiCoin.objectId}`);
            // Créer la transaction
            const txb = new transactions_1.Transaction();
            // Si le coin a plus que nécessaire, le diviser
            let coinForVault = txb.object(suiCoin.objectId);
            // Vérifier le solde du coin
            const coinBalance = await this.getCoinBalance(suiCoin.objectId);
            console.log(`💰 Solde du coin SUI: ${coinBalance / 1000000000} SUI`);
            if (coinBalance > TARGET_GAS_AMOUNT) {
                // Diviser le coin pour ne prendre que ce qu'il faut
                const splitCoin = txb.splitCoins(txb.object(suiCoin.objectId), [txb.pure.u64(TARGET_GAS_AMOUNT)]);
                coinForVault = splitCoin;
                console.log(`🔄 Division du coin: ${TARGET_GAS_AMOUNT / 1000000000} SUI pour le coffre-fort`);
            }
            txb.moveCall({
                target: `${AQUA_FI_PACKAGE_ID}::cetus_position::create_gas_vault`,
                arguments: [
                    coinForVault,
                    txb.object('0x6') // Clock object
                ],
                typeArguments: [constants_1.COIN_TYPE_SUI]
            });
            txb.setGasBudget(5000000);
            console.log('🚀 Création du coffre-fort...');
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
                console.log('✅ Coffre-fort créé avec succès!');
                console.log(`📜 Transaction: ${result.digest}`);
                // Trouver l'ID du coffre-fort créé
                const createdObjects = result.objectChanges?.filter((change) => change.type === 'created' &&
                    change.objectType?.includes('GasVault'));
                if (createdObjects && createdObjects.length > 0) {
                    const vaultId = createdObjects[0].objectId;
                    this.gasVaultId = vaultId;
                    console.log(`🏦 Coffre-fort ID: ${vaultId}`);
                    console.log('💡 Ajoutez cette ligne à votre fichier .env:');
                    console.log(`GAS_VAULT_ID=${vaultId}`);
                    return vaultId;
                }
                // Afficher les événements
                if (result.events && result.events.length > 0) {
                    result.events.forEach((event, index) => {
                        if (event.type.includes('GasDeposited')) {
                            console.log(`📢 Événement ${index + 1}:`, event.parsedJson);
                        }
                    });
                }
            }
            else {
                console.error('❌ Échec de la création du coffre-fort:', result.effects?.status.error);
            }
            return null;
        }
        catch (error) {
            console.error('❌ Erreur lors de la création du coffre-fort:', error);
            return null;
        }
    }
    // Ajouter du SUI au coffre-fort
    async depositGas(amount) {
        if (!this.gasVaultId) {
            console.error('❌ Aucun coffre-fort configuré. Créez-en un d\'abord.');
            return false;
        }
        console.log(`💰 Ajout de ${amount / 1000000000} SUI au coffre-fort...`);
        try {
            // Récupérer un coin SUI
            const objects = await sui_1.suiClient.getOwnedObjects({
                owner: sui_1.keypair.getPublicKey().toSuiAddress(),
                options: { showContent: true, showType: true }
            });
            const suiCoins = objects.data.filter(obj => obj.data?.type?.includes('::sui::SUI') &&
                obj.data.objectId !== this.gasVaultId // Exclure le coffre-fort lui-même
            );
            if (suiCoins.length === 0) {
                throw new Error('Aucun coin SUI disponible pour le dépôt');
            }
            const suiCoin = suiCoins[0].data;
            const txb = new transactions_1.Transaction();
            // Diviser le coin si nécessaire
            let coinForDeposit = txb.object(suiCoin.objectId);
            const coinBalance = await this.getCoinBalance(suiCoin.objectId);
            if (coinBalance > amount) {
                const splitCoin = txb.splitCoins(txb.object(suiCoin.objectId), [txb.pure.u64(amount)]);
                coinForDeposit = splitCoin;
            }
            txb.moveCall({
                target: `${AQUA_FI_PACKAGE_ID}::cetus_position::deposit_gas`,
                arguments: [
                    txb.object(this.gasVaultId),
                    coinForDeposit
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
                console.log('✅ Dépôt de gas réussi!');
                return true;
            }
            else {
                console.error('❌ Échec du dépôt:', result.effects?.status.error);
                return false;
            }
        }
        catch (error) {
            console.error('❌ Erreur lors du dépôt de gas:', error);
            return false;
        }
    }
    // Retirer du SUI du coffre-fort
    async withdrawGas(amount) {
        if (!this.gasVaultId) {
            console.error('❌ Aucun coffre-fort configuré.');
            return false;
        }
        console.log(`💸 Retrait de ${amount / 1000000000} SUI du coffre-fort...`);
        try {
            const txb = new transactions_1.Transaction();
            txb.moveCall({
                target: `${AQUA_FI_PACKAGE_ID}::cetus_position::withdraw_gas_entry`,
                arguments: [
                    txb.object(this.gasVaultId),
                    txb.pure.u64(amount)
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
                console.log('✅ Retrait de gas réussi!');
                // Afficher les événements
                if (result.events && result.events.length > 0) {
                    result.events.forEach((event, index) => {
                        if (event.type.includes('GasWithdrawn')) {
                            console.log(`📢 Événement ${index + 1}:`, event.parsedJson);
                        }
                    });
                }
                return true;
            }
            else {
                console.error('❌ Échec du retrait:', result.effects?.status.error);
                return false;
            }
        }
        catch (error) {
            console.error('❌ Erreur lors du retrait de gas:', error);
            return false;
        }
    }
    // Obtenir le statut du coffre-fort
    async getGasVaultStatus() {
        if (!this.gasVaultId) {
            console.log('❌ Aucun coffre-fort configuré.');
            return;
        }
        console.log('🏦 === STATUT DU COFFRE-FORT GAZ ===');
        try {
            const vaultObject = await sui_1.suiClient.getObject({
                id: this.gasVaultId,
                options: { showContent: true }
            });
            if (vaultObject.data && vaultObject.data.content && 'fields' in vaultObject.data.content) {
                const vault = vaultObject.data.content.fields;
                const currentBalance = parseInt(vault.sui_balance.fields.balance);
                const totalDeposited = parseInt(vault.total_deposited);
                const totalWithdrawn = parseInt(vault.total_withdrawn);
                console.log(`🏦 ID du coffre-fort: ${this.gasVaultId}`);
                console.log(`💰 Solde actuel: ${currentBalance / 1000000000} SUI`);
                console.log(`📈 Total déposé: ${totalDeposited / 1000000000} SUI`);
                console.log(`📉 Total retiré: ${totalWithdrawn / 1000000000} SUI`);
                console.log(`👤 Propriétaire: ${vault.owner}`);
                // Vérifier si le solde est suffisant
                if (currentBalance < 500000000) { // Moins de 0.5 SUI
                    console.log('⚠️  ATTENTION: Solde de gas faible! Considérez un rechargement.');
                }
                else if (currentBalance >= TARGET_GAS_AMOUNT) {
                    console.log('✅ Solde de gas optimal pour les stratégies.');
                }
            }
            else {
                console.log('❌ Impossible de récupérer les informations du coffre-fort.');
            }
        }
        catch (error) {
            console.error('❌ Erreur lors de la récupération du statut:', error);
        }
    }
    // Fonction utilitaire pour obtenir le solde d'un coin
    async getCoinBalance(coinId) {
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
            console.error(`Erreur lors de la récupération du solde du coin ${coinId}:`, error);
            return 0;
        }
    }
    // Setter pour l'ID du coffre-fort
    setGasVaultId(vaultId) {
        this.gasVaultId = vaultId;
    }
    // Getter pour l'ID du coffre-fort
    getGasVaultId() {
        return this.gasVaultId;
    }
}
exports.GasManager = GasManager;
// Fonctions exportées pour l'utilisation dans index.ts
async function createGasVault() {
    const gasManager = new GasManager();
    const vaultId = await gasManager.createGasVault();
    if (vaultId) {
        console.log('\n🎉 Coffre-fort créé avec succès!');
        console.log('💡 N\'oubliez pas d\'ajouter GAS_VAULT_ID à votre .env');
    }
}
async function depositToGasVault(amount) {
    const gasVaultId = process.env.GAS_VAULT_ID;
    if (!gasVaultId) {
        console.error('❌ GAS_VAULT_ID non défini dans .env');
        return;
    }
    const gasManager = new GasManager(gasVaultId);
    const depositAmount = amount || 500000000; // 0.5 SUI par défaut
    await gasManager.depositGas(depositAmount);
}
async function withdrawFromGasVault(amount) {
    const gasVaultId = process.env.GAS_VAULT_ID;
    if (!gasVaultId) {
        console.error('❌ GAS_VAULT_ID non défini dans .env');
        return;
    }
    const gasManager = new GasManager(gasVaultId);
    const withdrawAmount = amount || 100000000; // 0.1 SUI par défaut
    await gasManager.withdrawGas(withdrawAmount);
}
async function checkGasVaultStatus() {
    const gasVaultId = process.env.GAS_VAULT_ID;
    if (!gasVaultId) {
        console.error('❌ GAS_VAULT_ID non défini dans .env');
        console.log('💡 Créez d\'abord un coffre-fort avec: npm run create-gas-vault');
        return;
    }
    const gasManager = new GasManager(gasVaultId);
    await gasManager.getGasVaultStatus();
}
