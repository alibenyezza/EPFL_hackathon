import React from 'react';

interface Token {
  symbol: string;
  name: string;
  icon: string;
  balance: string;
}

interface TokenSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (token: Token) => void;
  availableTokens: Token[];
}

export function TokenSelectorModal({ 
  isOpen, 
  onClose, 
  onSelectToken, 
  availableTokens 
}: TokenSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden border border-gray-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <h3 className="text-xl font-bold text-white">Select Token</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="relative">
            <input
              type="text"
              placeholder="Search name or paste address"
              className="w-full bg-gray-800/60 border border-gray-600/50 rounded-2xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Token List */}
        <div className="max-h-96 overflow-y-auto">
          {availableTokens.map((token, index) => (
            <button
              key={index}
              onClick={() => {
                onSelectToken(token);
                onClose();
              }}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-800/50 transition-colors border-b border-gray-700/30 last:border-b-0"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <img src={token.icon} alt={token.symbol} className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <div className="text-white font-semibold text-lg">{token.symbol}</div>
                  <div className="text-sm text-gray-400">{token.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold text-lg">{token.balance}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700/50">
          <button className="w-full text-blue-400 hover:text-blue-300 text-sm font-semibold">
            Manage Token Lists
          </button>
        </div>
      </div>
    </div>
  );
}
