import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import imgEthIcon from "figma:asset/e0462ae91ad6c89c3a1b6ef05c14ed6beb477985.png";
import usdcLogo from "../assets/usd-coin-usdc-seeklogo.png";
import suiLogo from "../assets/sui-logo.png";

export interface Token {
  symbol: string;
  name: string;
  icon: string;
}

export const availableTokens: Token[] = [
  {
    symbol: "USDC",
    name: "USD Coin", 
    icon: usdcLogo
  },
  {
    symbol: "SUI", 
    name: "Sui Token",
    icon: suiLogo
  }
];

function TokenRow({ token, onSelect }: { token: Token; onSelect: (token: Token) => void }) {
  return (
    <div 
      className="flex items-center gap-3 p-3 hover:bg-[rgba(156,163,175,0.1)] cursor-pointer rounded-lg transition-colors"
      onClick={() => onSelect(token)}
    >
      <div className="w-8 h-8 rounded-full overflow-hidden">
        {token.icon.startsWith('http') ? (
          <ImageWithFallback 
            src={token.icon} 
            alt={token.symbol}
            className="w-full h-full object-cover"
          />
        ) : (
          <img 
            src={token.icon} 
            alt={token.symbol}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-white font-medium">{token.symbol}</span>
        <span className="text-gray-400 text-sm">{token.name}</span>
      </div>
    </div>
  );
}

interface TokenSelectorProps {
  selectedToken: Token | null;
  onTokenSelect: (token: Token) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function TokenSelector({ selectedToken, onTokenSelect, isOpen, onClose }: TokenSelectorProps) {
  if (!isOpen) return null;

  const handleSelect = (token: Token) => {
    onTokenSelect(token);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-[12px] border border-[rgba(243,244,246,0.1)] max-w-md w-full mx-4 max-h-[400px] overflow-hidden">
        <div className="p-4 border-b border-[rgba(156,163,175,0.1)]">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-lg font-medium">Select a token</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white w-6 h-6 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-2 max-h-[300px] overflow-y-auto">
          {availableTokens.map((token) => (
            <TokenRow 
              key={token.symbol} 
              token={token} 
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}