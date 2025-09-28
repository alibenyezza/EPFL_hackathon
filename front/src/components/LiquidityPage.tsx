import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import imgEthIcon from "figma:asset/e0462ae91ad6c89c3a1b6ef05c14ed6beb477985.png";
import { CreatePoolPage } from "./CreatePoolPage";
import { RainBackground } from "./RainBackground";

// Mock pool data
const poolsData = [
  {
    id: 1,
    token0: { symbol: "WETH", icon: imgEthIcon },
    token1: { symbol: "USDC", icon: "	https://bunniapp.github.io/token-list/token-icons/…um/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48.png" },
    feeTier: "0.3%",
    tvl: "$45.2M",
    volume24h: "$12.4M",
    fees24h: "$37.2K",
    apr: "8.45%",
    poolId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
  },
  {
    id: 2,
    token0: { symbol: "WETH", icon: imgEthIcon },
    token1: { symbol: "WBTC", icon: "https://images.unsplash.com/photo-1707075891510-960cc9ecfcd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXRoZXIlMjBjcnlwdG9jdXJyZW5jeSUyMHN0YWJsZSUyMGNvaW58ZW58MXx8fHwxNzU5MDA1MjE5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    feeTier: "0.3%",
    tvl: "$23.8M",
    volume24h: "$8.9M",
    fees24h: "$26.7K",
    apr: "12.3%",
    poolId: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  },
  {
    id: 3,
    token0: { symbol: "USDC", icon: "	https://bunniapp.github.io/token-list/token-icons/…um/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48.png" },
    token1: { symbol: "SUI", icon: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWklMjBibG9ja2NoYWluJTIwY3J5cHRvY3VycmVuY3l8ZW58MXx8fHwxNzU5MDA1Mjk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    feeTier: "0.05%",
    tvl: "$67.1M",
    volume24h: "$45.2M",
    fees24h: "$22.6K",
    apr: "5.2%",
    poolId: "0x51e883ba7c0b566a26cbc8a94cd33eb0abd418a77cc1e60ad22fd9b1f29cd2ab"
  },
  {
    id: 4,
    token0: { symbol: "WETH", icon: imgEthIcon },
    token1: { symbol: "DAI", icon: "https://images.unsplash.com/photo-1642753174692-91d8bebcab7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXRoZXIlMjBjcnlwdG9jdXJyZW5jeSUyMHN0YWJsZSUyMGNvaW58ZW58MXx8fHwxNzU5MDA1MjE5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    feeTier: "0.3%",
    tvl: "$18.9M",
    volume24h: "$6.7M",
    fees24h: "$20.1K",
    apr: "15.8%",
    poolId: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba"
  },
  {
    id: 5,
    token0: { symbol: "WBTC", icon: "https://images.unsplash.com/photo-1707075891510-960cc9ecfcd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXRoZXIlMjBjcnlwdG9jdXJyZW5jeSUyMHN0YWJsZSUyMGNvaW58ZW58MXx8fHwxNzU5MDA1MjE5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    token1: { symbol: "USDC", icon: "	https://bunniapp.github.io/token-list/token-icons/…um/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48.png" },
    feeTier: "0.3%",
    tvl: "$31.4M",
    volume24h: "$11.8M",
    fees24h: "$35.4K",
    apr: "9.7%",
    poolId: "0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210"
  }
];

function StatsCard({ title, value, change }: { title: string; value: string; change?: string }) {
  return (
    <div className="bg-[rgba(156,163,175,0.1)] rounded-[12px] p-6 border border-[rgba(243,244,246,0.1)]">
      <div className="flex flex-col gap-2">
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-white text-2xl font-medium">{value}</p>
        {change && (
          <p className="text-green-400 text-sm">+{change}</p>
        )}
      </div>
    </div>
  );
}

function PoolRow({ pool, onPoolClick }: { pool: typeof poolsData[0], onPoolClick: (poolId: string, poolName: string) => void }) {
  const handlePoolClick = () => {
    onPoolClick(pool.poolId, `${pool.token0.symbol}/${pool.token1.symbol}`);
  };

  return (
    <tr className="border-b border-[rgba(156,163,175,0.1)] hover:bg-[rgba(156,163,175,0.05)]">
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-950">
              {pool.token0.icon.startsWith('http') ? (
                <ImageWithFallback 
                  src={pool.token0.icon} 
                  alt={pool.token0.symbol}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img 
                  src={pool.token0.icon} 
                  alt={pool.token0.symbol}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-950">
              {pool.token1.icon.startsWith('http') ? (
                <ImageWithFallback 
                  src={pool.token1.icon} 
                  alt={pool.token1.symbol}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img 
                  src={pool.token1.icon} 
                  alt={pool.token1.symbol}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          <div 
            className="flex flex-col cursor-pointer hover:text-blue-400 transition-colors"
            onClick={handlePoolClick}
            title="Cliquez pour voir l'ID de pool"
          >
            <span className="text-white font-medium">
              {pool.token0.symbol}/{pool.token1.symbol}
            </span>
            <span className="text-gray-400 text-sm">{pool.feeTier}</span>
          </div>
        </div>
      </td>
      <td className="py-4 px-6 text-white">{pool.tvl}</td>
      <td className="py-4 px-6 text-white">{pool.volume24h}</td>
      <td className="py-4 px-6 text-white">{pool.fees24h}</td>
      <td className="py-4 px-6">
        <span className="text-green-400 font-medium">{pool.apr}</span>
      </td>
    </tr>
  );
}

export function LiquidityPage() {
  const [showCreatePool, setShowCreatePool] = useState(false);
  const [showPoolIdModal, setShowPoolIdModal] = useState(false);
  const [selectedPoolId, setSelectedPoolId] = useState("");
  const [selectedPoolName, setSelectedPoolName] = useState("");

  if (showCreatePool) {
    return <CreatePoolPage onBack={() => setShowCreatePool(false)} />;
  }

  return (
    <div className="min-h-screen relative w-full flex-1 overflow-hidden">
      {/* Background animé en pluie */}
      <RainBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard title="Total value locked" value="$186.3M" change="2.4%" />
          <StatsCard title="Volume 24H" value="$84.9M" change="15.7%" />
          <StatsCard title="Fees 24H" value="$142.0K" change="8.3%" />
        </div>

        {/* Pools Section */}
        <div className="bg-[rgba(156,163,175,0.1)] rounded-[12px] border border-[rgba(243,244,246,0.1)] overflow-hidden">
          <div className="p-6 border-b border-[rgba(156,163,175,0.1)]">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-xl font-medium">Top Pools</h2>
              <button 
                onClick={() => setShowCreatePool(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-[12px] font-medium transition-colors"
              >
                + New Pool
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(156,163,175,0.1)]">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Pool</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">TVL</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Volume 24H</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Fees 24H</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">APR</th>
                </tr>
              </thead>
              <tbody>
                {poolsData.map((pool) => (
                  <PoolRow 
                    key={pool.id} 
                    pool={pool} 
                    onPoolClick={(poolId, poolName) => {
                      setSelectedPoolId(poolId);
                      setSelectedPoolName(poolName);
                      setShowPoolIdModal(true);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal stylé pour afficher l'ID de pool */}
      {showPoolIdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay avec blur */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPoolIdModal(false)}
          />
          
          {/* Modal content */}
          <div className="relative bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Pool Information</h3>
                <p className="text-gray-400">Pool: {selectedPoolName}</p>
              </div>
              <button
                onClick={() => setShowPoolIdModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Pool ID Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Pool ID
              </label>
              <div className="relative">
                <div className="bg-gray-800/60 border border-gray-600/50 rounded-xl p-4 font-mono text-sm text-gray-300 break-all">
                  {selectedPoolId}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedPoolId);
                    // Animation de feedback
                    const button = document.querySelector('.copy-button');
                    if (button) {
                      button.textContent = 'Copié!';
                      setTimeout(() => {
                        button.textContent = 'Copier';
                      }, 2000);
                    }
                  }}
                  className="absolute top-2 right-2 copy-button bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Copier
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedPoolId);
                  setShowPoolIdModal(false);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Copier et fermer
              </button>
              <button
                onClick={() => setShowPoolIdModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Fermer
              </button>
            </div>

            {/* Info supplémentaire */}
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-blue-300 text-sm font-medium mb-1">Information</p>
                  <p className="text-blue-200/80 text-sm">
                    Cet ID de pool est unique et permet d'identifier précisément ce pool de liquidité sur la blockchain Sui.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}