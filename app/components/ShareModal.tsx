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

    // Helper to generate a blob from the master capture container
    const generateImageBlob = async (): Promise<Blob | null> => {
        const element = document.getElementById('master-capture-container');
        if (!element) {
            console.error('Master capture container not found');
            return null;
        }

        try {
            // Wait a bit for images/styles to be ready
            await new Promise(resolve => setTimeout(resolve, 200));

            // Simple toBlob call on the unscaled 1080x1920 element
            const blob = await htmlToImage.toBlob(element, {
                pixelRatio: 1, // Element is already 1080x1920
                backgroundColor: '#FFF0E5',
            });

            return blob;
        } catch (err) {
            console.error('Image generation failed:', err);
            return null;
        }
    };

    // Pre-generate the blob as soon as the modal opens
    React.useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(async () => {
                if (isGeneratingRef.current) return;
                isGeneratingRef.current = true;
                const blob = await generateImageBlob();
                if (blob) setPreGeneratedBlob(blob);
                isGeneratingRef.current = false;
            }, 500);
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
        const filename = `pilates-badge-${achievementTitle.toLowerCase().replace(/\s+/g, '-')}.png`;

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
            } else if (platform === 'Instagram' || platform === 'Native Share') {
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
                            setActionStatus(null);
                        }
                    } else if (platform === 'Instagram') {
                        window.open('https://instagram.com', '_blank', 'noopener,noreferrer');
                        setActionStatus('Done');
                    }
                } else if (platform === 'Instagram') {
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
            setTimeout(() => setActionStatus(null), 1500);
        }
    };

    return (
        <>
            <Modal onClose={onClose} className="max-w-[420px]" useDefaultPadding={false}>
                <div className="text-center pt-8 pb-4 px-4 overflow-hidden">
                    <h3 className="text-xl font-bold text-[#CE8E94] mb-1 tracking-tight">Share Your Success</h3>
                    <p className="text-gray-400 text-[12px] mb-4">
                        Show off your new <strong>{achievementTitle}</strong> badge!
                    </p>

                    {/* BEAUTIFUL COMPACT UI PREVIEW */}
                    <div className="flex justify-center mb-6 overflow-hidden w-full h-[320px] sm:h-[420px] bg-white rounded-3xl border border-[#CE8E94]/10 shadow-inner relative items-center">
                        <div className="absolute inset-0 opacity-40" style={{
                            background: 'radial-gradient(circle at center, rgba(206,142,148,0.3) 0%, rgba(206,142,148,0) 70%)',
                            filter: 'blur(30px)',
                        }} />

                        <div className="relative z-10 w-[240px] aspect-[1/1.35] bg-[#FEF9F9] rounded-[60px] shadow-lg p-6 flex flex-col items-center justify-between border border-white/50">
                            <div className="flex-grow flex flex-col items-center justify-center w-full bg-white rounded-[40px] p-4 shadow-sm">
                                <div className="text-4xl text-[#CE8E94] mb-3">
                                    {achievementTitle === 'SOLARIS' ? (
                                        <div className="scale-125">
                                            <svg viewBox="0 0 100 100" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="50" cy="50" r="12" stroke="currentColor" strokeWidth="3" />
                                                <line x1="50" y1="28" x2="50" y2="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                                <line x1="50" y1="72" x2="50" y2="90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                                <line x1="72" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                                <line x1="28" y1="50" x2="10" y2="50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                                <line x1="66" y1="34" x2="79" y2="21" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                                <line x1="34" y1="66" x2="21" y2="79" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                                <line x1="66" y1="66" x2="79" y2="79" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                                <line x1="34" y1="34" x2="21" y2="21" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                    ) : (
                                        <div className="scale-110">{achievementIcon}</div>
                                    )}
                                </div>
                                <div className="text-lg font-bold tracking-widest text-[#B5838D] uppercase mb-2">
                                    {achievementTitle}
                                </div>
                                <div className="text-[10px] text-gray-400 italic text-center px-1">
                                    {`"`}{achievementDescription}{`"`}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ACTIONS GRID */}
                    <div className="grid grid-cols-2 gap-2 mb-4 px-4">
                        <ShareButton icon={Instagram} label="Instagram" status={actionStatus} onClick={() => handleAction('Instagram')} disabled={isGenerating} />
                        <ShareButton icon={Facebook} label="Facebook" status={actionStatus} onClick={() => handleAction('Facebook')} disabled={isGenerating} />
                        <ShareButton icon={MessageCircle} label="WhatsApp" status={actionStatus} onClick={() => handleAction('WhatsApp')} disabled={isGenerating} />
                        <ShareButton icon={Twitter} label="X" status={actionStatus} onClick={() => handleAction('X')} disabled={isGenerating} />
                    </div>

                    <div className="flex justify-center gap-8 pb-2">
                        <ActionButton icon={Link} label="Copy Link" status={actionStatus} activeLabel="Copied!" onClick={() => handleAction('Copy Link')} />
                        <ActionButton icon={Download} label="Save Image" status={actionStatus} activeLabel="Saved!" onClick={() => handleAction('Download Image')} />
                    </div>
                </div>
            </Modal>

            {/* MASTER CAPTURE CONTAINER (HIDDEN BUT CAPTURABLE) */}
            <div
                id="master-capture-container"
                className="fixed left-[-3000px] top-0 w-[1080px] h-[1920px] bg-[#FFF0E5] flex flex-col items-center justify-center overflow-hidden"
                style={{ pointerEvents: 'none' }}
            >
                {/* Background Shadow Fix: No scaling, fixed dimensions, centered gradient */}
                <div
                    className="absolute inset-0 w-full h-full opacity-60"
                    style={{
                        background: 'radial-gradient(circle at center, rgba(206,142,148,0.5) 0%, rgba(206,142,148,0.1) 60%, rgba(206,142,148,0) 100%)',
                        filter: 'blur(80px)',
                    }}
                />

                <div className="relative z-10 w-[680px] aspect-[1/1.35] bg-[#FEF9F9] rounded-[200px] shadow-[0_60px_120px_-30px_rgba(206,142,148,0.3)] p-24 flex flex-col items-center justify-between">
                    <div className="flex-grow flex flex-col items-center justify-between w-full bg-white rounded-[160px] p-16 shadow-inner my-6">
                        <div className="flex-1 flex flex-col items-center justify-center w-full">
                            <div className="text-[#CE8E94] mb-12">
                                {achievementTitle === 'SOLARIS' ? (
                                    <div className="scale-[4.5]">
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
                                    <div className="scale-[5]">{achievementIcon}</div>
                                )}
                            </div>
                            <div className="text-4xl font-bold tracking-[0.35em] text-[#B5838D] uppercase mb-8 text-center">
                                {achievementTitle}
                            </div>
                            <div className="text-[24px] text-gray-500 italic font-medium text-center leading-relaxed px-6">
                                {`"`}{achievementDescription}{`"`}
                            </div>
                        </div>
                        <div className="w-full h-1 bg-[#CE8E94]/10 rounded-full mb-8" />
                    </div>
                </div>
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

