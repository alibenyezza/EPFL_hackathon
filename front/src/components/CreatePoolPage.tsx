import { useState, useEffect } from "react";
import { TokenSelector, Token, availableTokens } from "./TokenSelector";
import { RainBackground } from "./RainBackground";

interface CreatePoolPageProps {
  onBack: () => void;
}

// Mapping des stratégies vers les fee modes disponibles
const feeMapping = {
  'narrow-stable': ['auction-static'],
  'wide-stable': ['auction-static'],
  'volatile': ['auction-dynamic'],
  'uni-v2': ['static'],
  'buy-the-dip': ['auction-static']
} as const;

// Mapping des stratégies vers les liquidity modes par défaut
const liquidityMapping = {
  'narrow-stable': 'fixed-range',
  'wide-stable': 'fixed-range',
  'volatile': 'adaptive',
  'uni-v2': 'fixed-range',
  'buy-the-dip': 'fixed-range'
} as const;

// Mapping des stratégies vers les density functions par défaut
const densityMapping = {
  'narrow-stable': 'double-geometric',
  'wide-stable': 'double-geometric',
  'volatile': null, // Section cachée
  'uni-v2': 'uniform',
  'buy-the-dip': 'buy-the-dip'
} as const;

type VolatilityStrategy = keyof typeof feeMapping;
type FeeMode = 'static' | 'auction-dynamic' | 'auction-static';
type LiquidityMode = 'fixed-range' | 'adaptive' | 'track-sui-dips' | 'track-sui-rises';
type DensityFunction = 'geometric' | 'double-geometric' | 'uniform' | 'buy-the-dip';

