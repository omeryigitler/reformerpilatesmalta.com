"use client";

import React from 'react';

export const Snowfall = () => (
    <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
        <style>{`
            @keyframes snowfall {
                0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
                20% { opacity: 0.8; }
                80% { opacity: 0.6; }
                100% { transform: translateY(110vh) translateX(30px) rotate(360deg); opacity: 0; }
            }
            .snowflake {
                position: absolute;
                top: -10px;
                background: white;
                border-radius: 50%;
                filter: blur(1.5px);
                animation: snowfall linear infinite;
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
            }
        `}</style>
        {[...Array(40)].map((_, i) => (
            <div
                key={i}
                className="snowflake"
                style={{
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 4 + 2}px`,
                    height: `${Math.random() * 4 + 2}px`,
                    animationDuration: `${Math.random() * 8 + 12}s`,
                    animationDelay: `${Math.random() * 15}s`,
                    opacity: Math.random() * 0.4 + 0.2
                }}
            />
        ))}
    </div>
);

export const SantaHat = ({ className = "" }: { className?: string }) => (
    <div className={`pointer-events-none select-none z-[999] ${className}`}>
        <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-md overflow-visible">
            {/* The classic red hat body */}
            <path
                d="M50 5 L15 65 L85 65 Z"
                fill="#ff1a1a"
                stroke="#d40000"
                strokeWidth="1"
            />
            {/* The white fluff trim */}
            <rect
                x="10" y="60" width="80" height="15" rx="7"
                fill="#ffffff"
            />
            {/* The white pom pom */}
            <circle
                cx="50" cy="8" r="8"
                fill="#ffffff"
                className="animate-pulse"
                style={{ animationDuration: '2s' }}
            />
        </svg>
    </div>
);

export const ChristmasTree = () => (
    <div className="fixed bottom-0 left-4 z-[9999] pointer-events-none select-none animate-in slide-in-from-bottom duration-1000">
        <svg viewBox="0 0 100 150" className="w-28 h-40 md:w-40 md:h-60 drop-shadow-2xl overflow-visible">
            {/* Trunk */}
            <rect x="40" y="125" width="20" height="15" fill="#5D4037" />

            {/* Leaves (Bottom layer) */}
            <path d="M5 125 L50 80 L95 125 Z" fill="#2E7D32" />
            {/* Leaves (Middle layer) */}
            <path d="M15 90 L50 55 L85 90 Z" fill="#388E3C" />
            {/* Leaves (Top layer) */}
            <path d="M25 60 L50 35 L75 60 Z" fill="#43A047" />

            {/* Star */}
            <path
                d="M50 20 L55 30 L65 30 L57 37 L60 47 L50 40 L40 47 L43 37 L35 30 L45 30 Z"
                fill="#FFD600"
                className="animate-pulse"
                style={{ filter: 'drop-shadow(0 0 8px #FFD600)' }}
            />

            {/* Colorful Ornaments as requested */}
            <circle cx="35" cy="115" r="4" fill="#E91E63" className="animate-pulse" />
            <circle cx="65" cy="115" r="4" fill="#2196F3" style={{ animationDelay: '0.5s' }} className="animate-pulse" />
            <circle cx="40" cy="85" r="4" fill="#FF9800" style={{ animationDelay: '1s' }} className="animate-pulse" />
            <circle cx="60" cy="85" r="4" fill="#9C27B0" style={{ animationDelay: '1.5s' }} className="animate-pulse" />
            <circle cx="50" cy="55" r="4" fill="#CDDC39" style={{ animationDelay: '2s' }} className="animate-pulse" />
            <circle cx="28" cy="100" r="3.5" fill="#FFD600" style={{ animationDelay: '0.7s' }} className="animate-pulse" />
            <circle cx="72" cy="100" r="3.5" fill="#ffffff" style={{ animationDelay: '1.2s' }} className="animate-pulse" />
        </svg>
    </div>
);