// HELPER COMPONENTS
interface ShareButtonProps {
    icon: React.ElementType;
    label: string;
    status: string | null;
    onClick: () => void;
    disabled: boolean;
}

const ShareButton = ({ icon: Icon, label, status, onClick, disabled }: ShareButtonProps) => {
    const isActive = status === label;
    return (
        <button
            className={`flex items-center justify-center gap-2 p-2.5 rounded-full border border-gray-100 transition-all duration-300 shadow-sm group ${isActive ? 'bg-[#CE8E94] text-white' : 'bg-white text-gray-600 hover:border-[#CE8E94]/30'} ${disabled ? 'opacity-50' : ''}`}
            onClick={onClick}
            disabled={disabled}
        >
            <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-[#CE8E94] group-hover:text-[#CE8E94]'}`} />
            <span className="text-[11px] font-bold">
                {isActive ? 'Opening...' : label}
            </span>
        </button>
    );
};

interface ActionButtonProps {
    icon: React.ElementType;
    label: string;
    status: string | null;
    activeLabel: string;
    onClick: () => void;
}

const ActionButton = ({ icon: Icon, label, status, activeLabel, onClick }: ActionButtonProps) => {
    const isActive = status === activeLabel;
    return (
        <button
            className={`flex items-center gap-2 text-[10px] transition-colors font-bold tracking-widest uppercase ${isActive ? 'text-green-500' : 'text-gray-400 hover:text-[#CE8E94]'}`}
            onClick={onClick}
            disabled={isActive}
        >
            <Icon className="w-3.5 h-3.5" />
            {isActive ? activeLabel : label}
        </button>
    );
};
