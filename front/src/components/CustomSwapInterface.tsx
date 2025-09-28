import React, { useState } from 'react';
import { TokenSelectorModal } from './TokenSelectorModal';

interface Token {
  symbol: string;
  name: string;
  icon: string;
  balance: string;
}

interface CustomSwapInterfaceProps {
  // Props pour l'intégration avec Slush Wallet si nécessaire
}

export function CustomSwapInterface({}: CustomSwapInterfaceProps) {
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);
  const [selectingFor, setSelectingFor] = useState<'from' | 'to'>('from');

  const availableTokens: Token[] = [
    {
      symbol: "USDC",
      name: "USD Coin",
      icon: "/src/assets/usd-coin-usdc-seeklogo.png",
      balance: "1.353"
    },
    {
      symbol: "SUI",
      name: "Sui Token", 
      icon: "/src/assets/sui logo.png",
      balance: "0.3588"
    }
  ];

  const handleConnectWallet = async () => {
    // Logique de connexion Slush Wallet
    try {
      if (window.sui) {
        const result = await window.sui.requestPermissions();
        if (result && result.accounts && result.accounts.length > 0) {
          setIsConnected(true);
          setWalletAddress(result.accounts[0]);
        }
      } else {
        // Simulation pour le développement
        setIsConnected(true);
        setWalletAddress('0xd101...3b43');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleSelectToken = (token: Token) => {
    if (selectingFor === 'from') {
      setFromToken(token);
    } else {
      setToToken(token);
    }
  };

  const openTokenSelector = (forToken: 'from' | 'to') => {
    setSelectingFor(forToken);
    setIsTokenSelectorOpen(true);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Tabs de navigation comme Cetus */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-1 bg-gray-800/90 rounded-lg p-1 border border-gray-600/50 shadow-md">
          <button className="px-4 py-2 text-sm font-medium text-blue-400 bg-blue-500/30 rounded-md transition-colors border border-blue-500/30">
            Swap
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Limit
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
            DCA
          </button>
        </div>
        
        {/* Mode toggle */}
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1 px-3 py-1.5 bg-gray-800/90 hover:bg-gray-700/90 rounded-lg transition-colors border border-gray-600/50 shadow-md">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm text-gray-300">Lite</span>
          </button>
        </div>
      </div>

      {/* Interface de swap */}
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/60 shadow-2xl">
        {/* Settings bar comme Cetus */}
        <div className="flex items-center justify-end mb-6 space-x-3">
          <span className="text-sm text-gray-400">0.5%</span>
          <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
            <div className="w-4 h-4 rounded-full bg-gray-400"></div>
          </button>
        </div>

        {/* Input From - Style Cetus exact */}
        <div className="mb-4">
          <div className="bg-gray-800/90 rounded-2xl p-5 border border-gray-600/70 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400 font-medium">You Pay</span>
              <span className="text-sm text-gray-400">Balance: {fromToken?.balance || '0'}</span>
            </div>
            <div className="flex items-center justify-between">
              <input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="bg-transparent text-3xl font-bold text-white placeholder-gray-500 outline-none w-full"
              />
              <button 
                onClick={() => openTokenSelector('from')}
                className="flex items-center space-x-3 bg-gray-700/90 hover:bg-gray-700 px-4 py-3 rounded-xl transition-colors border border-gray-500/60 shadow-md"
              >
                {fromToken ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <img src={fromToken.icon} alt={fromToken.symbol} className="w-6 h-6" />
                    </div>
                    <span className="text-white font-semibold text-lg">{fromToken.symbol}</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">$</span>
                    </div>
                    <span className="text-gray-400 font-medium text-lg">Select token</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center space-x-2 mt-3">
              <button className="text-xs bg-gray-700/90 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-gray-300 font-medium transition-colors border border-gray-600/50">
                HALF
              </button>
              <button className="text-xs bg-gray-700/90 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-gray-300 font-medium transition-colors border border-gray-600/50">
                MAX
              </button>
            </div>
          </div>
        </div>

        {/* Bouton de swap - Style Cetus */}
        <div className="flex justify-center mb-4">
          <button
            onClick={handleSwapTokens}
            className="p-3 bg-gray-800/90 hover:bg-gray-800 rounded-2xl transition-colors border border-gray-600/70 shadow-lg"
          >
            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* Input To - Style Cetus exact */}
        <div className="mb-6">
          <div className="bg-gray-800/90 rounded-2xl p-5 border border-gray-600/70 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400 font-medium">You Receive</span>
              <span className="text-sm text-gray-400">Balance: {toToken?.balance || '0'}</span>
            </div>
            <div className="flex items-center justify-between">
              <input
                type="number"
                placeholder="0.0"
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                className="bg-transparent text-3xl font-bold text-white placeholder-gray-500 outline-none w-full"
              />
              <button 
                onClick={() => openTokenSelector('to')}
                className="flex items-center space-x-3 bg-gray-700/90 hover:bg-gray-700 px-4 py-3 rounded-xl transition-colors border border-gray-500/60 shadow-md"
              >
                {toToken ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <img src={toToken.icon} alt={toToken.symbol} className="w-6 h-6" />
                    </div>
                    <span className="text-white font-semibold text-lg">{toToken.symbol}</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <span className="text-gray-400 font-medium text-lg">Select token</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bouton principal - Style Cetus */}
        {!isConnected ? (
          <button
            onClick={handleConnectWallet}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 px-6 rounded-2xl transition-colors text-lg"
          >
            Connect Wallet
          </button>
        ) : (
          <button
            disabled={!fromAmount || !fromToken || !toToken}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-5 px-6 rounded-2xl transition-colors text-lg"
          >
            {!fromAmount ? 'Enter an amount' : 'Swap'}
          </button>
        )}

        {/* Price Reference - Style Cetus */}
        <div className="flex items-center justify-start mt-4 space-x-2">
          <span className="text-sm text-gray-500">Price Reference</span>
          <div className="w-4 h-4 rounded-full bg-gray-500 flex items-center justify-center">
            <span className="text-xs font-bold text-white">i</span>
          </div>
        </div>

        {/* Powered by Cetus */}
        <div className="flex items-center justify-center mt-6 space-x-2">
          <span className="text-sm text-gray-500">Powered by</span>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">C</span>
            </div>
            <span className="text-sm font-semibold text-green-500">CETUS</span>
          </div>
        </div>
      </div>

      {/* Token Selector Modal */}
      <TokenSelectorModal
        isOpen={isTokenSelectorOpen}
        onClose={() => setIsTokenSelectorOpen(false)}
        onSelectToken={handleSelectToken}
        availableTokens={availableTokens}
      />
    </div>
  );
}

// Déclaration globale pour TypeScript
declare global {
  interface Window {
    sui?: {
      requestPermissions: () => Promise<{ accounts: string[] }>;
    };
  }
}
