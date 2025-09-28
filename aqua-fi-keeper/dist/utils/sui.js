"use strict";
// Fichier: src/utils/sui.ts
// Configuration Sui et SDK Cetus
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cetusSdk = exports.keypair = exports.suiClient = void 0;
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
const client_1 = require("@mysten/sui/client");
const cetus_sui_clmm_sdk_1 = require("@cetusprotocol/cetus-sui-clmm-sdk");
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
// Charger les variables d'environnement
(0, dotenv_1.config)({ path: path_1.default.resolve(process.cwd(), '.env') });
const SUI_PRIVATE_KEY = process.env.SUI_PRIVATE_KEY;
if (!SUI_PRIVATE_KEY) {
    throw new Error("SUI_PRIVATE_KEY n'est pas défini dans le fichier .env");
}
// Initialise le client Sui pour le Mainnet
exports.suiClient = new client_1.SuiClient({ url: (0, client_1.getFullnodeUrl)('mainnet') });
// Gestion des différents formats de clé privée
let keypair;
if (SUI_PRIVATE_KEY.startsWith('suiprivkey')) {
    // Format Sui natif - décoder depuis bech32
    try {
        // Utiliser la méthode de dérivation qui correspond à sui client
        exports.keypair = keypair = ed25519_1.Ed25519Keypair.deriveKeypair(SUI_PRIVATE_KEY);
    }
    catch (error) {
        console.log('Tentative de décodage alternatif...');
        // Fallback: essayer fromSecretKey directement
        exports.keypair = keypair = ed25519_1.Ed25519Keypair.fromSecretKey(SUI_PRIVATE_KEY);
    }
}
else {
    // Format base64 legacy
    const privateKeyBytes = Buffer.from(SUI_PRIVATE_KEY, 'base64');
    exports.keypair = keypair = ed25519_1.Ed25519Keypair.fromSecretKey(privateKeyBytes.slice(1));
}
// Initialise le SDK de Cetus pour le Mainnet
exports.cetusSdk = (0, cetus_sui_clmm_sdk_1.initCetusSDK)({ network: 'mainnet' });
exports.cetusSdk.senderAddress = keypair.getPublicKey().toSuiAddress();
console.log(`🔑 Adresse du portefeuille : ${keypair.getPublicKey().toSuiAddress()}`);
