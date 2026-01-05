"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';

// --- Static Styles Component to prevents re-injection thrashing ---
const ButterflyStyles = React.memo(() => (
    <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes flapLeft {
            0%, 100% { transform: rotateY(0deg); }
            50% { transform: rotateY(65deg); }
        }
        @keyframes flapRight {
            0%, 100% { transform: rotateY(0deg); }
            50% { transform: rotateY(-65deg); }
        }
        @keyframes subtleBodyPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }
        .butterfly-wing-left { 
            transform-origin: 50px 40px; 
            animation: flapLeft var(--flap-time, 0.8s) ease-in-out infinite; 
            transform-style: preserve-3d;
        }
        .butterfly-wing-right { 
            transform-origin: 50px 40px; 
            animation: flapRight var(--flap-time, 0.8s) ease-in-out infinite; 
            transform-style: preserve-3d;
        }
        .butterfly-body {
            animation: subtleBodyPulse 1s ease-in-out infinite;
        }
    `}} />
));
ButterflyStyles.displayName = "ButterflyStyles";

interface ButterflyProps {
    flapDuration?: string;
    scale?: number;
    gradientId: string;
    colors: string[];
    spotColors: string[];
}

const ButterflySVG: React.FC<ButterflyProps> = ({
    flapDuration = "0.8s",
    scale = 1,
    gradientId,
    colors,
    spotColors
}) => {
    // CSS Variable injection safe-guard
    const styleObj = {
        transformStyle: 'preserve-3d',
        '--flap-time': flapDuration
    } as React.CSSProperties;

    return (
        <div className="relative" style={{
            transform: `scale(${scale})`,
            perspective: '1000px',
            transformStyle: 'preserve-3d'
        }}>
            <svg
                viewBox="0 0 100 80"
                className="w-24 h-20 drop-shadow-[0_8px_12px_rgba(0,0,0,0.12)] overflow-visible"
                style={styleObj}
            >
                <defs>
                    <radialGradient id={gradientId} cx="50%" cy="50%" r="70%">
                        {colors.map((color, index) => (
                            <stop
                                key={index}
                                offset={`${(index / (colors.length - 1)) * 100}%`}
                                style={{ stopColor: color }}
                            />
                        ))}
                    </radialGradient>
                </defs>

                {/* Left Wing */}
                <g className="butterfly-wing-left">
                    <path d="M50 40 C38 -5 -2 5 8 40 C12 70 45 60 50 45" fill="#3a2a35" />
                    <path d="M49 40 C36 0 2 10 10 38 C15 63 44 55 49 44" fill={`url(#${gradientId})`} opacity="0.9" />
                    <circle cx="15" cy="30" r="3" fill={spotColors[0]} opacity="0.8" />
                    <circle cx="12" cy="45" r="2.2" fill={spotColors[1]} opacity="0.8" />
                    <circle cx="28" cy="52" r="2.8" fill={spotColors[2]} opacity="0.8" />
                    <path d="M45 40 Q30 20 15 35 M42 45 Q35 55 20 58" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                </g>

                {/* Right Wing */}
                <g className="butterfly-wing-right">
                    <path d="M50 40 C62 -5 102 5 92 40 C88 70 55 60 50 45" fill="#3a2a35" />
                    <path d="M51 40 C64 0 98 10 90 38 C85 63 56 55 51 44" fill={`url(#${gradientId})`} opacity="0.9" />
                    <circle cx="85" cy="30" r="3" fill={spotColors[0]} opacity="0.8" />
                    <circle cx="88" cy="45" r="2.2" fill={spotColors[1]} opacity="0.8" />
                    <circle cx="72" cy="52" r="2.8" fill={spotColors[2]} opacity="0.8" />
                    <path d="M55 40 Q70 20 85 35 M58 45 Q65 55 80 58" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                </g>

                <g className="butterfly-body">
                    <path d="M49 32 C46 20 40 15 34 15 M51 32 C54 20 60 15 66 15" fill="none" stroke="#2a1a25" strokeWidth="0.4" />
                    <circle cx="50" cy="32" r="1.5" fill="#1a0a15" />
                    <ellipse cx="50" cy="40" rx="1.2" ry="5" fill="#2a1a25" />
                    <path d="M49 45 Q50 60 51 45" fill="#1a0a15" stroke="#2a1a25" strokeWidth="0.2" />
                </g>
            </svg>
        </div>
    );
};

export const PetalFall = React.memo(() => {
    const petals = useMemo(() => {
        return [...Array(40)].map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            size: Math.random() * 10 + 8,
            duration: Math.random() * 10 + 10,
            delay: `-${Math.random() * 20}s`,
            opacity: Math.random() * 0.6 + 0.4,
            isSakura: Math.random() > 0.5,
        }));
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
            <style>{`
                @keyframes petalFall {
                    0% { transform: translateY(-10vh) rotate(0deg) translateX(0); }
                    100% { transform: translateY(110vh) rotate(360deg) translateX(40px); }
                }
                .petal { position: absolute; top: -20px; animation: petalFall linear infinite; will-change: transform; }
            `}</style>
            {petals.map((p) => (
                <div
                    key={p.id}
                    className="petal"
                    style={{
                        left: p.left,
                        width: `${p.size}px`,
                        height: p.isSakura ? `${p.size}px` : `${p.size * 1.5}px`,
                        backgroundColor: p.isSakura ? '#ffb7c5' : '#ffffff',
                        borderRadius: p.isSakura ? '100% 0% 100% 0%' : '50% 50% 50% 50% / 80% 80% 20% 20%',
                        animationDuration: `${p.duration}s`,
                        animationDelay: p.delay,
                        opacity: p.opacity,
                    }}
                />
            ))}
        </div>
    );
});
PetalFall.displayName = "PetalFall";

