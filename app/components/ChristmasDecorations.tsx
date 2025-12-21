"use client";

import React from 'react';

export const Snowfall = React.memo(() => {
    const snowflakes = React.useMemo(() => {
        // Increased count to 150 for fuller effect
        return [...Array(150)].map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 5 + 3}px`,
            height: `${Math.random() * 5 + 3}px`,
            animationDuration: `${Math.random() * 5 + 5}s`,
            animationDelay: `-${Math.random() * 10}s`,
            opacity: Math.random() * 0.5 + 0.3
        }));
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
            <style>{`
                @keyframes snowfall {
                    0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(110vh) translateX(30px) rotate(180deg); opacity: 0; }
                }
                .snowflake {
                    position: absolute;
                    top: -10px;
                    background: white;
                    border-radius: 50%;
                    animation: snowfall linear infinite;
                    will-change: transform;
                }
            `}</style>
            {snowflakes.map((s) => (
                <div
                    key={s.id}
                    className="snowflake"
                    style={{
                        left: s.left,
                        width: s.width,
                        height: s.height,
                        animationDuration: s.animationDuration,
                        animationDelay: s.animationDelay,
                        opacity: s.opacity
                    }}
                />
            ))}
        </div>
    );
});

Snowfall.displayName = "Snowfall";

export const SantaHat = React.memo(({ className = "" }: { className?: string }) => (
    <div className={`pointer-events-none select-none z-[999] ${className}`}>
        <style>{`
            .santa-hat-animate {
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                transform-origin: bottom left;
                will-change: transform;
                filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.1));
            }
        `}</style>
        <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible santa-hat-animate transition-transform">
            <path
                d="M50 5 L15 65 L85 65 Z"
                fill="#ff1a1a"
                stroke="#b57a80"
                strokeWidth="0.5"
            />
            <rect
                x="10" y="60" width="80" height="15" rx="7"
                fill="#f8f8f8"
                className="opacity-95"
            />
            <circle
                cx="50" cy="8" r="8"
                fill="#ffffff"
                className="animate-pulse"
                style={{ animationDuration: '3s' }}
            />
        </svg>
    </div>
));

SantaHat.displayName = "SantaHat";

export const ChristmasTree = React.memo(({ onClick }: { onClick?: () => void }) => (
    <div
        onClick={onClick}
        className="fixed bottom-5 left-[12.5%] -translate-x-1/2 z-[9999] pointer-events-auto cursor-pointer select-none animate-in slide-in-from-bottom duration-1000"
    >
        <svg viewBox="0 0 100 150" className="w-48 h-72 md:w-64 md:h-96 drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)] overflow-visible">
            <rect x="42" y="125" width="16" height="15" fill="#5D4037" />
            <path d="M10 125 L50 85 L90 125 Z" fill="#2D4A27" />
            <path d="M20 95 L50 65 L80 95 Z" fill="#3D5A34" />
            <path d="M30 70 L50 45 L70 70 Z" fill="#4D6A42" />
            <path
                d="M50 30 L54 38 L62 38 L56 44 L58 52 L50 47 L42 52 L44 44 L38 38 L46 38 Z"
                fill="#FFD700"
                className="animate-pulse"
                style={{ filter: 'drop-shadow(0 0 10px #FFD700)' }}
            />
            <circle cx="35" cy="115" r="2.5" fill="#CE8E94" className="animate-pulse" />
            <circle cx="65" cy="115" r="2.5" fill="#B57A80" style={{ animationDelay: '0.8s' }} className="animate-pulse" />
            <circle cx="42" cy="90" r="2.5" fill="#CE8E94" style={{ animationDelay: '1.2s' }} className="animate-pulse" />
            <circle cx="58" cy="90" r="2.5" fill="#B57A80" style={{ animationDelay: '1.8s' }} className="animate-pulse" />
            <circle cx="50" cy="62" r="2.5" fill="#FFD700" style={{ animationDelay: '2.5s' }} className="animate-pulse" />
        </svg>
    </div>
));

ChristmasTree.displayName = "ChristmasTree";