export function CreatePoolPage({ onBack }: CreatePoolPageProps) {
  const [token0, setToken0] = useState<Token | null>(availableTokens.find(t => t.symbol === "SUI") || null);
  const [token1, setToken1] = useState<Token | null>(null);
  const [isToken0SelectorOpen, setIsToken0SelectorOpen] = useState(false);
  const [isToken1SelectorOpen, setIsToken1SelectorOpen] = useState(false);
  
  // Advanced options state
  const [selectedVolatilityStrategy, setSelectedVolatilityStrategy] = useState<VolatilityStrategy | null>(null);
  const [selectedFeeMode, setSelectedFeeMode] = useState<FeeMode | null>(null);
  const [selectedLiquidityMode, setSelectedLiquidityMode] = useState<LiquidityMode | null>(null);
  const [selectedDensityFunction, setSelectedDensityFunction] = useState<DensityFunction | null>(null);
  const [showDensityFunction, setShowDensityFunction] = useState(true);

  // Effets en cascade selon la stratégie sélectionnée
  useEffect(() => {
    if (selectedVolatilityStrategy) {
      // Auto-sélection fee mode
      const autoFeeMode = feeMapping[selectedVolatilityStrategy][0];
      setSelectedFeeMode(autoFeeMode);
      
      // Auto-sélection liquidity mode
      const autoLiquidityMode = liquidityMapping[selectedVolatilityStrategy];
      setSelectedLiquidityMode(autoLiquidityMode);
      
      // Auto-sélection ou masquage density function
      const autoDensityFunction = densityMapping[selectedVolatilityStrategy];
      setSelectedDensityFunction(autoDensityFunction);
      setShowDensityFunction(autoDensityFunction !== null);
    }
  }, [selectedVolatilityStrategy]);

  const volatilityStrategies = [
    {
      id: 'narrow-stable' as VolatilityStrategy,
      title: 'Narrow Stable',
      description: 'Low volatility, tight price ranges',
      color: 'from-emerald-500 to-emerald-600',
      accent: 'border-emerald-400',
      iconPath: 'M3 13l4-4 3 3 7-7M3 17h18'
    },
    {
      id: 'wide-stable' as VolatilityStrategy,
      title: 'Wide Stable',
      description: 'Moderate volatility, wider price ranges',
      color: 'from-blue-500 to-blue-600',
      accent: 'border-blue-400',
      iconPath: 'M3 7v2a3 3 0 003 3h12a3 3 0 003-3V7M3 17h18M7 7V5a3 3 0 013-3h4a3 3 0 013 3v2'
    },
    {
      id: 'volatile' as VolatilityStrategy,
      title: 'Volatile',
      description: 'High volatility, dynamic ranges',
      color: 'from-orange-500 to-red-600',
      accent: 'border-orange-400',
      iconPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z'
    },
    {
      id: 'uni-v2' as VolatilityStrategy,
      title: 'Uni V2',
      description: 'Uniswap V2 constant product formula',
      color: 'from-purple-500 to-purple-600',
      accent: 'border-purple-400',
      iconPath: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'
    },
    {
      id: 'buy-the-dip' as VolatilityStrategy,
      title: 'Buy the Dip',
      description: 'Accumulate on price drops',
      color: 'from-green-500 to-green-600',
      accent: 'border-green-400',
      iconPath: 'M7 17L17 7M17 7H7M17 7v10'
    }
  ];

  const feeModes = [
    {
      id: 'static' as FeeMode,
      title: 'Static Fee',
      description: 'Swap fees remain constant',
      badge: 'CONSTANT',
      iconPath: 'M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      id: 'auction-dynamic' as FeeMode,
      title: 'Auction Managed',
      subtitle: 'Dynamic',
      description: 'External actors pay rent to set fees',
      badge: 'SMART',
      iconPath: 'M13 10V3L4 14h7v7l9-11h-7z'
    },
    {
      id: 'auction-static' as FeeMode,
      title: 'Auction Managed',
      subtitle: 'Static',
      description: 'External actors pay rent to set fees',
      badge: 'MANAGED',
      iconPath: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l-3-3m3 3l3-3'
    }
  ];

  const liquidityModes = [
    {
      id: 'fixed-range' as LiquidityMode,
      title: 'Fixed Range',
      iconPath: 'M6 6h12v12H6V6zm2 2v8h8V8H8z'
    },
    {
      id: 'adaptive' as LiquidityMode,
      title: 'Adaptive',
      iconPath: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
    },
    {
      id: 'track-sui-dips' as LiquidityMode,
      title: 'Track Sui Dips',
      iconPath: 'M19 14l-7-7m0 0l-7 7m7-7v18'
    },
    {
      id: 'track-sui-rises' as LiquidityMode,
      title: 'Track Sui Rises',
      iconPath: 'M5 10l7-7m0 0l7 7m-7-7v18'
    }
  ];

  const densityFunctions = [
    {
      id: 'geometric' as DensityFunction,
      title: 'Geometric',
      formula: 'f(x) = a·rˣ',
      iconPath: 'M13 7a4 4 0 01-6 0M9 12l2 2 4-4'
    },
    {
      id: 'double-geometric' as DensityFunction,
      title: 'Double Geometric',
      formula: 'f(x) = a·rˣ + b·sʸ',
      iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
    },
    {
      id: 'uniform' as DensityFunction,
      title: 'Uniform',
      formula: 'f(x) = c',
      iconPath: 'M4 6h16M4 10h16M4 14h16M4 18h16'
    },
    {
      id: 'buy-the-dip' as DensityFunction,
      title: 'Buy the Dip',
      formula: 'f(x) = max(0, k-x)',
      iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 6.34L4.93 4.93M19.07 19.07l-1.41-1.41'
    }
  ];

  const isCompleteConfiguration = token0 && token1 && selectedVolatilityStrategy && selectedFeeMode && selectedLiquidityMode && (showDensityFunction ? selectedDensityFunction : true);

  return (
    <div className="min-h-screen relative w-full flex-1 overflow-hidden">
      {/* Background animé en pluie */}
      <RainBackground />
      
      <div className="relative z-10 max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={onBack}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            ← Back to Pools
          </button>
          <h1 className="text-white text-3xl font-medium">Create Pool</h1>
          <p className="text-gray-400 mt-2">Configure your liquidity pool with advanced strategies</p>
        </div>

        {/* Create Pool Form - Panel complètement opaque */}
        <div className="bg-gray-900 bg-opacity-100 rounded-[20px] border border-gray-700 p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '20px 20px'
            }} />
          </div>
          <div className="relative z-10">
          {/* Select Token Pair Section */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v2" />
                </svg>
              </div>
              <h2 className="text-white text-xl font-semibold">Select token pair</h2>
            </div>
            <p className="text-gray-400 text-sm mb-6 ml-11">Choose the two tokens for your liquidity pool</p>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Token 0 Selector */}
              <div>
                <button
                  onClick={() => setIsToken0SelectorOpen(true)}
                  className="w-full bg-gray-800 border border-[rgba(156,163,175,0.2)] rounded-[12px] p-4 flex items-center gap-3 hover:bg-gray-700 transition-colors"
                >
                  {token0 ? (
                    <>
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        {token0.icon.startsWith('http') ? (
                          <img 
                            src={token0.icon} 
                            alt={token0.symbol}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img 
                            src={token0.icon} 
                            alt={token0.symbol}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <span className="text-white font-medium">{token0.symbol}</span>
                    </>
                  ) : (
                    <span className="text-gray-400">Select a token</span>
                  )}
                  <div className="ml-auto">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
              </div>

              {/* Token 1 Selector */}
              <div>
                <button
                  onClick={() => setIsToken1SelectorOpen(true)}
                  className="w-full bg-gray-800 border border-[rgba(156,163,175,0.2)] rounded-[12px] p-4 flex items-center gap-3 hover:bg-gray-700 transition-colors"
                >
                  {token1 ? (
                    <>
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        {token1.icon.startsWith('http') ? (
                          <img 
                            src={token1.icon} 
                            alt={token1.symbol}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img 
                            src={token1.icon} 
                            alt={token1.symbol}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <span className="text-white font-medium">{token1.symbol}</span>
                    </>
                  ) : (
                    <span className="text-gray-400">Select a token</span>
                  )}
                  <div className="ml-auto">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Volatility Strategy Selection */}
          {token0 && token1 && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-white text-xl font-semibold">Select volatility strategy</h3>
              </div>
              <p className="text-gray-400 text-sm mb-6 ml-11">Choose how your pool handles price volatility</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {volatilityStrategies.map((strategy) => (
                  <button
                    key={strategy.id}
                    onClick={() => setSelectedVolatilityStrategy(strategy.id)}
                    className={`relative border-2 rounded-[16px] p-6 text-center transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl ${
                      selectedVolatilityStrategy === strategy.id
                        ? `bg-gradient-to-br ${strategy.color} ${strategy.accent} shadow-2xl border-opacity-50`
                        : 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600'
                    }`}
                  >
                    <div className="mb-4 flex justify-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        selectedVolatilityStrategy === strategy.id ? 'bg-white bg-opacity-20' : 'bg-gray-700'
                      }`}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={strategy.iconPath} />
                        </svg>
                      </div>
                    </div>
                    <div className={`font-medium mb-2 ${
                      selectedVolatilityStrategy === strategy.id ? 'text-white' : 'text-gray-200'
                    }`}>
                      {strategy.title}
                    </div>
                    <div className={`text-xs ${
                      selectedVolatilityStrategy === strategy.id ? 'text-gray-200' : 'text-gray-400'
                    }`}>
                      {strategy.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fee Mode Selection */}
          {token0 && token1 && selectedVolatilityStrategy && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v2" />
                  </svg>
                </div>
                <h3 className="text-white text-xl font-semibold">Fee Configuration</h3>
              </div>
              <p className="text-gray-400 text-sm mb-6 ml-11">Configure how swap fees are calculated for your pool</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {feeModes.map((mode) => {
                  const isAvailable = feeMapping[selectedVolatilityStrategy].includes(mode.id);
                  return (
                    <button
                      key={mode.id}
                      onClick={() => isAvailable && setSelectedFeeMode(mode.id)}
                      disabled={!isAvailable}
                      className={`relative border-2 rounded-[16px] p-5 text-left transition-all duration-300 ${
                        !isAvailable 
                          ? 'opacity-60 cursor-not-allowed bg-gray-900 border-gray-800' 
                          : selectedFeeMode === mode.id
                            ? 'bg-indigo-600 border-indigo-500 shadow-xl hover:shadow-lg'
                            : 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          !isAvailable
                            ? 'bg-gray-700'
                            : selectedFeeMode === mode.id 
                              ? 'bg-white bg-opacity-20' 
                              : 'bg-gray-700'
                        }`}>
                          <svg className={`w-5 h-5 text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mode.iconPath} />
                          </svg>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          !isAvailable
                            ? 'bg-gray-700 text-gray-300'
                            : selectedFeeMode === mode.id 
                              ? 'bg-white text-indigo-600' 
                              : 'bg-gray-700 text-gray-300'
                        }`}>
                          {mode.badge}
                        </span>
                      </div>
                      <div className={`font-medium mb-1 ${
                        !isAvailable ? 'text-gray-300' : 'text-white'
                      }`}>
                        {mode.title}
                        {mode.subtitle && <span className={!isAvailable ? 'text-gray-400' : 'text-gray-300'}> ({mode.subtitle})</span>}
                      </div>
                      <div className={`text-sm ${
                        !isAvailable ? 'text-gray-400' : 'text-gray-400'
                      }`}>{mode.description}</div>
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-30 rounded-[16px] flex items-center justify-center">
                          <span className="text-gray-400 text-xs font-medium bg-gray-800 bg-opacity-80 px-2 py-1 rounded">Not available for this strategy</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Liquidity Mode Selection */}
          {token0 && token1 && selectedFeeMode && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-white text-xl font-semibold">Liquidity Behavior</h3>
              </div>
              <p className="text-gray-400 text-sm mb-6 ml-11">Define how your liquidity responds to market movements</p>
              <div className="flex justify-center gap-8 py-8">
                {liquidityModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedLiquidityMode(mode.id)}
                    className={`relative transition-all duration-300 hover:transform hover:-translate-y-1 ${
                      selectedLiquidityMode === mode.id
                        ? 'transform -translate-y-2'
                        : ''
                    }`}
                  >
                    <div className="mb-4 flex justify-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        selectedLiquidityMode === mode.id ? 'bg-white bg-opacity-20' : 'bg-gray-700'
                      }`}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mode.iconPath} />
                        </svg>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-medium ${
                        selectedLiquidityMode === mode.id ? 'text-white' : 'text-gray-400'
                      }`}>
                        {mode.title}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Liquidity Density Function */}
          {token0 && token1 && selectedLiquidityMode && showDensityFunction && (
            <div className="mb-10 transition-opacity duration-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-white text-xl font-semibold">Density Distribution</h3>
              </div>
              <p className="text-gray-400 text-sm mb-6 ml-11">Choose the mathematical model for liquidity distribution</p>
              <div className="flex justify-center gap-8 py-8">
                {densityFunctions.map((func) => (
                  <button
                    key={func.id}
                    onClick={() => setSelectedDensityFunction(func.id)}
                    className={`relative transition-all duration-300 hover:transform hover:-translate-y-1 ${
                      selectedDensityFunction === func.id
                        ? 'transform -translate-y-2'
                        : ''
                    }`}
                  >
                    <div className="mb-4 flex justify-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        selectedDensityFunction === func.id ? 'bg-white bg-opacity-20' : 'bg-gray-700'
                      }`}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={func.iconPath} />
                        </svg>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-medium ${
                        selectedDensityFunction === func.id ? 'text-white' : 'text-gray-400'
                      }`}>
                        {func.title}
                      </div>
                      <div className={`text-xs font-mono mt-1 ${
                        selectedDensityFunction === func.id ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {func.formula}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Range Preview */}
          {token0 && token1 && selectedDensityFunction && (
            <div className="mb-8">
              <h3 className="text-gray-300 text-lg font-medium mb-4">Set starting price</h3>
              <div className="bg-gray-800 rounded-[12px] p-6 border border-[rgba(156,163,175,0.2)]">
                <div className="text-center">
                  <div className="text-gray-400 text-sm mb-2">Current price</div>
                  <div className="text-white text-2xl font-medium">1 {token0.symbol} = 0.000625 {token1.symbol}</div>
                  <div className="mt-4 text-gray-500 text-sm">
                    Strategy: <span className="text-indigo-400">{volatilityStrategies.find(s => s.id === selectedVolatilityStrategy)?.title}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create Pool Button */}
          <button
            disabled={!isCompleteConfiguration}
            className={`w-full py-5 rounded-[16px] font-medium text-lg transition-all duration-300 relative overflow-hidden ${
              isCompleteConfiguration
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-98' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isCompleteConfiguration && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-10 transform -skew-x-12 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
            )}
            <span className="relative z-10">
              {!token0 || !token1 ? 'Select tokens to continue' :
               !selectedVolatilityStrategy ? 'Select volatility strategy' :
               !selectedFeeMode ? 'Select fee mode' :
               !selectedLiquidityMode ? 'Select liquidity mode' :
               showDensityFunction && !selectedDensityFunction ? 'Select density function' :
               'Create Pool'}
            </span>
          </button>
          </div>
        </div>
      </div>

      {/* Token Selectors */}
      <TokenSelector
        selectedToken={token0}
        onTokenSelect={(token) => {
          setToken0(token);
          setIsToken0SelectorOpen(false);
        }}
        isOpen={isToken0SelectorOpen}
        onClose={() => setIsToken0SelectorOpen(false)}
      />

      <TokenSelector
        selectedToken={token1}
        onTokenSelect={(token) => {
          setToken1(token);
          setIsToken1SelectorOpen(false);
        }}
        isOpen={isToken1SelectorOpen}
        onClose={() => setIsToken1SelectorOpen(false)}
      />
    </div>
  );
}