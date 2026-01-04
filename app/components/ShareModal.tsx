"use client";

import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import { Facebook, Instagram, Twitter, MessageCircle, Link, Download } from 'lucide-react';
import * as htmlToImage from 'html-to-image';



import { AlertModal } from './AlertModal';




interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    achievementTitle: string;
    achievementIcon: React.ReactNode;
    achievementDescription: string;
}

export const ShareModal = ({ isOpen, onClose, achievementTitle, achievementIcon, achievementDescription }: ShareModalProps) => {
    const [actionStatus, setActionStatus] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const isGeneratingRef = useRef(false);
    const [preGeneratedBlob, setPreGeneratedBlob] = useState<Blob | null>(null);
    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'info' | 'success' | 'error';
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    // Helper to generate a blob from the badge card
    const generateImageBlob = async (): Promise<Blob | null> => {
        const element = document.getElementById('capture-container');
        if (!element) return null;

        try {
            // Wait a tiny bit for styles to be fully computed if modal just opened
            await new Promise(resolve => setTimeout(resolve, 100));
            // Perform generation on the high-res off-screen container
            return await htmlToImage.toBlob(element, {
                pixelRatio: 2, // CRISP HD VERSION
                backgroundColor: '#FFF0E5',
                cacheBust: true,
                skipAutoScale: true,
                width: 1080,
                height: 1920,
                style: {
                    transform: 'scale(1)', // PREVENTION OF SCALING BUGS
                }
            });
        } catch (err) {
            console.error('Image generation failed:', err);
            return null;
        }
    };

    // Pre-generate the blob as soon as the modal opens to make sharing synchronous
    React.useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(async () => {
                if (isGeneratingRef.current) return;
                isGeneratingRef.current = true;
                const blob = await generateImageBlob();
                if (blob) setPreGeneratedBlob(blob);
                isGeneratingRef.current = false;
            }, 300); // Give modal animation time to settle
            return () => clearTimeout(timer);
        } else {
            setPreGeneratedBlob(null);
            isGeneratingRef.current = false;
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const triggerDownload = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleAction = async (platform: string) => {
        // Reset previous state for immediate visual feedback
        setActionStatus(platform);

        const text = `I just unlocked the ${achievementTitle} badge on Reformer Pilates Malta! 🏆`;
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const filename = `pilates-badge-${achievementTitle.toLowerCase().replace(/\s+/g, '-')}.png`;

        // CATEGORY 1: Direct Redirections (Link Only)
        if (['Facebook', 'WhatsApp', 'X', 'Copy Link'].includes(platform)) {
            if (platform === 'Copy Link') {
                try {
                    await navigator.clipboard.writeText(`${text} ${url}`);
                    setActionStatus('Copied!');
                } catch (err) {
                    console.error('Clipboard failed', err);
                }
            } else if (platform === 'Facebook') {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                setActionStatus('Done');
            } else if (platform === 'WhatsApp') {
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank', 'noopener,noreferrer');
                setActionStatus('Done');
            } else if (platform === 'X') {
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
                setActionStatus('Done');
            }

            // Fast reset for redirections
            setTimeout(() => setActionStatus(null), 600);
            return;
        }

        // CATEGORY 2: Blob-Dependent Actions (Image Share/Download)
        if (isGeneratingRef.current) return;

        try {
            let blob = preGeneratedBlob;
            if (!blob) {
                setIsGenerating(true);
                isGeneratingRef.current = true;
                blob = await generateImageBlob();
                if (blob) setPreGeneratedBlob(blob);
            }

            if (platform === 'Download Image' && blob) {
                triggerDownload(blob, filename);
                setActionStatus('Saved!');
            } else if (platform === 'Instagram' || platform === 'Native Share') {
                // Image-based sharing (Instagram or System Share)
                if (blob && navigator.share) {
                    const file = new File([blob], filename, { type: 'image/png' });
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        try {
                            await navigator.share({
                                files: [file],
                                title: achievementTitle,
                                text: text,
                            });
                            setActionStatus('Done');
                        } catch (shareErr) {
                            console.log('Native share canceled', shareErr);
                            // If user cancels, we just reset
                            setActionStatus(null);
                        }
                    } else if (platform === 'Instagram') {
                        // If cannot share files but specifically clicked Instagram, fallback to link
                        window.open('https://instagram.com', '_blank', 'noopener,noreferrer');
                        setActionStatus('Done');
                    }
                } else if (platform === 'Instagram') {
                    // Fallback for desktop/non-share browsers
                    window.open('https://instagram.com', '_blank', 'noopener,noreferrer');
                    setActionStatus('Done');
                }
            }
        } catch (err) {
            console.error('Blob action failed:', err);
            setActionStatus(null);
        } finally {
            setIsGenerating(false);
            isGeneratingRef.current = false;
            // Immediate reset after a short visual confirm
            setTimeout(() => setActionStatus(null), 800);
        }
    };

    return (
        <>
            <Modal onClose={onClose} className="max-w-[420px]" useDefaultPadding={false}>
                <div className="text-center pt-8 pb-4 px-4 overflow-hidden">
                    <h3 className="text-xl font-bold text-[#CE8E94] mb-0.5 tracking-tight">Share Your Success</h3>
                    <p className="text-gray-400 text-[12px] mb-3">
                        Show off your new <strong>{achievementTitle}</strong> badge to the world!
                    </p>

                    {/* Story-Ready Achievement Card Preview */}
                    <div className="flex justify-center mb-1 overflow-hidden w-full h-[450px] sm:h-[620px]">
                        {/* Scaling wrapper to fit the 1080x1920 Story Canvas into the Modal UI */}
                        <div className="scale-[0.22] min-[400px]:scale-[0.24] sm:scale-[0.32] origin-top flex-shrink-0">
                            {/* Off-screen/Capture Container (9:16 Portrait) */}
                            <div id="capture-container" className="relative w-[1080px] h-[1920px] flex flex-col items-center justify-center overflow-hidden bg-[#FFF0E5]">
                                {/* 1. VECTOR BACKGROUND (Replaces Image to Prevent Overlap & Shifts) */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1080"
                                    height="1920"
                                    viewBox="0 0 1080 1920"
                                    className="absolute inset-0 w-full h-full z-0"
                                    preserveAspectRatio="none"
                                >
                                    {/* 1.1 Background Glow - TUNED FOR IMAGE 1 (Small & Elegant) */}
                                    <defs>
                                        <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                            <stop offset="0%" stopColor="rgba(206,142,148,0.35)" />
                                            <stop offset="60%" stopColor="rgba(206,142,148,0.1)" />
                                            <stop offset="100%" stopColor="rgba(206,142,148,0)" />
                                        </radialGradient>

                                        {/* 1.2 Soft Shadow - SCALED for Small Card */}
                                        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
                                            <feDropShadow dx="0" dy="30" stdDeviation="30" floodColor="rgba(206,142,148,0.2)" />
                                        </filter>
                                    </defs>

                                    {/* Background Rect with Radial Glow */}
                                    <rect width="1080" height="1920" fill="#FFF0E5" />
                                    {/* Glow: Reduced spread to match the smaller card focus */}
                                    <circle cx="540" cy="960" r="600" fill="url(#bgGlow)" filter="blur(100px)" opacity="0.8" />

                                    {/* 1.3 The Card Shape (Outer) - REDUCED DIMENSIONS (620px wide) */}
                                    <rect
                                        x="230"
                                        y="560"
                                        width="620"
                                        height="800"
                                        rx="120"
                                        fill="#FEF9F9"
                                        filter="url(#softShadow)"
                                    />

                                    {/* 1.4 The Card Shape (Inner) */}
                                    <rect
                                        x="254"
                                        y="584"
                                        width="572"
                                        height="752"
                                        rx="90"
                                        fill="#FFFFFF"
                                    />
                                </svg>

                                {/* 2. DYNAMIC CONTENT OVERLAY (Perfectly Aligned to Base Image) */}
                                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pb-[80px]">
                                    {/* Icon Slot - Adjusted to match the card center in the PNG */}
                                    <div className="text-8xl flex justify-center text-[#CE8E94] filter drop-shadow-[0_8px_16px_rgba(206,142,148,0.15)] mb-10 transform scale-[1.6]">
                                        {achievementTitle === 'SOLARIS' ? (
                                            <svg viewBox="0 0 100 100" className="w-16 h-16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="50" cy="50" r="12" stroke="currentColor" strokeWidth="2.5" />
                                                <line x1="50" y1="28" x2="50" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                                <line x1="50" y1="72" x2="50" y2="90" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                                <line x1="72" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                                <line x1="28" y1="50" x2="10" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                                <line x1="66" y1="34" x2="79" y2="21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                                <line x1="34" y1="66" x2="21" y2="79" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                                <line x1="66" y1="66" x2="79" y2="79" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                                <line x1="34" y1="34" x2="21" y2="21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                            </svg>
                                        ) : (
                                            achievementIcon
                                        )}
                                    </div>

                                    {/* Title */}
                                    <div className="text-5xl font-bold tracking-[0.35em] text-[#B5838D] uppercase mb-8 leading-none text-center pl-[0.2em]">
                                        {achievementTitle}
                                    </div>

                                    {/* Description */}
                                    <div className="text-[26px] text-gray-500 italic font-medium text-center leading-relaxed px-16 max-w-[700px]">
                                        {`"`}{achievementDescription}{`"`}
                                    </div>

                                    {/* Eye Icon is already in the PNG, but if we need it dynamic we can add it here. 
                                        Assuming the base PNG includes the eye as shown in user's image. 
                                        If not, I will add it back absolutely positioned at the bottom.
                                        Based on user request "I want exactly this image", I'm assuming the PNG has the eye.
                                        BUT to be safe and ensure high quality vector, I'll overlay the SVG eye exactly where it should be.
                                    */}
                                    <div className="absolute bottom-[460px] opacity-40 text-[#CE8E94]">
                                        <svg viewBox="0 0 100 80" width="160" height="128" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <line x1="50" y1="15" x2="50" y2="0" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                            <line x1="28" y1="22" x2="18" y2="8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                            <line x1="72" y1="22" x2="82" y2="8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                            <line x1="12" y1="38" x2="0" y2="30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                            <line x1="88" y1="38" x2="100" y2="30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                            <path d="M10 55C10 55 25 35 50 35C75 35 90 55 90 55C90 55 75 75 50 75C25 75 10 55 10 55Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                            <circle cx="50" cy="55" r="10" stroke="currentColor" strokeWidth="4" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Share Actions Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3 px-4">
                        <button
                            className={`flex items-center justify-center gap-2 p-2 rounded-full border border-gray-100 transition-all duration-300 shadow-sm group ${actionStatus === 'Instagram' ? 'bg-[#CE8E94] text-white' : 'bg-white text-gray-600'} ${isGenerating ? 'opacity-50' : ''}`}
                            onClick={() => handleAction('Instagram')}
                            disabled={isGenerating}
                        >
                            <Instagram className={`w-4 h-4 group-hover:text-white ${actionStatus === 'Instagram' ? 'text-white' : 'text-[#CE8E94]'}`} />
                            <span className="text-[11px] font-bold text-nowrap">
                                {isGenerating && actionStatus === 'Instagram' ? 'Sharing...' : (actionStatus === 'Instagram' ? 'Done' : 'Instagram')}
                            </span>
                        </button>

                        <button
                            className={`flex items-center justify-center gap-2 p-2 rounded-full border border-gray-100 transition-all duration-300 shadow-sm group ${actionStatus === 'Facebook' ? 'bg-[#CE8E94] text-white' : 'bg-white text-gray-600'} ${isGenerating ? 'opacity-50' : ''}`}
                            onClick={() => handleAction('Facebook')}
                            disabled={isGenerating}
                        >
                            <Facebook className={`w-4 h-4 group-hover:text-white ${actionStatus === 'Facebook' ? 'text-white' : 'text-[#CE8E94]'}`} />
                            <span className="text-[11px] font-bold text-nowrap">
                                {isGenerating && actionStatus === 'Facebook' ? 'Sharing...' : (actionStatus === 'Facebook' ? 'Done' : 'Facebook')}
                            </span>
                        </button>

                        <button
                            className={`flex items-center justify-center gap-2 p-2 rounded-full border border-gray-100 transition-all duration-300 shadow-sm group ${actionStatus === 'WhatsApp' ? 'bg-[#CE8E94] text-white' : 'bg-white text-gray-600'} ${isGenerating ? 'opacity-50' : ''}`}
                            onClick={() => handleAction('WhatsApp')}
                            disabled={isGenerating}
                        >
                            <MessageCircle className={`w-4 h-4 group-hover:text-white ${actionStatus === 'WhatsApp' ? 'text-white' : 'text-[#CE8E94]'}`} />
                            <span className="text-[11px] font-bold text-nowrap">
                                {isGenerating && actionStatus === 'WhatsApp' ? 'Sharing...' : (actionStatus === 'WhatsApp' ? 'Done' : 'WhatsApp')}
                            </span>
                        </button>

                        <button
                            className={`flex items-center justify-center gap-2 p-2 rounded-full border border-gray-100 transition-all duration-300 shadow-sm group ${actionStatus === 'X' ? 'bg-[#CE8E94] text-white' : 'bg-white text-gray-600'} ${isGenerating ? 'opacity-50' : ''}`}
                            onClick={() => handleAction('X')}
                            disabled={isGenerating}
                        >
                            <Twitter className={`w-4 h-4 group-hover:text-white ${actionStatus === 'X' ? 'text-white' : 'text-[#CE8E94]'}`} />
                            <span className="text-[11px] font-bold text-nowrap">
                                {isGenerating && actionStatus === 'X' ? 'Sharing...' : (actionStatus === 'X' ? 'Done' : 'X')}
                            </span>
                        </button>
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex justify-center gap-8 pt-0.5 pb-2">
                        <button
                            className={`flex items-center gap-2 text-[10px] transition-colors font-bold tracking-widest uppercase ${actionStatus === 'Copied!' ? 'text-green-500' : 'text-gray-400 hover:text-[#CE8E94]'}`}
                            onClick={() => handleAction('Copy Link')}
                            disabled={actionStatus === 'Copied!'}
                        >
                            <Link className="w-3.5 h-3.5" /> {actionStatus === 'Copied!' ? 'Link Copied!' : 'Copy Link'}
                        </button>
                        <button
                            className={`flex items-center gap-2 text-[10px] transition-colors font-bold tracking-widest uppercase ${actionStatus === 'Saved!' ? 'text-green-500' : 'text-gray-400 hover:text-[#CE8E94]'}`}
                            onClick={() => handleAction('Download Image')}
                            disabled={actionStatus === 'Saved!'}
                        >
                            <Download className="w-3.5 h-3.5" /> {actionStatus === 'Saved!' ? 'Saved!' : 'Save Image'}
                        </button>
                    </div>
                </div>
            </Modal >

            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </>
    );
};
