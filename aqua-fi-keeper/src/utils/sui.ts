// Fichier: src/utils/sui.ts
// Configuration Sui et SDK Cetus

import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { initCetusSDK } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { config } from 'dotenv';
import path from 'path';

// Charger les variables d'environnement
config({ path: path.resolve(process.cwd(), '.env') });

const SUI_PRIVATE_KEY = process.env.SUI_PRIVATE_KEY;

if (!SUI_PRIVATE_KEY) {
    throw new Error("SUI_PRIVATE_KEY n'est pas défini dans le fichier .env");
}

// Initialise le client Sui pour le Mainnet
export const suiClient = new SuiClient({ url: getFullnodeUrl('mainnet') });

// Gestion des différents formats de clé privée
let keypair: Ed25519Keypair;

if (SUI_PRIVATE_KEY.startsWith('suiprivkey')) {
    // Format Sui natif - décoder depuis bech32
    try {
        // Utiliser la méthode de dérivation qui correspond à sui client
        keypair = Ed25519Keypair.deriveKeypair(SUI_PRIVATE_KEY);
    } catch (error) {
        console.log('Tentative de décodage alternatif...');
        // Fallback: essayer fromSecretKey directement
        keypair = Ed25519Keypair.fromSecretKey(SUI_PRIVATE_KEY);
    }
} else {
    // Format base64 legacy
    const privateKeyBytes = Buffer.from(SUI_PRIVATE_KEY, 'base64');
    keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes.slice(1));
}

export { keypair };

// Initialise le SDK de Cetus pour le Mainnet
export const cetusSdk = initCetusSDK({ network: 'mainnet' });
cetusSdk.senderAddress = keypair.getPublicKey().toSuiAddress();

console.log(`🔑 Adresse du portefeuille : ${keypair.getPublicKey().toSuiAddress()}`);
