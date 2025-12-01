'use client'

import React from 'react';

export default function AnimatedBackground() {
  return (
    <div className="animated-bg" aria-hidden="true">
      <div className="absolute inset-0 opacity-20">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `particle-float ${10 + Math.random() * 20}s ease-in-out infinite alternate`,
              animationDelay: `${Math.random() * 5}s`,
              background: 'var(--accent-primary)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
