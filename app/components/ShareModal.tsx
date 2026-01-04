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
 * BACKGROUND GLOW IS LAYERED BEHIND CONTENT TO PREVENT OVERLAY ISSUES.
 */
const BadgeStoryContent = ({ title, icon, description }: { title: string, icon: React.ReactNode, description: string }) => {
    return (
        <div
            className="relative w-[1080px] h-[1920px] bg-[#FFF0E5] flex flex-col items-center justify-center overflow-hidden"
            style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
        >
            {/* Soft Premium Background Glow - Precisely Centered and Layered Behind */}
            <div
                className="absolute inset-0 w-full h-full opacity-70"
                style={{
                    background: 'radial-gradient(circle at 540px 960px, rgba(206,142,148,0.5) 0%, rgba(206,142,148,0.15) 50%, rgba(206,142,148,0) 80%)',
                    filter: 'blur(120px)',
                    zIndex: 0
                }}
            />

            {/* Main Premium Card Case */}
            <div
                className="relative z-10 w-[780px] aspect-[1/1.45] flex flex-col items-center justify-between p-24 bg-[#FEF9F9] rounded-[240px] shadow-[0_80px_160px_-40px_rgba(206,142,148,0.35)] border border-white/40"
            >
                {/* Glossy Inner Layer */}
                <div className="relative z-10 w-full flex-grow flex flex-col items-center justify-between bg-white rounded-[180px] p-20 shadow-[inset_0_2px_4px_rgba(206,142,148,0.05),0_40px_80px_-20px_rgba(206,142,148,0.15)] my-8">
                    <div className="flex-1 flex flex-col items-center justify-center w-full mt-12">
                        {/* Icon Slot - Enlarged for Premium Impact */}
                        <div className="text-[#CE8E94] filter drop-shadow-[0_15px_30px_rgba(206,142,148,0.25)] mb-16">
                            {title === 'SOLARIS' ? (
                                <div className="scale-[3.8]">
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
                                </div>
                            ) : (
                                <div className="scale-[3.5]">{icon}</div>
                            )}
                        </div>

                        {/* Premium Typography */}
                        <div className="text-5xl font-bold tracking-[0.45em] text-[#B5838D] uppercase mb-10 leading-none text-center pl-[0.45em]">
                            {title}
                        </div>

                        {/* Description */}
                        <div className="text-[26px] text-gray-400 italic font-medium text-center leading-relaxed px-10 max-w-[500px]">
                            {`"`}{description}{`"`}
                        </div>
                    </div>

                    {/* EYE ICON DECORATION - At the bottom as requested */}
                    <div className="w-full flex justify-center pb-20">
                        <div className="w-52 h-52 text-[#CE8E94]/35">
                            <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
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

    // HIGH-RELIABILITY CAPTURE - Ensuring elements are painted by the engine
    const generateImageBlob = async (): Promise<Blob | null> => {
        const element = document.getElementById('master-capture-container');
        if (!element) return null;

        try {
            // Increased delay to ensure all layered effects are rendered
            await new Promise(resolve => setTimeout(resolve, 800));

            const blob = await htmlToImage.toBlob(element, {
                pixelRatio: 1,
                backgroundColor: '#FFF0E5',
                cacheBust: true,
                skipAutoScale: true,
                width: 1080,
                height: 1920
            });

            if (!blob || blob.size < 10000) {
                console.error('Blob generation failed or returned empty image');
                return null;
            }
            return blob;
        } catch (err) {
            console.error('Critical capture failure:', err);
            return null;
        }
    };

    // Pre-calculate on opening
    React.useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(async () => {
                if (isGeneratingRef.current) return;
                isGeneratingRef.current = true;
                const blob = await generateImageBlob();
                if (blob) setPreGeneratedBlob(blob);
                isGeneratingRef.current = false;
            }, 1000);
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
                            title: achievementTitle,
                            text: text,
                        });
                        setActionStatus('Done');
                    } catch (err) {
                        console.log('Share interaction aborted');
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
                        Show off your new <strong>{achievementTitle}</strong> badge to the world!
                    </p>

                    {/* PREMIUM UI PREVIEW - Fill Modal Elegantly */}
                    <div className="flex justify-center mb-8 overflow-hidden w-full h-[520px] sm:h-[680px] bg-white rounded-[40px] border border-[#CE8E94]/10 shadow-inner relative items-center">
                        <div className="scale-[0.26] min-[380px]:scale-[0.28] sm:scale-[0.35] origin-center flex-shrink-0">
                            <BadgeStoryContent title={achievementTitle} icon={achievementIcon} description={achievementDescription} />
                        </div>
                    </div>

                    {/* ACTION GRID */}
                    <div className="grid grid-cols-2 gap-3 mb-6 px-2">
                        <SocialButton icon={Instagram} label="Instagram" status={actionStatus} onClick={() => handleAction('Instagram')} disabled={isGenerating} />
                        <SocialButton icon={Facebook} label="Facebook" status={actionStatus} onClick={() => handleAction('Facebook')} disabled={isGenerating} />
                        <SocialButton icon={MessageCircle} label="WhatsApp" status={actionStatus} onClick={() => handleAction('WhatsApp')} disabled={isGenerating} />
                        <SocialButton icon={Twitter} label="X" status={actionStatus} onClick={() => handleAction('X')} disabled={isGenerating} />
                    </div>

                    {/* UTILITY ACTIONS */}
                    <div className="flex justify-center gap-10 pb-2">
                        <UtilityButton icon={Link} label="Copy Link" status={actionStatus} activeLabel="Copied!" onClick={() => handleAction('Copy Link')} />
                        <UtilityButton icon={Download} label="Save Image" status={isGenerating ? 'Generating...' : actionStatus} activeLabel="Saved!" onClick={() => handleAction('Download Image')} />
                    </div>
                </div>
            </Modal>

            {/* MASTER CAPTURE - FIXED POSITIONED OFF-SCREEN TO BE RENDERABLE */}
            <div
                id="master-capture-container"
                className="fixed left-[-3000px] top-0 opacity-100 pointer-events-none"
                style={{ width: '1080px', height: '1920px', zIndex: -100 }}
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

// COMPONENT HELPERS
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
            className={`flex items-center justify-center gap-2.5 p-3.5 rounded-full border border-gray-100 transition-all duration-300 shadow-sm group ${isActive ? 'bg-[#CE8E94] text-white' : 'bg-white text-gray-600 hover:border-[#CE8E94]/40 hover:shadow-md'} ${disabled ? 'opacity-50' : ''}`}
            onClick={onClick}
            disabled={disabled}
        >
            <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-[#CE8E94]'}`} />
            <span className="text-[12px] font-bold tracking-tight">
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
            className={`flex items-center gap-2 text-[11px] transition-all font-bold tracking-[0.18em] uppercase px-2 py-1 ${isActive ? 'text-green-500' : 'text-gray-400 hover:text-[#CE8E94]'}`}
            onClick={onClick}
            disabled={isActive}
        >
            <Icon className="w-4 h-4" />
            {isActive ? (status === 'Generating...' ? 'Wait...' : activeLabel) : label}
        </button>
    );
};
