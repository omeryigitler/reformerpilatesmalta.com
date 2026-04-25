"use client";

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

type InteractionStage = 'idle' | 'animating' | 'finished';

type PileItem = {
    id: string;
    svg: string;
    x: number;
    rot: number;
};

const SHAPES = [
    `<svg viewBox="0 0 24 24" class="w-full h-full drop-shadow-sm"><defs><linearGradient id="loveG1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#FF9A9E;stop-opacity:1" /><stop offset="100%" style="stop-color:#FECFEF;stop-opacity:1" /></linearGradient></defs><path fill="url(#loveG1)" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
    `<svg viewBox="0 0 24 24" class="w-full h-full drop-shadow-sm"><defs><linearGradient id="loveG2" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#ff9a9e;stop-opacity:1" /><stop offset="100%" style="stop-color:#f6416c;stop-opacity:1" /></linearGradient></defs><path fill="none" stroke="url(#loveG2)" stroke-width="2.5" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
    `<svg viewBox="0 0 24 24" class="w-full h-full drop-shadow-sm"><path fill="none" stroke="#FDA7DF" stroke-width="3" stroke-linecap="round" d="M4,4 C8,4 8,20 12,20 C16,20 16,4 20,4"/></svg>`,
    `<svg viewBox="0 0 24 24" class="w-full h-full drop-shadow-sm"><path fill="none" stroke="#FF6B6B" stroke-width="3" stroke-linecap="round" d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/></svg>`,
    `<svg viewBox="0 0 24 24" class="w-full h-full drop-shadow-sm"><circle cx="12" cy="12" r="6" fill="#F7D794" /></svg>`,
];

const HeroHeart = React.memo(() => (
    <div className="relative w-52 h-52 md:w-80 md:h-80 animate-[loveBreathe_3s_ease-in-out_infinite] drop-shadow-2xl">
        <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-lg">
            <defs>
                <linearGradient id="heroLoveHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fb7185" />
                    <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
            </defs>
            <path
                fill="url(#heroLoveHeartGrad)"
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
        </svg>
    </div>
));
HeroHeart.displayName = "HeroHeart";

class Particle {
    element: HTMLDivElement;
    x: number;
    y: number;
    vx: number;
    vy: number;
    rot: number;
    vRot: number;
    svgContent: string;

    constructor(x: number, y: number, svgContent: string, velocityScale = 1) {
        const isMobile = window.innerWidth < 768;
        const screenW = window.innerWidth;
        const spread = (Math.random() - 0.5) * 150;
        let startX = x + spread;

        if (startX < 0) startX = Math.random() * 20;
        if (startX > screenW) startX = screenW - (Math.random() * 20);

        const angle = Math.random() * Math.PI * 2;
        const velocity = (3 + Math.random() * 8) * velocityScale;

        this.x = startX;
        this.y = y;
        this.vx = Math.cos(angle) * velocity;
        this.vy = Math.sin(angle) * velocity - (8 * velocityScale);
        this.rot = Math.random() * 360;
        this.vRot = (Math.random() - 0.5) * 10;
        this.svgContent = svgContent;
        this.element = document.createElement('div');
        this.element.className = 'flying-love-particle';
        this.element.innerHTML = svgContent;

        const size = (isMobile ? 15 : 20) + Math.random() * (isMobile ? 20 : 30);
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }

