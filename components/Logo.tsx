import React from 'react';

export const Logo: React.FC<{ size?: number; className?: string }> = ({ size = 60, className = '' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="balloonGradient" x1="20" y1="0" x2="80" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <radialGradient id="highlight" cx="30" cy="30" r="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity="0.9" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="innerShadow">
          <feOffset dx="-2" dy="-4" />
          <feGaussianBlur stdDeviation="3" result="offset-blur" />
          <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
          <feFlood floodColor="black" floodOpacity="0.2" result="color" />
          <feComposite operator="in" in="color" in2="inverse" result="shadow" />
          <feComposite operator="over" in="shadow" in2="SourceGraphic" />
        </filter>
      </defs>
      
      {/* Balloon String (Subtle) */}
      <path d="M50 90 Q55 95 50 100" stroke="#cbd5e1" strokeWidth="2" fill="none" />

      {/* The Letter A Balloon Shape */}
      <path 
        d="M50 10 
           C20 10 10 40 10 60 
           C10 80 30 90 35 90 
           L40 90 
           L40 70 
           L60 70 
           L60 90 
           L65 90 
           C70 90 90 80 90 60 
           C90 40 80 10 50 10 Z
           M40 55 L50 25 L60 55 L40 55 Z" 
        fill="url(#balloonGradient)" 
        filter="url(#innerShadow)"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
      />
      
      {/* Highilght/Reflection for 3D effect */}
      <ellipse cx="30" cy="30" rx="15" ry="10" fill="url(#highlight)" transform="rotate(-45 30 30)" opacity="0.6" />
      <ellipse cx="70" cy="30" rx="5" ry="3" fill="white" opacity="0.3" />
    </svg>
  );
};