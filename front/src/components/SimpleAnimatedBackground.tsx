import React from 'react';

export function SimpleAnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient animé simple */}
      <div 
        className="absolute inset-0 animate-pulse"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)
          `
        }}
      />
      
      {/* Particules flottantes */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-sky-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      
      {/* Ondes animées CSS */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(14, 165, 233, 0.3) 0%, transparent 30%),
              radial-gradient(circle at 70% 70%, rgba(16, 185, 129, 0.3) 0%, transparent 30%)
            `,
            animation: 'wave 8s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: `
              radial-gradient(circle at 60% 40%, rgba(139, 92, 246, 0.3) 0%, transparent 40%),
              radial-gradient(circle at 40% 80%, rgba(14, 165, 233, 0.3) 0%, transparent 40%)
            `,
            animation: 'wave 12s ease-in-out infinite reverse'
          }}
        />
      </div>
      
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(180deg); }
        }
      `}</style>
    </div>
  );
}


