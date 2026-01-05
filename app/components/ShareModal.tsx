import React, { useState } from 'react';
import { Modal } from './Modal';
import * as htmlToImage from 'html-to-image';
import { Instagram, Facebook, MessageCircle, Twitter, Link, Download } from 'lucide-react';
import { AlertModal } from './AlertModal';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    achievementTitle: string; // e.g. "NOVA", "SEED"
    achievementIcon: React.ReactNode;
    achievementDescription: string;
}

// ---------------------------------------------------------------------------
// THEME CONFIGURATION (Colors based on User's Screenshots)
// ---------------------------------------------------------------------------
const LEVEL_THEMES: Record<string, { bg: string; card: string; text: string; accent: string; sub: string }> = {
    'NOVA': {
        bg: 'bg-[#EBC2C6]',        // Koyu Gül Kurusu (Arka Plan)
        card: 'bg-[#FDF2F4]',      // Açık Pembe (Kart)
        text: 'text-[#CE8E94]',    // Gül Kurusu (Yazılar)
        accent: 'text-[#CE8E94]',  // İkon Rengi
        sub: 'text-[#B5838D]'       // Alt Yazı
    },
    'SEED': {
        bg: 'bg-[#FBECE3]',        // Şeftali/Bej (Arka Plan)
        card: 'bg-[#FFFFFF]',      // Beyaz (Kart)
        text: 'text-[#C59D90]',    // Toprak/Kiremit (Yazılar)
        accent: 'text-[#C59D90]',  // İkon Rengi
        sub: 'text-[#A87B62]'       // Alt Yazı
    },
    // Default fallback
    'DEFAULT': {
        bg: 'bg-[#EBC2C6]',
        card: 'bg-[#FDF2F4]',
        text: 'text-[#CE8E94]',
        accent: 'text-[#CE8E94]',
        sub: 'text-[#B5838D]'
    }
};

