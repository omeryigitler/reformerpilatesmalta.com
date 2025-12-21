"use client";

import React from 'react';

export const Snowfall = () => (
    <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
        <style>{`
            @keyframes snowfall {
                0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
                10% { opacity: 0.95; }
                90% { opacity: 0.8; }
                100% { transform: translateY(110vh) translateX(50px) rotate(360deg); opacity: 0; }
            }
            .snowflake {
                position: absolute;
                top: -10px;
                background: white;
                border-radius: 50%;
                filter: blur(1px);
                animation: snowfall linear infinite;
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
            }
        `}</style>
        {[...Array(120)].map((_, i) => (
            <div
                key={i}
                className="snowflake"
                style={{
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 8 + 2}px`,
                    height: `${Math.random() * 8 + 2}px`,
                    animationDuration: `${Math.random() * 5 + 8}s`,
                    animationDelay: `${Math.random() * 15}s`,
                    opacity: Math.random() * 0.6 + 0.4
                }}
            />
        ))}
    </div>
);

export const SantaHat = ({ className = "" }: { className?: string }) => (
    <div className={`pointer-events-none select-none z-[999] ${className}`}>
        <svg viewBox="0 0 100 80" className="w-10 h-10 drop-shadow-[0_4px_6px_rgba(0,0,0,0.2)] overflow-visible">
            {/* Red hat body */}
            <path
                d="M50 5 L15 65 L85 65 Z"
                fill="#ff1a1a"
                stroke="#b57a80"
                strokeWidth="0.5"
            />
            {/* White trim */}
            <rect
                x="10" y="60" width="80" height="15" rx="7"
                fill="#f8f8f8"
                className="opacity-95"
            />
            {/* Pom pom */}
            <circle
                cx="50" cy="8" r="8"
                fill="#ffffff"
                className="animate-pulse"
                style={{ animationDuration: '3s' }}
            />
        </svg>
    </div>
);

export const ChristmasTree = () => (
    <div className="fixed bottom-0 left-4 z-[9999] pointer-events-none select-none animate-in slide-in-from-bottom duration-1000">
        <svg viewBox="0 0 100 150" className="w-24 h-36 md:w-32 md:h-48 drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)] overflow-visible">
            {/* Trunk */}
            <rect x="42" y="125" width="16" height="15" fill="#5D4037" />

            {/* Leaves - elegant dark greens */}
            <path d="M10 125 L50 85 L90 125 Z" fill="#2D4A27" />
            <path d="M20 95 L50 65 L80 95 Z" fill="#3D5A34" />
            <path d="M30 70 L50 45 L70 70 Z" fill="#4D6A42" />

            {/* Glowing Star */}
            <path
                d="M50 30 L54 38 L62 38 L56 44 L58 52 L50 47 L42 52 L44 44 L38 38 L46 38 Z"
                fill="#FFD700"
                className="animate-pulse"
                style={{ filter: 'drop-shadow(0 0 10px #FFD700)' }}
            />

            {/* Premium brand-colored ornaments */}
            <circle cx="35" cy="115" r="2.5" fill="#CE8E94" className="animate-pulse" />
            <circle cx="65" cy="115" r="2.5" fill="#B57A80" style={{ animationDelay: '0.8s' }} className="animate-pulse" />
            <circle cx="42" cy="90" r="2.5" fill="#CE8E94" style={{ animationDelay: '1.2s' }} className="animate-pulse" />
            <circle cx="58" cy="90" r="2.5" fill="#B57A80" style={{ animationDelay: '1.8s' }} className="animate-pulse" />
            <circle cx="50" cy="62" r="2.5" fill="#FFD700" style={{ animationDelay: '2.5s' }} className="animate-pulse" />
        </svg>
    </div>
);
