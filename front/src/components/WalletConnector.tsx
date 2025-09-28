import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import slushWalletLogo from "../assets/slush-wallet-logo.png";

declare global {
  interface Window {
    slush?: any;
    ethereum?: any;
    sui?: any;
    __sui?: any;
  }
}

export function WalletConnector() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isSlushInstalled, setIsSlushInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si l'extension Sui Wallet est installée (compatible Slush)
    const checkSuiInstalled = () => {
      if (typeof window !== 'undefined' && (window.sui || window.__sui)) {
        setIsSlushInstalled(true);
        return true;
      }
      return false;
    };

    // Vérifier immédiatement
    if (checkSuiInstalled()) {
      return;
    }

    // Attendre que l'extension soit chargée
    const timeoutId = setTimeout(() => {
      checkSuiInstalled();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    // Écouter les changements de compte dans l'extension
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        handleDisconnect();
      } else {
        setWalletAddress(accounts[0]);
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SLUSH_ACCOUNTS_CHANGED') {
        handleAccountsChanged(event.data.accounts);
      }
    };

    // Écouter les événements de déconnexion depuis le terminal Cetus
    const handleCetusDisconnect = (event: CustomEvent) => {
      console.log('🔄 Déconnexion demandée depuis le terminal Cetus:', event.detail);
      handleDisconnect();
    };

    if (window.slush) {
      // Méthode standard pour les wallets
      if (window.slush.on) {
        window.slush.on('accountsChanged', handleAccountsChanged);
      }
    }

    // Écouter les messages de l'extension
    window.addEventListener('message', handleMessage);
    
    // Écouter les événements de déconnexion depuis Cetus
    window.addEventListener('cetus-wallet-disconnect', handleCetusDisconnect as EventListener);

    return () => {
      if (window.slush && window.slush.removeListener) {
        window.slush.removeListener('accountsChanged', handleAccountsChanged);
      }
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('cetus-wallet-disconnect', handleCetusDisconnect as EventListener);
    };
  }, []);

  const handleConnectSlush = async () => {
    console.log('🔄 Tentative de connexion à Slush Wallet...');
    
    try {
      // Essayer de se connecter directement avec l'extension Slush Wallet
      let accounts = null;
      
      console.log('🔍 Vérification des APIs disponibles:', {
        sui: !!window.sui,
        __sui: !!window.__sui,
        slush: !!window.slush,
        ethereum: !!window.ethereum
      });
      
      // Méthode 1: window.sui (API Sui standard)
      if (window.sui) {
        console.log('📡 Tentative avec window.sui...');
        try {
          const result = await window.sui.requestPermissions();
          console.log('✅ window.sui.requestPermissions result:', result);
          if (result && result.accounts && result.accounts.length > 0) {
            accounts = result.accounts;
          }
        } catch (error) {
          console.log('❌ window.sui.requestPermissions failed:', error);
          try {
            const result = await window.sui.connect();
            console.log('✅ window.sui.connect result:', result);
            if (result && result.accounts && result.accounts.length > 0) {
              accounts = result.accounts;
            } else if (Array.isArray(result) && result.length > 0) {
              accounts = result;
            }
          } catch (error2) {
            console.log('❌ window.sui.connect failed:', error2);
          }
        }
      }
      
      // Méthode 2: window.__sui (API alternative)
      if (!accounts && window.__sui) {
        console.log('📡 Tentative avec window.__sui...');
        try {
          const result = await window.__sui.requestPermissions();
          console.log('✅ window.__sui.requestPermissions result:', result);
          if (result && result.accounts && result.accounts.length > 0) {
            accounts = result.accounts;
          }
        } catch (error) {
          console.log('❌ window.__sui.requestPermissions failed:', error);
        }
      }
      
      // Méthode 3: window.slush (API Slush spécifique)
      if (!accounts && window.slush) {
        console.log('📡 Tentative avec window.slush...');
        try {
          const result = await window.slush.requestPermissions();
          console.log('✅ window.slush.requestPermissions result:', result);
          if (result && result.accounts && result.accounts.length > 0) {
            accounts = result.accounts;
          }
        } catch (error) {
          console.log('❌ window.slush.requestPermissions failed:', error);
        }
      }
      
      console.log('📊 Comptes trouvés:', accounts);
      
      // Si on a des comptes, se connecter
      if (accounts && accounts.length > 0) {
        console.log('🎉 Connexion réussie!');
        setIsConnected(true);
        setConnectedWallet("Slush Wallet");
        setWalletAddress(accounts[0]);
      } else {
        console.log('⚠️ Aucun compte trouvé, ouverture de l\'extension...');
        // Si pas de comptes, essayer d'ouvrir l'extension
        openSlushExtension();
      }
      
    } catch (error) {
      console.log('💥 Erreur générale:', error);
      // En cas d'erreur, essayer d'ouvrir l'extension
      openSlushExtension();
    }
  };

  const checkIfSlushInstalled = async () => {
    try {
      // Check if Sui Wallet is available in window object (compatible with Slush)
      if (window.sui || window.__sui) {
        return true;
      }
      
      // Try to detect by checking for the Sui extension
      try {
        const hasExtension = await new Promise((resolve) => {
          const timeout = setTimeout(() => resolve(false), 1000);
          
          // Try to trigger the Sui extension
          if (window.sui) {
            window.sui.hasPermissions()
              .then(() => resolve(true))
              .catch(() => resolve(false))
              .finally(() => clearTimeout(timeout));
          } else if (window.__sui) {
            window.__sui.hasPermissions()
              .then(() => resolve(true))
              .catch(() => resolve(false))
              .finally(() => clearTimeout(timeout));
          } else {
            clearTimeout(timeout);
            resolve(false);
          }
        });
        
        return hasExtension;
      } catch {
        return false;
      }
    } catch {
      return false;
    }
  };

  const openSlushExtension = () => {
    console.log('🚀 Ouverture de l\'extension Slush Wallet...');
    
    try {
      // Méthode 1: Essayer de déclencher l'extension via postMessage
      window.postMessage({ 
        type: 'SUI_CONNECT_REQUEST',
        source: 'aquali-app'
      }, '*');
      
      // Méthode 2: Essayer de déclencher via un événement personnalisé
      const event = new CustomEvent('sui-connect-request', {
        detail: { source: 'aquali-app' }
      });
      window.dispatchEvent(event);
      
      // Méthode 3: Essayer de déclencher via window.sui si disponible
      if (window.sui) {
        try {
          window.sui.requestPermissions();
        } catch (e) {
          console.log('❌ window.sui.requestPermissions dans openSlushExtension failed:', e);
        }
      }
      
      // Méthode 4: Essayer d'ouvrir l'extension via des IDs alternatifs
      const extensionIds = [
        'opcgpfmipidbgpenhmajoajpbobppdil', // Sui Wallet officiel
        'bfnaelmomeimhlpmgjnjophhpkkoljpa', // Phantom (pour test)
        'nkbihfbeogaeaoehlefnkodbefgpgknn', // MetaMask (pour test)
      ];
      
      let extensionOpened = false;
      for (const id of extensionIds) {
        try {
          console.log(`🔗 Tentative d'ouverture de l'extension: ${id}`);
          window.open(`chrome-extension://${id}/popup.html`, '_blank');
          extensionOpened = true;
          console.log(`✅ Extension ${id} ouverte avec succès`);
          break;
        } catch (e) {
          console.log(`❌ Impossible d'ouvrir l'extension ${id}:`, e);
        }
      }
      
      // Méthode 5: Rediriger vers la page d'installation si aucune extension n'a pu être ouverte
      if (!extensionOpened) {
        console.log('⚠️ Aucune extension n\'a pu être ouverte, redirection vers l\'installation...');
        const shouldInstall = confirm('Extension Sui Wallet non détectée.\n\nVoulez-vous être redirigé vers la page d\'installation ?\n\n1. Installez l\'extension Sui Wallet (compatible Slush)\n2. Ouvrez-la et créez un compte\n3. Revenez sur cette page');
        
        if (shouldInstall) {
          window.open('https://chrome.google.com/webstore/search/sui%20wallet', '_blank');
        }
      }
      
    } catch (error) {
      console.log('💥 Erreur dans openSlushExtension:', error);
      // Fallback final
      alert('Impossible d\'ouvrir l\'extension automatiquement.\n\nVeuillez ouvrir manuellement l\'extension Sui Wallet et créer un compte.');
    }
  };

  const handleDisconnect = async () => {
    try {
      if (window.slush && window.slush.disconnect) {
        await window.slush.disconnect();
      } else if (window.sui && window.sui.disconnect) {
        await window.sui.disconnect();
      }
    } catch (error) {
      // Ignorer les erreurs de déconnexion
    }
    
    setIsConnected(false);
    setConnectedWallet(null);
    setWalletAddress(null);
  };

  if (isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            className="backdrop-blur-sm backdrop-filter content-stretch flex items-start relative rounded-[9999px] shrink-0 cursor-pointer"
            data-name="app-wallet-connector"
          >
            <div className="bg-green-600 box-border content-stretch flex h-[44px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[15.5px] text-center text-nowrap text-white">
                  <p className="leading-[24px] whitespace-pre">Connected</p>
                </div>
              </div>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 bg-gray-900 border border-gray-700 rounded-[12px] p-2" align="end">
          <div className="px-3 py-2 border-b border-gray-700 mb-2">
            <div className="text-white text-sm font-medium">{connectedWallet}</div>
            <div className="text-gray-400 text-xs">
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '0x1234...5678'}
            </div>
          </div>
          <DropdownMenuItem 
            onClick={handleDisconnect}
            className="text-red-400 hover:text-red-300 hover:bg-gray-800 cursor-pointer rounded-[8px] px-3 py-2"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
        <div
          className="backdrop-blur-sm backdrop-filter content-stretch flex items-start relative rounded-[9999px] shrink-0 cursor-pointer"
          data-name="app-wallet-connector"
      onClick={handleConnectSlush}
        >
          <div className="bg-indigo-600 box-border content-stretch flex h-[44px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 hover:bg-indigo-700 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[8px] flex items-center justify-center overflow-hidden">
            <img 
              src={slushWalletLogo} 
              alt="Slush Wallet" 
              className="w-full h-full object-contain"
            />
          </div>
            <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[15.5px] text-center text-nowrap text-white">
            <p className="leading-[24px] whitespace-pre">Slush Wallet</p>
          </div>
        </div>
            </div>
          </div>
  );
}