    update() {
        this.vy += 0.25;
        this.x += this.vx;
        this.y += this.vy;
        this.rot += this.vRot;
        this.vx *= 0.99;
        this.vy *= 0.95;
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rot}deg)`;
    }
}

type BurstSystemHandle = {
    burst: (x: number, y: number, options?: { count?: number; velocityScale?: number }) => void;
};

const BurstSystem = forwardRef<BurstSystemHandle, { onLand: (svgContent: string, x: number) => void }>(({ onLand }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const frameIdRef = useRef<number>(0);

    const loop = useCallback(() => {
        const particles = particlesRef.current;
        const screenHeight = window.innerHeight;

        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            particle.update();

            if (particle.y > screenHeight - 50) {
                onLand(particle.svgContent, particle.x);
                particle.element.remove();
                particles.splice(i, 1);
            }
        }

        if (particles.length > 0) {
            frameIdRef.current = requestAnimationFrame(loop);
        }
    }, [onLand]);

    useImperativeHandle(ref, () => ({
        burst: (originX, originY, options = {}) => {
            if (!containerRef.current) return;

            const count = options.count || 40;
            const velocityScale = options.velocityScale || 1;

            for (let i = 0; i < count; i++) {
                const svg = SHAPES[Math.floor(Math.random() * SHAPES.length)];
                const particle = new Particle(originX, originY, svg, velocityScale);
                containerRef.current.appendChild(particle.element);
                particlesRef.current.push(particle);
            }

            cancelAnimationFrame(frameIdRef.current);
            loop();
        }
    }), [loop]);

    useEffect(() => () => cancelAnimationFrame(frameIdRef.current), []);

    return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[10000]" />;
});
BurstSystem.displayName = "BurstSystem";

const BottomPile = React.memo(({ items }: { items: PileItem[] }) => (
    <div className="fixed bottom-0 left-0 w-full h-24 pointer-events-none z-[9999] overflow-hidden" aria-hidden="true">
        {items.map((item) => (
            <div
                key={item.id}
                className="absolute bottom-0 w-8 h-8 md:w-10 md:h-10 transition-all duration-700 opacity-80 mix-blend-multiply"
                style={{
                    left: item.x,
                    transform: `translateX(-50%) rotate(${item.rot}deg)`,
                }}
                dangerouslySetInnerHTML={{ __html: item.svg }}
            />
        ))}
        {items.length > 5 && (
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#FFF0E5] to-transparent pointer-events-none" />
        )}
    </div>
));
BottomPile.displayName = "BottomPile";

export const LoveRainEffect = React.memo(() => {
    const burstSystemRef = useRef<BurstSystemHandle>(null);
    const heartRef = useRef<HTMLDivElement>(null);
    const [pileItems, setPileItems] = useState<PileItem[]>([]);
    const [stage, setStage] = useState<InteractionStage>('idle');
    const [showText, setShowText] = useState(false);

    const runSequence = useCallback(() => {
        setStage('animating');

        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2;

        if (heartRef.current) {
            const rect = heartRef.current.getBoundingClientRect();
            x = rect.left + rect.width / 2;
            y = rect.top + rect.height / 2;
        }

        const isMobile = window.innerWidth < 768;
        burstSystemRef.current?.burst(x, y, {
            count: isMobile ? 35 : 60,
            velocityScale: isMobile ? 0.8 : 1,
        });

        setShowText(true);

        window.setTimeout(() => {
            setShowText(false);
            window.setTimeout(() => setStage('finished'), 2000);
        }, 3000);
    }, []);

    useEffect(() => {
        if (stage !== 'idle') return;

        const handleFirstInteraction = (event: Event) => {
            if (event.type === 'keydown' && (event as KeyboardEvent).key.toLowerCase() === 'tab') return;
            runSequence();
        };

        window.addEventListener('mousemove', handleFirstInteraction, { once: true });
        window.addEventListener('mousedown', handleFirstInteraction, { once: true });
        window.addEventListener('touchstart', handleFirstInteraction, { once: true });
        window.addEventListener('scroll', handleFirstInteraction, { once: true });
        window.addEventListener('keydown', handleFirstInteraction, { once: true });

        return () => {
            window.removeEventListener('mousemove', handleFirstInteraction);
            window.removeEventListener('mousedown', handleFirstInteraction);
            window.removeEventListener('touchstart', handleFirstInteraction);
            window.removeEventListener('scroll', handleFirstInteraction);
            window.removeEventListener('keydown', handleFirstInteraction);
        };
    }, [runSequence, stage]);

    const handleParticleLand = useCallback((svg: string, x: number) => {
        setPileItems((prev) => {
            const limit = window.innerWidth < 768 ? 100 : 200;
            const newItems = [
                ...prev,
                {
                    id: Math.random().toString(36).slice(2, 11),
                    svg,
                    x,
                    rot: Math.random() * 360,
                },
            ];

            return newItems.length > limit ? newItems.slice(newItems.length - limit) : newItems;
        });
    }, []);

    const overlayVisible = stage === 'idle' || showText;
    const styles = useMemo(() => `
        @keyframes loveBreathe {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.06); }
        }
    `, []);

    return (
        <>
            <style>{styles}</style>
            <div
                className={`fixed inset-0 z-[9997] pointer-events-none transition-all duration-[2000ms] ${showText ? 'bg-white/70 backdrop-blur-md' : 'bg-white/40 backdrop-blur-sm'} ${overlayVisible ? 'opacity-100' : 'opacity-0'}`}
                aria-hidden="true"
            />
            <div className={`fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none transition-all duration-300 ${stage === 'idle' ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}>
                <div ref={heartRef}>
                    <HeroHeart />
                </div>
            </div>
            <div className={`fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none transition-opacity duration-[2000ms] ${showText ? 'opacity-100' : 'opacity-0'}`}>
                <h2 className="font-serif text-5xl md:text-8xl text-[#e11d48] font-bold drop-shadow-lg text-center leading-tight tracking-tight">
                    Happy<br />Valentine&apos;s<br />Day
                </h2>
            </div>
            <BurstSystem ref={burstSystemRef} onLand={handleParticleLand} />
            <BottomPile items={pileItems} />
        </>
    );
});
LoveRainEffect.displayName = "LoveRainEffect";
