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

/**
 * UNIFIED PREMIUM DESIGN - Ensuring 100% parity between preview and export.
 * This component defines the 1080x1920 Story layout.
 */
const BadgeStoryContent = ({ title, icon, description }: { title: string, icon: React.ReactNode, description: string }) => {
    return (
        <div
            className="relative w-[1080px] h-[1920px] bg-[#FFF0E5] flex flex-col items-center justify-center overflow-hidden"
            style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
        >
            {/* Soft Premium Background Glow - Precisely Centered */}
            <div
                className="absolute inset-0 w-full h-full opacity-70"
                style={{
                    background: 'radial-gradient(circle at 540px 960px, rgba(206,142,148,0.6) 0%, rgba(206,142,148,0.2) 50%, rgba(206,142,148,0) 100%)',
                    filter: 'blur(100px)',
                    zIndex: 0
                }}
            />

            {/* Major Shadow Ring for Depth */}
            <div
                className="absolute w-[900px] h-[900px] rounded-full opacity-20"
                style={{
                    background: 'radial-gradient(circle, rgba(206,142,148,0.4) 0%, transparent 70%)',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1
                }}
            />

            {/* Main Premium Card Case */}
            <div
                className="relative z-10 w-[780px] aspect-[1/1.4] flex flex-col items-center justify-between p-24 bg-[#FEF9F9] rounded-[240px] shadow-[0_80px_160px_-40px_rgba(206,142,148,0.4)] border border-white/40"
            >
                {/* Glossy Inner Layer */}
                <div className="relative z-10 w-full flex-grow flex flex-col items-center justify-between bg-white rounded-[180px] p-20 shadow-[inset_0_2px_4px_rgba(206,142,148,0.1),0_40px_80px_-20px_rgba(206,142,148,0.2)] my-8">
                    <div className="flex-1 flex flex-col items-center justify-center w-full mt-10">
                        {/* Enlarged Icon Slot */}
                        <div className="text-[#CE8E94] filter drop-shadow-[0_20px_40px_rgba(206,142,148,0.3)] mb-16 transform scale-[3.2]">
                            {title === 'SOLARIS' ? (
                                <svg viewBox="0 0 100 100" className="w-24 h-24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                                <div className="scale-[2.8]">{icon}</div>
                            )}
                        </div>

                        {/* Premium Typography */}
                        <div className="text-5xl font-bold tracking-[0.4em] text-[#B5838D] uppercase mb-10 leading-none text-center pl-[0.4em]">
                            {title}
                        </div>

                        {/* Elegant Description */}
                        <div className="text-[26px] text-gray-400 italic font-medium text-center leading-relaxed px-10 max-w-[500px]">
                            {`"`}{description}{`"`}
                        </div>
                    </div>

                    {/* Branding Anchor */}
                    <div className="w-full flex justify-center pb-16">
                        <div className="w-48 h-1 bg-gradient-to-r from-transparent via-[#CE8E94]/20 to-transparent mb-12" />
                        <div className="absolute bottom-20 text-[#CE8E94]/30 text-2xl font-bold tracking-[0.2em] uppercase">
                            Reformer Pilates Malta
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

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

    // High-Reliability Image Generation Block
    const generateImageBlob = async (): Promise<Blob | null> => {
        const element = document.getElementById('master-capture-container');
        if (!element) return null;

        try {
            // Enhanced wait for complete font/SVG rendering
            await new Promise(resolve => setTimeout(resolve, 500));

            // Note: capturing as Blob from the unscaled master element
            const blob = await htmlToImage.toBlob(element, {
                pixelRatio: 1, // 1:1 since source is already 1080x1920
                backgroundColor: '#FFF0E5',
                cacheBust: true,
                skipAutoScale: true,
                width: 1080,
                height: 1920
            });

            if (!blob || blob.size < 5000) {
                console.error('Generated blob is suspiciously small or null');
                return null;
            }
            return blob;
        } catch (err) {
            console.error('Critical image generation failure:', err);
            return null;
        }
    };

    // Auto-pre-generate on open
    React.useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(async () => {
                if (isGeneratingRef.current) return;
                isGeneratingRef.current = true;
                const blob = await generateImageBlob();
                if (blob) setPreGeneratedBlob(blob);
                isGeneratingRef.current = false;
            }, 800);
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
        setActionStatus(platform);
        const text = `I just unlocked the ${achievementTitle} badge on Reformer Pilates Malta! 🏆`;
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const filename = `badge-${achievementTitle.toLowerCase()}.png`;

        // Direct Redirections
        if (['Facebook', 'WhatsApp', 'X', 'Copy Link'].includes(platform)) {
            if (platform === 'Copy Link') {
                try {
                    await navigator.clipboard.writeText(`${text} ${url}`);
                    setActionStatus('Copied!');
                } catch (err) { console.error(err); }
            } else if (platform === 'Facebook') {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
            } else if (platform === 'WhatsApp') {
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
            } else if (platform === 'X') {
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
            }
            setTimeout(() => setActionStatus(null), 1000);
            return;
        }

        // Image-Based Sharing
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
            } else if ((platform === 'Instagram' || platform === 'Native Share') && blob) {
                if (navigator.share) {
                    const file = new File([blob], filename, { type: 'image/png' });
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'My Achievement',
                            text: text,
                        });
                        setActionStatus('Done');
                    } catch (err) {
                        console.log('User canceled share');
                        setActionStatus(null);
                    }
                } else if (platform === 'Instagram') {
                    window.open('https://instagram.com', '_blank');
                }
            }
        } catch (err) {
            console.error('Share action failed', err);
        } finally {
            setIsGenerating(false);
            isGeneratingRef.current = false;
            setTimeout(() => setActionStatus(null), 1500);
        }
    };

    return (
        <>
            <Modal onClose={onClose} className="max-w-[450px]" useDefaultPadding={false}>
                <div className="text-center pt-10 pb-6 px-6 overflow-hidden">
                    <h3 className="text-2xl font-bold text-[#CE8E94] mb-1 tracking-tight">Share Your Success</h3>
                    <p className="text-gray-400 text-sm mb-6">
                        Export your <strong>{achievementTitle}</strong> badge to your Story!
                    </p>

                    {/* PREMIUM UI PREVIEW - Optimized Scaling */}
                    <div className="flex justify-center mb-8 overflow-hidden w-full h-[450px] sm:h-[600px] bg-white rounded-[40px] border border-[#CE8E94]/10 shadow-inner relative">
                        <div className="scale-[0.23] min-[380px]:scale-[0.25] sm:scale-[0.31] origin-top flex-shrink-0 mt-2">
                            <BadgeStoryContent title={achievementTitle} icon={achievementIcon} description={achievementDescription} />
                        </div>
                    </div>

                    {/* PRIMARY ACTIONS GRID */}
                    <div className="grid grid-cols-2 gap-3 mb-5 px-2">
                        <SocialButton icon={Instagram} label="Instagram" status={actionStatus} onClick={() => handleAction('Instagram')} disabled={isGenerating} />
                        <SocialButton icon={Facebook} label="Facebook" status={actionStatus} onClick={() => handleAction('Facebook')} disabled={isGenerating} />
                        <SocialButton icon={MessageCircle} label="WhatsApp" status={actionStatus} onClick={() => handleAction('WhatsApp')} disabled={isGenerating} />
                        <SocialButton icon={Twitter} label="X" status={actionStatus} onClick={() => handleAction('X')} disabled={isGenerating} />
                    </div>

                    {/* SECONDARY UTILITY ACTIONS */}
                    <div className="flex justify-center gap-10 pt-2">
                        <UtilityButton icon={Link} label="Copy Link" status={actionStatus} activeLabel="Copied!" onClick={() => handleAction('Copy Link')} />
                        <UtilityButton icon={Download} label="Save Image" status={isGenerating ? 'Generating...' : actionStatus} activeLabel="Saved!" onClick={() => handleAction('Download Image')} />
                    </div>
                </div>
            </Modal>

            {/* HIGH-RELIABILITY MASTER CAPTURE CONTAINER (HIDDEN BUT VIEWABLE BY RENDERING ENGINE) */}
            <div
                id="master-capture-container"
                className="fixed opacity-0 pointer-events-none"
                style={{ top: 0, left: 0, zIndex: -100, width: '1080px', height: '1920px' }}
            >
                <BadgeStoryContent title={achievementTitle} icon={achievementIcon} description={achievementDescription} />
            </div>

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

// HELPERS
interface SocialButtonProps {
    icon: React.ElementType;
    label: string;
    status: string | null;
    onClick: () => void;
    disabled: boolean;
}

const SocialButton = ({ icon: Icon, label, status, onClick, disabled }: SocialButtonProps) => {
    const isActive = status === label;
    return (
        <button
            className={`flex items-center justify-center gap-2.5 p-3 rounded-full border border-gray-100 transition-all duration-300 shadow-sm group ${isActive ? 'bg-[#CE8E94] text-white' : 'bg-white text-gray-600 hover:border-[#CE8E94]/40 hover:shadow-md'} ${disabled ? 'opacity-50' : ''}`}
            onClick={onClick}
            disabled={disabled}
        >
            <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-[#CE8E94]'}`} />
            <span className="text-[11px] font-bold tracking-tight">
                {isActive ? 'Opening...' : label}
            </span>
        </button>
    );
};

interface UtilityButtonProps {
    icon: React.ElementType;
    label: string;
    status: string | null;
    activeLabel: string;
    onClick: () => void;
}

const UtilityButton = ({ icon: Icon, label, status, activeLabel, onClick }: UtilityButtonProps) => {
    const isActive = status === activeLabel || (label === 'Save Image' && status === 'Generating...');
    return (
        <button
            className={`flex items-center gap-2 text-[10px] transition-all font-bold tracking-[0.15em] uppercase px-2 py-1 rounded-md ${isActive ? 'text-green-500 scale-105' : 'text-gray-400 hover:text-[#CE8E94]'}`}
            onClick={onClick}
            disabled={isActive}
        >
            <Icon className="w-3.5 h-3.5" />
            {isActive ? (status === 'Generating...' ? 'Processing...' : activeLabel) : label}
        </button>
    );
};