export const ShareModal: React.FC<ShareModalProps> = ({
    isOpen,
    onClose,
    achievementTitle,
    achievementIcon,
    achievementDescription
}) => {
    const [actionStatus, setActionStatus] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'success'
    });

    // Determine current theme
    const theme = LEVEL_THEMES[achievementTitle.toUpperCase()] || LEVEL_THEMES['DEFAULT'];

    const generateImageBlob = async (): Promise<Blob | null> => {
        const node = document.getElementById('capture-container');
        if (!node) return null;

        try {
            // Force 1080x1920 generation
            const dataUrl = await htmlToImage.toPng(node, {
                canvasWidth: 1080,
                canvasHeight: 1920,
                pixelRatio: 1, // Exact dimensions
                style: {
                    transform: 'none', // Reset preview transforms
                }
            });
            const res = await fetch(dataUrl);
            return await res.blob();
        } catch (error) {
            console.error('Image generation failed', error);
            return null;
        }
    };

    const handleAction = async (action: string) => {
        if (isGenerating) return;
        setIsGenerating(true);
        setActionStatus(action);

        try {
            const blob = await generateImageBlob();
            if (!blob) throw new Error('Image generation failed');

            const file = new File([blob], `pilates-journey-${achievementTitle.toLowerCase()}.png`, { type: 'image/png' });

            if (action === 'Instagram' || action === 'Facebook' || action === 'WhatsApp' || action === 'X') {
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'My Pilates Journey',
                        text: `I just reached ${achievementTitle} level!`,
                    });
                } else {
                    // Fallback: Download + Alert
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = file.name;
                    a.click();
                    URL.revokeObjectURL(url);
                    setAlertConfig({
                        isOpen: true,
                        title: 'Saved to Gallery',
                        message: `Image saved! You can now share it on ${action}.`,
                        type: 'success'
                    });
                }
            } else if (action === 'Download Image') {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = file.name;
                a.click();
                URL.revokeObjectURL(url);
                setActionStatus('Saved!');
                setTimeout(() => setActionStatus(null), 2000);
            } else if (action === 'Copy Link') {
                await navigator.clipboard.writeText('https://omeryigitler.github.io/pilates-app/');
                setActionStatus('Copied!');
                setTimeout(() => setActionStatus(null), 2000);
            }
        } catch (error) {
            setAlertConfig({
                isOpen: true,
                title: 'Error',
                message: 'Something went wrong while generating the image.',
                type: 'error'
            });
            setActionStatus(null);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    // ---------------------------------------------------------------------------
    // RENDER: VISUAL COMPONENT (Shared by Preview & Capture)
    // ---------------------------------------------------------------------------
    const renderContent = (isCapture: boolean) => (
        <div className={`relative flex flex-col items-center justify-center font-sans overflow-hidden ${theme.bg} ${isCapture ? 'w-[1080px] h-[1920px]' : 'w-full h-full'}`}>

            {/* --- VISUAL DECORATIONS (MIMIC 15:23 DESIGN) --- */}

            {/* Top Soft Glow/Gradient Overlay */}
            <div className={`absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none ${isCapture ? 'opacity-100' : 'opacity-50'}`} />

            {/* CENTER OVAL CARD or CONTENT WRAPPER */}
            {/* Using scale-[2.5] directly on the wrapper in 'capture' mode to match 15:23 proportions exactly */}
            <div className={`relative flex flex-col items-center justify-center ${isCapture ? 'transform scale-[2.5]' : 'transform scale-100'}`}>

                {/* THE CARD ITSELF */}
                <div className={`relative flex flex-col items-center justify-center rounded-[40px] ${theme.card} shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/50 w-[260px] py-12 px-6`}>

                    {/* ICON & STAR GROUP */}
                    <div className={`flex flex-col items-center`}>
                        {/* Top Icon (Dynamic from Props) */}
                        <div className={`${theme.accent} text-5xl mb-4 drop-shadow-sm`}>
                            {achievementIcon}
                        </div>

                        {/* Main Title (LEVEL) */}
                        <div className={`font-bold uppercase tracking-[0.25em] leading-none text-center ${theme.text} text-2xl mb-3`}>
                            {achievementTitle}
                        </div>

                        {/* Quote / Subtitle */}
                        <div className={`italic font-medium text-center opacity-80 ${theme.text} text-[10px] leading-relaxed max-w-[140px]`}>
                            &quot;{achievementDescription}&quot;
                        </div>

                        {/* Bottom Eye Icon (SVG) */}
                        <div className={`${theme.accent} w-8 h-8 mt-6 opacity-60`}>
                            <svg viewBox="0 0 100 80" fill="none" stroke="currentColor" strokeWidth="6">
                                <path d="M10 55C10 55 25 35 50 35C75 35 90 55 90 55C90 55 75 75 50 75C25 75 10 55 10 55Z" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="50" cy="55" r="10" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Bottom Text (Outside Card) */}
                <div className={`text-center font-medium italic opacity-70 ${theme.sub} text-xs tracking-wider mt-12 max-w-[200px]`}>
                    Your {achievementTitle.toLowerCase()} journey begins.
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* --- HIDDEN CAPTURE CONTAINER (High Res) --- */}
            <div
                id="capture-container"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: -1,
                    opacity: 0,
                    pointerEvents: 'none',
                    // Move far away
                    transform: 'translateX(-9999px)'
                }}
            >
                {renderContent(true)}
            </div>

            {/* --- VISIBLE MODAL UI --- */}
            <Modal onClose={onClose}>
                <div className="p-4 bg-white rounded-3xl w-full max-w-sm mx-auto overflow-hidden">
                    {/* Header */}
                    <div className="text-center pt-4 pb-2">
                        <h2 className="text-2xl font-bold text-[#CE8E94] mb-1">Share Your Success</h2>
                        <p className="text-xs text-gray-400">
                            Show off your new <span className="font-bold text-gray-500 uppercase">{achievementTitle}</span> badge to the world!
                        </p>
                    </div>

                    {/* PREVIEW CARD AREA */}
                    <div className="relative w-full aspect-[9/16] my-4 rounded-xl overflow-hidden shadow-inner bg-gray-50">
                        {renderContent(false)}
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
            </Modal>
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
