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
            // Wait to ensure everything is rendered
            await new Promise(resolve => setTimeout(resolve, 200));
            return await htmlToImage.toBlob(element, {
                pixelRatio: 1,
                backgroundColor: '#FFF0E5',
                cacheBust: true,
                width: 1080,
                height: 1920
            });
        } catch (err) {
            console.error('Image generation failed:', err);
            return null;
        }
    };

    // UNIFIED DESIGN FUNCTION (Ensures Preview and Export are identical)
    const renderDesign = (isCapture: boolean) => (
        <div
            id={isCapture ? "capture-container" : undefined}
            className="relative w-[1080px] h-[1920px] bg-[#FFF0E5] flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Professional Background Glow (Story Style) */}
            <div
                className="absolute inset-0 w-full h-full opacity-60"
                style={{
                    background: 'radial-gradient(circle at center, rgba(206,142,148,0.5) 0%, rgba(206,142,148,0.1) 60%, rgba(206,142,148,0) 100%)',
                    filter: 'blur(80px)',
                    zIndex: 0
                }}
            />

            {/* Centered Achievement Card ( with drop-shadow fix ) */}
            <div
                style={{
                    width: '680px',
                    aspectRatio: '1/1.35',
                    backgroundColor: '#FEF9F9',
                    borderRadius: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    position: 'relative',
                    zIndex: 10,
                    filter: 'drop-shadow(0 40px 60px rgba(206,142,148,0.25))'
                }}
            >
                {/* Inner Card */}
                <div style={{
                    width: '100%',
                    flex: 1,
                    backgroundColor: 'white',
                    borderRadius: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '64px',
                    filter: 'drop-shadow(0 20px 30px rgba(206,142,148,0.12))',
                    margin: '24px 0'
                }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                        <div style={{ fontSize: '120px', color: '#CE8E94', marginBottom: '48px', display: 'flex', justifyContent: 'center' }}>
                            {achievementTitle === 'SOLARIS' ? (
                                <svg viewBox="0 0 100 100" style={{ width: '130px', height: '130px' }} fill="none" xmlns="http://www.w3.org/2000/svg">
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
                        <div style={{ fontSize: '48px', fontWeight: 'bold', letterSpacing: '0.35em', color: '#B5838D', textTransform: 'uppercase', textAlign: 'center', marginBottom: '32px', lineHeight: '1.1' }}>
                            {achievementTitle}
                        </div>
                        <div style={{ fontSize: '30px', color: '#9CA3AF', fontStyle: 'italic', fontWeight: '500', textAlign: 'center', padding: '0 32px', lineHeight: '1.6' }}>
                            &quot;{achievementDescription}&quot;
                        </div>
                    </div>

                    {/* Branding Watermark */}
                    <div style={{ width: '160px', height: '160px', color: 'rgba(206,142,148,0.45)', paddingBottom: '32px' }}>
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
    );

    // Pre-generate the blob as soon as the modal opens
    React.useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(async () => {
                if (isGeneratingRef.current) return;
                isGeneratingRef.current = true;
                const blob = await generateImageBlob();
                if (blob) setPreGeneratedBlob(blob);
                isGeneratingRef.current = false;
            }, 600); // Wait longer for all assets to load
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

        if (platform === 'Copy Link') {
            try {
                await navigator.clipboard.writeText(`${text} ${url}`);
                setActionStatus('Copied!');
            } catch (err) {
                console.error('Clipboard failed', err);
            }
            setTimeout(() => setActionStatus(null), 800);
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

            if (!blob) throw new Error('Could not generate image');

            if (platform === 'Download Image') {
                triggerDownload(blob, filename);
                setActionStatus('Saved!');
            } else {
                const file = new File([blob], filename, { type: 'image/png' });
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: achievementTitle,
                            text: text,
                        });
                        setActionStatus('Done');
                    } catch (shareErr) {
                        console.log('Share canceled or failed', shareErr);
                        setActionStatus(null);
                    }
                } else {
                    if (platform === 'Facebook') {
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                    } else if (platform === 'WhatsApp') {
                        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank', 'noopener,noreferrer');
                    } else if (platform === 'X') {
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
                    } else if (platform === 'Instagram') {
                        window.open('https://instagram.com', '_blank', 'noopener,noreferrer');
                    }
                    setActionStatus('Done');
                }
            }
        } catch (err) {
            console.error('Action failed:', err);
            setActionStatus(null);
        } finally {
            setIsGenerating(false);
            isGeneratingRef.current = false;
            setTimeout(() => setActionStatus(null), 1000);
        }
    };

    return (
        <>
            <Modal onClose={onClose} className="max-w-xl">
                <div className="text-center p-6 pt-8 overflow-hidden">
                    <h3 className="text-xl font-bold text-[#CE8E94] mb-0.5 tracking-tight">Share Your Success</h3>
                    <p className="text-gray-400 text-[12px] mb-3">
                        Show off your new <strong>{achievementTitle}</strong> badge to the world!
                    </p>

                    {/* STORY PREVIEW (User sees this) */}
                    <div className="flex justify-center mb-1 overflow-hidden w-full h-[450px] sm:h-[620px] relative">
                        <div className="scale-[0.22] min-[400px]:scale-[0.24] sm:scale-[0.32] origin-top flex-shrink-0">
                            {renderDesign(false)}
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

            {/* PERSISTENT OFF-SCREEN CAPTURE AREA (Hidden but rendered) */}
            <div style={{ position: 'fixed', top: '-10000px', left: 0, zIndex: -9999, pointerEvents: 'none' }}>
                {renderDesign(true)}
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

