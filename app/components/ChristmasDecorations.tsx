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
        <img
            src="/holiday/santa-hat-3d.png"
            alt="Santa Hat"
            className="w-12 h-12 object-contain drop-shadow-md"
            style={{ mixBlendMode: 'multiply' }}
        />
    </div>
);

export const ChristmasTree = () => (
    <div className="fixed bottom-0 left-4 z-[9999] pointer-events-none select-none animate-in slide-in-from-bottom duration-1000">
        <img
            src="/holiday/christmas-tree-3d.png"
            alt="Christmas Tree"
            className="w-28 h-40 md:w-36 md:h-52 object-contain drop-shadow-xl"
            style={{ mixBlendMode: 'multiply' }}
        />
    </div>
);
