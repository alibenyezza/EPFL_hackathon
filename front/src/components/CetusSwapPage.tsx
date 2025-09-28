import React, { useEffect } from 'react';
import { RainBackground } from './RainBackground';

interface CetusSwapPageProps {
  // Props pour l'intégration avec Slush Wallet si nécessaire
}

export function CetusSwapPage({}: CetusSwapPageProps) {
  useEffect(() => {
    // Configuration du thème Cetus officiel
    const customTheme = {
      bg_primary: "#1B242C",
      primary: "#72c1f7",
      text_primary: "#FFFFFF",
      text_secondary: "#909CA4",
      success: "#68FFD8",
      warning: "#FFCA68",
      error: "#ff5073",
      btn_text: "#222222"
    };

    // Attendre que le script Cetus soit chargé
    const initCetus = () => {
      if (typeof window !== 'undefined' && window.CetusSwap) {
        try {
          window.CetusSwap.init({
            containerId: "cetus-terminal",
            displayMode: "Integrated",
            themeType: "Dark",
            theme: customTheme,
            independentWallet: true, // Permettre l'affichage du wallet
            walletConfig: {
              // Configuration pour forcer l'utilisation de Sui Wallet
              preferredWallets: ['sui-wallet'],
              autoConnect: true, // Connexion automatique si wallet disponible
              showWalletButton: true // Afficher le bouton de wallet
            }
          });

          // Forcer la connexion du wallet dans Cetus
          setTimeout(() => {
            // Essayer de connecter le wallet automatiquement
            if (window.sui || window.__sui) {
              console.log('🔄 Tentative de connexion automatique du wallet dans Cetus...');
              try {
                if (window.sui && window.sui.requestPermissions) {
                  window.sui.requestPermissions().then((result) => {
                    console.log('✅ Wallet connecté dans Cetus:', result);
                  }).catch((error) => {
                    console.log('❌ Erreur de connexion dans Cetus:', error);
                  });
                }
              } catch (error) {
                console.log('❌ Erreur lors de la connexion automatique:', error);
              }
            }
          }, 2000);

          // Détecter et supprimer les éléments blancs problématiques
          setTimeout(() => {
            const removeWhiteOverlays = () => {
              // Chercher et supprimer les éléments blancs
              const whiteElements = document.querySelectorAll('#cetus-terminal [style*="background-color: white"], #cetus-terminal [style*="background: white"], #cetus-terminal [style*="background-color: #fff"], #cetus-terminal [style*="background: #fff"]');
              
              whiteElements.forEach((element) => {
                console.log('🗑️ Suppression d\'un élément blanc problématique:', element);
                element.style.display = 'none';
                element.style.visibility = 'hidden';
                element.style.opacity = '0';
                element.style.zIndex = '-1';
              });

              // Chercher et supprimer les overlays
              const overlays = document.querySelectorAll('#cetus-terminal .overlay, #cetus-terminal .backdrop, #cetus-terminal .modal-overlay, #cetus-terminal .white-overlay');
              
              overlays.forEach((overlay) => {
                console.log('🗑️ Suppression d\'un overlay problématique:', overlay);
                overlay.style.display = 'none';
                overlay.style.visibility = 'hidden';
                overlay.style.opacity = '0';
                overlay.style.zIndex = '-1';
              });
            };

            // Exécuter immédiatement
            removeWhiteOverlays();
            
            // Surveiller les nouveaux éléments
            const observer = new MutationObserver(() => {
              removeWhiteOverlays();
            });
            
            const cetusTerminal = document.querySelector('#cetus-terminal');
            if (cetusTerminal) {
              observer.observe(cetusTerminal, { childList: true, subtree: true });
            }
          }, 1000);

          // Ajouter un gestionnaire d'événements pour l'adresse de wallet
          setTimeout(() => {
            // Attendre que le terminal soit complètement chargé
            const checkForWalletAddress = () => {
              // Chercher différents sélecteurs possibles pour l'adresse de wallet
              const walletSelectors = [
                '#cetus-terminal .cs-connected-button',
                '#cetus-terminal .wallet-address',
                '#cetus-terminal .connected-wallet',
                '#cetus-terminal .account-address',
                '#cetus-terminal [data-testid="wallet-address"]',
                '#cetus-terminal [data-testid="connected-wallet"]',
                '#cetus-terminal .wallet-info',
                '#cetus-terminal .user-address'
              ];
              
              let walletButton = null;
              for (const selector of walletSelectors) {
                walletButton = document.querySelector(selector);
                if (walletButton) {
                  console.log(`🎯 Adresse de wallet trouvée avec le sélecteur: ${selector}`);
                  break;
                }
              }
              
              if (walletButton) {
                console.log('🎯 Adresse de wallet trouvée, ajout du gestionnaire de clic...');
                walletButton.addEventListener('click', (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔄 Déconnexion demandée depuis le terminal Cetus...');
                  
                  // Déclencher la déconnexion via notre système
                  const disconnectEvent = new CustomEvent('cetus-wallet-disconnect', {
                    detail: { source: 'cetus-terminal' }
                  });
                  window.dispatchEvent(disconnectEvent);
                  
                  // Afficher un message de confirmation
                  alert('Déconnexion du wallet demandée. Veuillez utiliser le bouton de déconnexion dans la navbar.');
                });
                
                // Ajouter un indicateur visuel que c'est cliquable
                walletButton.style.cursor = 'pointer';
                walletButton.title = 'Cliquez pour déconnecter le wallet';
              } else {
                console.log('⚠️ Aucune adresse de wallet trouvée, réessai dans 1 seconde...');
                // Réessayer après 1 seconde si l'élément n'est pas encore chargé
                setTimeout(checkForWalletAddress, 1000);
              }
            };
            
            checkForWalletAddress();
          }, 3000);

          // Ajouter du CSS personnalisé pour optimiser l'intégration avec le background en pluie
          setTimeout(() => {
            const style = document.createElement('style');
            style.textContent = `
              #cetus-terminal {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 auto !important;
                position: relative !important;
                z-index: 10 !important;
              }
              
              /* Améliorer la lisibilité sur le background en pluie */
              #cetus-terminal * {
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8) !important;
              }
              
              /* Ajuster les couleurs pour s'harmoniser avec le thème Cetus */
              #cetus-terminal .token-symbol,
              #cetus-terminal .token-name {
                font-size: 1.05em !important;
                font-weight: 500 !important;
                color: #FFFFFF !important;
              }
              
              #cetus-terminal .amount-input {
                font-size: 1.1em !important;
                font-weight: 600 !important;
                color: #FFFFFF !important;
              }
              
              #cetus-terminal .balance-text {
                font-size: 0.9em !important;
                font-weight: 500 !important;
                color: #909CA4 !important;
              }
              
              /* Améliorer la visibilité des icônes */
              #cetus-terminal .token-icon,
              #cetus-terminal .wallet-icon,
              #cetus-terminal .settings-icon,
              #cetus-terminal .refresh-icon {
                width: 20px !important;
                height: 20px !important;
                filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5)) !important;
              }
              
              /* Styliser les boutons */
              #cetus-terminal .swap-button,
              #cetus-terminal .connect-button {
                font-size: 1.1em !important;
                padding: 14px 20px !important;
                font-weight: 600 !important;
                background: linear-gradient(135deg, #72c1f7, #68FFD8) !important;
                color: #222222 !important;
                border: none !important;
                border-radius: 12px !important;
                box-shadow: 0 4px 15px rgba(114, 193, 247, 0.3) !important;
                transition: all 0.3s ease !important;
              }
              
              #cetus-terminal .swap-button:hover,
              #cetus-terminal .connect-button:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 6px 20px rgba(114, 193, 247, 0.4) !important;
              }
              
              #cetus-terminal .half-button,
              #cetus-terminal .max-button {
                font-size: 0.9em !important;
                padding: 6px 12px !important;
                font-weight: 500 !important;
                background: rgba(114, 193, 247, 0.1) !important;
                color: #72c1f7 !important;
                border: 1px solid rgba(114, 193, 247, 0.3) !important;
                border-radius: 8px !important;
              }
              
              #cetus-terminal .wallet-address {
                font-size: 0.9em !important;
                font-weight: 500 !important;
                color: #909CA4 !important;
              }
              
              #cetus-terminal .slippage-text {
                font-size: 0.9em !important;
                font-weight: 500 !important;
                color: #909CA4 !important;
              }
              
              /* Centrer le contenu du terminal */
              #cetus-terminal > div {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                width: 100% !important;
                max-width: 400px !important;
                margin: 0 auto !important;
                padding: 1rem !important;
              }
              
              /* Centrer tous les éléments internes */
              #cetus-terminal .swap-container,
              #cetus-terminal .token-input-container,
              #cetus-terminal .button-container {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                width: 100% !important;
                margin: 0.5rem auto !important;
              }
              
              /* Centrer les inputs et boutons */
              #cetus-terminal input,
              #cetus-terminal button {
                width: 100% !important;
                max-width: 350px !important;
                margin: 0.25rem auto !important;
                text-align: center !important;
              }
              
              /* Rendre l'adresse de wallet cliquable */
              #cetus-terminal .cs-connected-button,
              #cetus-terminal [data-testid="wallet-address"],
              #cetus-terminal .wallet-address {
                cursor: pointer !important;
                transition: all 0.3s ease !important;
                border-radius: 8px !important;
                padding: 8px 12px !important;
                background: rgba(114, 193, 247, 0.1) !important;
                border: 1px solid rgba(114, 193, 247, 0.3) !important;
              }
              
              #cetus-terminal .cs-connected-button:hover,
              #cetus-terminal [data-testid="wallet-address"]:hover,
              #cetus-terminal .wallet-address:hover {
                background: rgba(114, 193, 247, 0.2) !important;
                border-color: rgba(114, 193, 247, 0.5) !important;
                transform: translateY(-1px) !important;
              }
              
              /* Connecter l'adresse de wallet à notre système */
              #cetus-terminal .cs-connected-button::after {
                content: " (Cliquez pour déconnecter)" !important;
                font-size: 0.8em !important;
                color: #909CA4 !important;
                margin-left: 8px !important;
              }
              
              /* Forcer l'affichage du wallet dans Cetus */
              #cetus-terminal .wallet-connect-button,
              #cetus-terminal .connect-wallet-button,
              #cetus-terminal [data-testid="connect-wallet"] {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
              }
              
              /* Améliorer la visibilité de l'adresse de wallet */
              #cetus-terminal .wallet-address,
              #cetus-terminal .connected-wallet,
              #cetus-terminal .account-address {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                color: #FFFFFF !important;
                font-weight: 500 !important;
              }
              
              /* Corriger les problèmes d'overlay blanc */
              #cetus-terminal .white-overlay,
              #cetus-terminal .loading-overlay,
              #cetus-terminal .modal-overlay,
              #cetus-terminal .backdrop,
              #cetus-terminal .overlay,
              #cetus-terminal .wallet-connect-overlay {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                z-index: -1 !important;
              }
              
              /* Forcer l'affichage correct des modales de wallet */
              #cetus-terminal .wallet-connect-modal,
              #cetus-terminal .wallet-selector-modal,
              #cetus-terminal .modal-content {
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                z-index: 10000 !important;
                background: rgba(27, 36, 44, 0.98) !important;
                border: 1px solid rgba(114, 193, 247, 0.5) !important;
                border-radius: 16px !important;
                padding: 2rem !important;
                max-width: 400px !important;
                width: 90% !important;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8) !important;
              }
              
              /* Masquer les éléments qui causent des problèmes */
              #cetus-terminal [style*="background-color: white"],
              #cetus-terminal [style*="background: white"],
              #cetus-terminal [style*="background-color: #fff"],
              #cetus-terminal [style*="background: #fff"] {
                background: rgba(27, 36, 44, 0.95) !important;
                color: #FFFFFF !important;
              }
            `;
            document.head.appendChild(style);
          }, 1000);
        } catch (error) {
          console.error('Erreur lors de l\'initialisation de Cetus Terminal:', error);
        }
      } else {
        // Réessayer après 100ms si Cetus n'est pas encore chargé
        setTimeout(initCetus, 100);
      }
    };

    // Démarrer l'initialisation
    initCetus();
  }, []);

  return (
    <div className="min-h-screen relative w-full flex-1 overflow-hidden">
      {/* Background animé en pluie */}
      <RainBackground />
      
              <div className="relative z-50 w-full h-screen">
                {/* Cetus Terminal Container - Pleine hauteur et centré */}
                <div 
                  id="cetus-terminal" 
                  className="w-full h-full"
                  style={{
                    background: 'rgba(27, 36, 44, 0.15)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(114, 193, 247, 0.3)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(114, 193, 247, 0.2)',
                    zIndex: 9999,
                    position: 'relative'
                  }}
                >
          {/* Fallback si Cetus Terminal n'est pas chargé */}
          <div className="flex items-center justify-center h-full text-center p-12">
            <div>
              <div className="relative mb-8">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-400/20 border-t-blue-400 mx-auto"></div>
                <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-t-cyan-400/30 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
              </div>
              <p className="text-white text-2xl font-semibold mb-3">Chargement du terminal de swap...</p>
              <p className="text-gray-400 text-base">
                Si le terminal ne se charge pas, assurez-vous que votre extension Sui Wallet est installée et déverrouillée.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Déclaration globale pour TypeScript
declare global {
  interface Window {
    CetusSwap: {
      init: (config: {
        containerId: string;
        displayMode: string;
        themeType: string;
        theme: Record<string, string>;
        independentWallet: boolean;
      }) => void;
    };
  }
}