export const ButterflyFollower = React.memo(() => {
    // START VISIBLE: Start at 100, 100 instead of -100 to ensure it's "on screen" immediately
    // If it's still missing, it's not an off-screen culling issue.
    const [displayPos, setDisplayPos] = useState({ x: 100, y: 100, angle: 0, velocity: 0 });
    const targetRef = useRef({ x: 100, y: 100 });
    const currentRef = useRef({ x: 100, y: 100, angle: 0 });
    const requestRef = useRef<number>(0);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Center immediately on valid window
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            if (targetRef.current.x === 100) {
                targetRef.current = { x: cx, y: cy };
                currentRef.current = { x: cx, y: cy, angle: 0 };
            }
        }

        const handleMove = (e: MouseEvent) => {
            targetRef.current = { x: e.clientX, y: e.clientY };
        };

        const animate = () => {
            const ease = 0.08;
            const dx = targetRef.current.x - currentRef.current.x;
            const dy = targetRef.current.y - currentRef.current.y;

            currentRef.current.x += dx * ease;
            currentRef.current.y += dy * ease;

            const dist = Math.sqrt(dx * dx + dy * dy);
            // Limit velocity max to avoid jitter
            const velocity = Math.min(dist * 0.1, 50);

            if (dist > 2) {
                const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
                let angleDiff = targetAngle - currentRef.current.angle;
                while (angleDiff < -180) angleDiff += 360;
                while (angleDiff > 180) angleDiff -= 360;
                currentRef.current.angle += angleDiff * 0.1;
            }

            setDisplayPos({
                x: currentRef.current.x,
                y: currentRef.current.y,
                angle: currentRef.current.angle,
                velocity: velocity
            });
            requestRef.current = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMove);
        requestRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const flapDuration = useMemo(() => {
        const idle = 2.4;
        const active = 1.0;
        const factor = Math.min(displayPos.velocity / 10, 1);
        return `${(idle - (factor * (idle - active))).toFixed(2)}s`;
    }, [displayPos.velocity]);

    const followerColors = ['#FFF9C4', '#B3E5FC', '#FFF176', '#81D4FA', '#FFFDE7'];
    const followerSpots = ['#4FC3F7', '#FFEE58', '#03A9F4'];

    return (
        <>
            <ButterflyStyles />
            <div
                className="fixed pointer-events-none z-[9999] will-change-transform top-0 left-0"
                style={{
                    // Use explicit translate3d with top/left 0 to rely purely on transform
                    transform: `translate3d(${displayPos.x}px, ${displayPos.y}px, 0) translate(-50%, -50%) rotate(${displayPos.angle}deg)`,
                    filter: 'drop-shadow(0 15px 15px rgba(0,0,0,0.15))'
                }}
            >
                <ButterflySVG
                    flapDuration={flapDuration}
                    scale={0.7}
                    gradientId="followerGrad"
                    colors={followerColors}
                    spotColors={followerSpots}
                />
            </div>
        </>
    );
});
ButterflyFollower.displayName = "ButterflyFollower";

export const CornerDaisy: React.FC<{ onClick?: () => void }> = React.memo(({ onClick }) => (
    <div onClick={onClick} className="fixed bottom-0 left-4 md:left-12 z-[50] pointer-events-auto cursor-pointer select-none">
        <style>{`
            @keyframes daisySway { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(4deg); } }
            .daisy-container { transform-origin: bottom center; animation: daisySway 4s ease-in-out infinite; }
        `}</style>
        <div className="daisy-container group">
            <svg viewBox="0 0 100 160" className="w-24 h-40 md:w-44 md:h-72 drop-shadow-xl overflow-visible">
                <path d="M50 160 Q45 100 50 50" stroke="#4CAF50" strokeWidth="4" fill="none" />
                <path d="M50 120 Q20 110 30 140 Q40 135 50 125" fill="#66BB6A" />
                <g transform="translate(50, 50)">
                    {[...Array(12)].map((_, i) => (
                        <ellipse key={i} cx="0" cy="-22" rx="7" ry="22" fill="white" transform={`rotate(${i * 30})`} stroke="#f0f0f0" strokeWidth="0.5" />
                    ))}
                    <circle cx="0" cy="0" r="10" fill="#FFD700" />
                </g>
            </svg>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-full shadow-lg text-[12px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[#CE8E94] border border-[#CE8E94]/20">
                Spring Bloom Guide
            </div>
        </div>
    </div>
));
CornerDaisy.displayName = "CornerDaisy";

export const ImageButterfly: React.FC<{ className?: string }> = React.memo(({ className = "" }) => (
    <div className={`pointer-events-none select-none z-[20] ${className}`}>
        <style>{`
            @keyframes idleDrift {
                0%, 100% { transform: translate(0, 0) rotate(15deg); }
                50% { transform: translate(8px, -12px) rotate(18deg); }
            }
            .idle-layer {
                animation: idleDrift 7s ease-in-out infinite;
            }
        `}</style>
        <div className="idle-layer">
            <ButterflySVG
                flapDuration="2.2s"
                scale={1.1}
                gradientId="imageGrad"
                colors={['#F8BBD0', '#E1BEE7', '#FCE4EC', '#D1C4E9', '#F48FB1']}
                spotColors={['#BA68C8', '#F06292', '#9575CD']}
            />
        </div>
    </div>
));
ImageButterfly.displayName = "ImageButterfly";
