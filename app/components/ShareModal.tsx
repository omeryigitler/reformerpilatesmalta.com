"use client";

import React, { useState } from 'react';
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
    const [actionInProgress, setActionInProgress] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
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

    if (!isOpen) return null;

    // Faster conversion without fetch
    const dataURLtoBlob = (dataurl: string) => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)![1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };

    // Helper to generate a data URL (Base64)
    const generateImageDataUrl = async (): Promise<string | null> => {
        const element = document.getElementById('capture-container');
        if (!element) return null;

        try {
            // Minimal delay for styles
            await new Promise(resolve => setTimeout(resolve, 50));
            return await htmlToImage.toPng(element, {
                pixelRatio: 2,
                backgroundColor: '#FFFFFF',
                cacheBust: true,
                skipFonts: false,
            });
        } catch (err) {
            console.error('Image generation failed:', err);
            return null;
        }
    };

    const showAlert = (title: string, message: string, type: 'info' | 'success' | 'error' = 'info') => {
        setAlertConfig({ isOpen: true, title, message, type });
    };

    const handleAction = async (platform: string) => {
        if (isGenerating || actionInProgress) return;

        setActionInProgress(true);
        setActionStatus(platform);
        const text = `I just unlocked the ${achievementTitle} badge on Reformer Pilates Malta! 🏆`;
        const url = typeof window !== 'undefined' ? window.location.origin : '';
        const filename = `pilates-badge-${achievementTitle.toLowerCase().replace(/\s+/g, '-')}.png`;

        try {
            if (platform === 'Copy Link') {
                const shareText = `${text} ${url}`;
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(shareText);
                    setActionStatus('Copied!');
                } else {
                    // Fallback for older browsers
                    const textArea = document.createElement("textarea");
                    textArea.value = shareText;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    setActionStatus('Copied!');
                }
                setTimeout(() => {
                    setActionInProgress(false);
                    setTimeout(() => setActionStatus(null), 2000);
                }, 500);
                return;
            }

            setIsGenerating(true);
            const dataUrl = await generateImageDataUrl();
            setIsGenerating(false);

            if (!dataUrl) {
                showAlert("Hata", "Görsel hazırlanırken sorun oluştu. Lütfen cihazınızın belleğini kontrol edip tekrar deneyin.", "error");
                setActionInProgress(false);
                setActionStatus(null);
                return;
            }

            // --- DOWNLOAD CASE ---
            if (platform === 'Download Image') {
                const link = document.createElement('a');
                link.download = filename;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();

                setTimeout(() => {
                    if (document.body.contains(link)) document.body.removeChild(link);
                    setActionStatus('Saved!');
                    setActionInProgress(false);
                    setTimeout(() => setActionStatus(null), 2000);
                }, 200);
                return;
            }

            // --- SHARING CASE ---
            try {
                const blob = dataURLtoBlob(dataUrl);
                const file = new File([blob], filename, { type: 'image/png' });

                // 1. Try Native Sharing (Recommended for Instagram/WhatsApp/Safari/Chrome Mobile)
                if (navigator.share && navigator.canShare?.({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Pilates Başarısı',
                        text: text,
                    });
                    setActionStatus('Done');
                    setActionInProgress(false);
                    onClose(); // Close modal on successful native share
                    return;
                }
            } catch (shareErr) {
                console.log('Native share failed or canceled', shareErr);
                // Continue to fallbacks if canceled
            }

            // 2. Fallbacks for Desktop
            if (platform === 'Instagram') {
                // Removed automatic download as requested by the user
                showAlert("Paylaşıma Hazır", "Görseli 'Save Image' butonu ile kaydedebilir ve ardından Instagram'da paylaşabilirsiniz.", "info");
                window.open('https://instagram.com', '_blank', 'noopener,noreferrer');
            }
            else if (platform === 'Facebook') {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'popup,width=600,height=400');
            }
            else if (platform === 'WhatsApp') {
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
            }
            else if (platform === 'X') {
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
            }

            setActionStatus('Done');
            setActionInProgress(false);
            // Don't close modal automatically on web fallbacks so user can see instructions/status
            setTimeout(() => setActionStatus(null), 3000);

        } catch (err) {
            console.error('Action failed:', err);
            setIsGenerating(false);
            setActionInProgress(false);
            setActionStatus('Error');
            showAlert("İşlem Başarısız", "Görsel çok büyük olabilir veya tarayıcınız bu işlemi şu an desteklemiyor. Lütfen İndir (Save Image) butonunu deneyin.", "error");
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

                    {/* Story-Ready Achievement Card */}
                    <div className="flex justify-center mb-1 overflow-hidden w-full h-[320px] sm:h-[580px]">
                        {/* Scaling wrapper to fit the 480px container into the narrower Modal/Phone screen */}
                        <div className="scale-[0.58] min-[400px]:scale-[0.65] sm:scale-[0.9] origin-top flex-shrink-0">
                            <div id="capture-container" className="p-[80px] bg-white rounded-[40px] flex-shrink-0 w-[480px]">
                                <div
                                    id="share-card"
                                    className="relative w-[320px] aspect-[1/1.35] flex flex-col items-center justify-between p-12 bg-[#FEF9F9] rounded-[100px] shadow-[0_45px_100px_-30px_rgba(206,142,148,0.25)] overflow-hidden"
                                >
                                    {/* Inner Card - Matches the 'Solaris' reference aesthetic */}
                                    <div className="relative z-10 w-full flex-grow flex flex-col items-center justify-between bg-white rounded-[80px] p-8 shadow-[0_40px_80px_-15px_rgba(206,142,148,0.22)] my-3">
                                        {/* Achievement Icon Area - Centered for mobile feel */}
                                        <div className="flex-1 flex flex-col items-center justify-center w-full">
                                            <div className="text-5xl flex justify-center text-[#CE8E94] filter drop-shadow-[0_4px_8px_rgba(206,142,148,0.12)] mb-4">
                                                {achievementTitle === 'SOLARIS' ? (
                                                    <svg viewBox="0 0 100 100" className="w-16 h-16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        {/* Center Circle */}
                                                        <circle cx="50" cy="50" r="12" stroke="currentColor" strokeWidth="2.5" />
                                                        {/* 8 Thin Rays */}
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

                                            {/* Badge Title - Pixel Perfect spacing */}
                                            <div className="text-xl font-bold tracking-[0.35em] text-[#B5838D] uppercase mb-4 leading-none text-center">
                                                {achievementTitle}
                                            </div>

                                            {/* Description */}
                                            <div className="text-[11.5px] text-gray-500 italic font-medium text-center leading-relaxed px-1">
                                                {`"`}{achievementDescription}{`"`}
                                            </div>
                                        </div>

                                        {/* Branding Watermark - Bottom Centered (Custom Eye Logo) */}
                                        <div className="w-full flex justify-center pb-8">
                                            <div className="w-20 h-20 text-[#CE8E94]/45">
                                                <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    {/* Five Rays */}
                                                    <line x1="50" y1="15" x2="50" y2="0" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                                    <line x1="28" y1="22" x2="18" y2="8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                                    <line x1="72" y1="22" x2="82" y2="8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                                    <line x1="12" y1="38" x2="0" y2="30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                                    <line x1="88" y1="38" x2="100" y2="30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />

                                                    {/* Eye Shape */}
                                                    <path d="M10 55C10 55 25 35 50 35C75 35 90 55 90 55C90 55 75 75 50 75C25 75 10 55 10 55Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                                                    {/* Pupil */}
                                                    <circle cx="50" cy="55" r="10" stroke="currentColor" strokeWidth="4" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Share Actions Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3 px-4">
                        <button
                            className={`flex items-center justify-center gap-2 p-2 rounded-full border border-gray-100 bg-white hover:bg-[#CE8E94] hover:text-white transition-all duration-300 shadow-sm group ${actionStatus === 'Instagram' ? 'bg-[#CE8E94] text-white' : 'text-gray-600'} ${isGenerating ? 'opacity-50' : ''}`}
                            onClick={() => handleAction('Instagram')}
                            disabled={isGenerating}
                        >
                            <Instagram className={`w-4 h-4 text-[#CE8E94] group-hover:text-white ${actionStatus === 'Instagram' ? 'text-white' : ''}`} />
                            <span className="text-[11px] font-bold text-nowrap">
                                {isGenerating && actionStatus === 'Instagram' ? 'Sharing...' : (actionStatus === 'Instagram' ? 'Done' : 'Instagram')}
                            </span>
                        </button>

                        <button
                            className={`flex items-center justify-center gap-2 p-2 rounded-full border border-gray-100 bg-white hover:bg-[#CE8E94] hover:text-white transition-all duration-300 shadow-sm group ${actionStatus === 'Facebook' ? 'bg-[#CE8E94] text-white' : 'text-gray-600'} ${isGenerating ? 'opacity-50' : ''}`}
                            onClick={() => handleAction('Facebook')}
                            disabled={isGenerating}
                        >
                            <Facebook className={`w-4 h-4 text-[#CE8E94] group-hover:text-white ${actionStatus === 'Facebook' ? 'text-white' : ''}`} />
                            <span className="text-[11px] font-bold text-nowrap">
                                {isGenerating && actionStatus === 'Facebook' ? 'Sharing...' : (actionStatus === 'Facebook' ? 'Done' : 'Facebook')}
                            </span>
                        </button>

                        <button
                            className={`flex items-center justify-center gap-2 p-2 rounded-full border border-gray-100 bg-white hover:bg-[#CE8E94] hover:text-white transition-all duration-300 shadow-sm group ${actionStatus === 'WhatsApp' ? 'bg-[#CE8E94] text-white' : 'text-gray-600'} ${isGenerating ? 'opacity-50' : ''}`}
                            onClick={() => handleAction('WhatsApp')}
                            disabled={isGenerating}
                        >
                            <MessageCircle className={`w-4 h-4 text-[#CE8E94] group-hover:text-white ${actionStatus === 'WhatsApp' ? 'text-white' : ''}`} />
                            <span className="text-[11px] font-bold text-nowrap">
                                {isGenerating && actionStatus === 'WhatsApp' ? 'Sharing...' : (actionStatus === 'WhatsApp' ? 'Done' : 'WhatsApp')}
                            </span>
                        </button>

                        <button
                            className={`flex items-center justify-center gap-2 p-2 rounded-full border border-gray-100 bg-white hover:bg-[#CE8E94] hover:text-white transition-all duration-300 shadow-sm group ${actionStatus === 'X' ? 'bg-[#CE8E94] text-white' : 'text-gray-600'} ${isGenerating ? 'opacity-50' : ''}`}
                            onClick={() => handleAction('X')}
                            disabled={isGenerating}
                        >
                            <Twitter className={`w-4 h-4 text-[#CE8E94] group-hover:text-white ${actionStatus === 'X' ? 'text-white' : ''}`} />
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
