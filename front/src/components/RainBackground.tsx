import React from 'react';
import './RainBackground.css';

export function RainBackground() {
  return (
    <div className="rain-container" style={{ zIndex: 1, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
      <div className="rain-overlay"></div>
    </div>
  );
}
