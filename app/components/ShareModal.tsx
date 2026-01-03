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

    // Helper to generate a blob from the badge card
    const generateImageBlob = async (): Promise<Blob | null> => {
        const element = document.getElementById('share-card');
        if (!element) return null;

        try {
            // html-to-image is much better with SVGs and complex CSS
            return await htmlToImage.toBlob(element, {
                pixelRatio: 3, // High depth
                backgroundColor: '#FFF5F7',
            });
        } catch (err) {
            console.error('Image generation failed:', err);
            return null;
        }
    };

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

    const showAlert = (title: string, message: string, type: 'info' | 'success' | 'error' = 'info') => {
        setAlertConfig({ isOpen: true, title, message, type });
    };

    const handleAction = async (platform: string) => {
        setActionStatus(platform);
        const text = `I just unlocked the ${achievementTitle} badge on Reformer Pilates Malta! 🏆`;
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const filename = `pilates-badge-${achievementTitle.toLowerCase().replace(/\s+/g, '-')}.png`;

        try {
            if (platform === 'Copy Link') {
                await navigator.clipboard.writeText(`${text} ${url}`);
                setActionStatus('Copied!');
            }
            else {
                // Generate the image
                const blob = await generateImageBlob();

                if (platform === 'Download Image') {
                    if (blob) {
                        triggerDownload(blob, filename);
                        setActionStatus('Saved!');
                    } else {
                        throw new Error('Image generation failed');
                    }
                }
                else {
                    // Try Native Sharing (The closest to "Automatic" on Mobile)
                    if (blob && navigator.share) {
                        const file = new File([blob], filename, { type: 'image/png' });
                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                            try {
                                await navigator.share({
                                    files: [file],
                                    title: achievementTitle,
                                    text: text,
                                });
                                setActionStatus('Shared!');
                                return;
                            } catch (shareErr) {
                                console.log('Share canceled or failed', shareErr);
                            }
                        }
                    }

                    // Fallback: Download the image and open the link
                    if (blob) {
                        triggerDownload(blob, filename);
                        showAlert(
                            "Paylaşıma Hazır!",
                            "Görüntü telefonunuza indirildi. Şimdi Story kısmına bu görüntüyü ekleyerek paylaşabilirsiniz.",
                            "success"
                        );
                    }

                    if (platform === 'Facebook') {
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
                    } else if (platform === 'Instagram') {
                        window.open('https://instagram.com', '_blank');
                    } else if (platform === 'WhatsApp') {
                        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                    } else if (platform === 'X') {
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                    }
                    setActionStatus('Opened');
                }
            }
        } catch (err) {
            console.error('Action failed:', err);
            setActionStatus('Error');
            showAlert("Hata", "Bir sorun oluştu. Lütfen tekrar deneyin.", "error");
        }

        // Reset status
        setTimeout(() => {
            if (platform !== 'Download Image' && platform !== 'Copy Link') {
                setActionStatus(null);
                // Don't close modal if alert is open
            } else {
                setTimeout(() => setActionStatus(null), 2000);
            }
        }, 1000);
    };

    return (
        <>
            <Modal onClose={onClose} className="max-w-[440px]">
                <div className="text-center">
                    <h3 className="text-xl font-bold text-[#CE8E94] mb-1">Share Your Success</h3>
                    <p className="text-gray-400 text-[13px] mb-6">
                        Show off your new <strong>{achievementTitle}</strong> badge to the world!
                    </p>

                    {/* Story-Ready Achievement Card */}
                    <div className="flex justify-center mb-6">
                        <div
                            id="share-card"
                            className="relative w-[280px] aspect-[3/4.2] flex flex-col items-center justify-between p-10 bg-gradient-to-br from-[#FFF5F7] via-[#FFFDFE] to-[#FAF6F4] rounded-[48px] shadow-xl border border-white/40 overflow-hidden"
                        >
                            {/* Decorative Top Glow */}
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

                            {/* Central Card - Matches the screenshot aesthetic */}
                            <div className="relative z-10 w-full flex-grow flex flex-col items-center justify-center bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(206,142,148,0.12)] border border-white/20 my-6">
                                {/* Achievement Icon */}
                                <div className="text-5xl mb-6 flex justify-center text-[#CE8E94] filter drop-shadow-[0_4px_8px_rgba(206,142,148,0.2)]">
                                    {achievementIcon}
                                </div>

                                {/* Badge Title */}
                                <div className="text-xl font-bold tracking-[0.2em] text-[#B5838D] uppercase mb-4 leading-none text-center">
                                    {achievementTitle}
                                </div>

                                {/* Description */}
                                <div className="text-[11px] text-gray-500 italic font-medium text-center leading-relaxed px-1">
                                    {`"`}{achievementDescription}{`"`}
                                </div>
                            </div>

                            {/* Branding Watermark - Bottom Centered */}
                            <div className="w-full text-center pb-1">
                                <span className="text-[10px] font-bold tracking-[0.3em] text-[#CE8E94]/40 uppercase">
                                    Reformer Pilates Malta
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Share Actions Grid */}
                    <div className="grid grid-cols-2 gap-2.5 mb-6">
                        <button
                            className={`flex items-center justify-center gap-2.5 p-3 rounded-full border border-gray-100 bg-white hover:bg-[#CE8E94] hover:text-white transition-all duration-300 shadow-sm group ${actionStatus === 'Instagram' ? 'bg-[#CE8E94] text-white' : 'text-gray-600'}`}
                            onClick={() => handleAction('Instagram')}
                        >
                            <Instagram className={`w-4 h-4 text-[#CE8E94] group-hover:text-white ${actionStatus === 'Instagram' ? 'text-white' : ''}`} />
                            <span className="text-[11px] font-bold">{actionStatus === 'Instagram' ? 'Oluşturuluyor' : 'Instagram'}</span>
                        </button>

                        <button
                            className={`flex items-center justify-center gap-2.5 p-3 rounded-full border border-gray-100 bg-white hover:bg-[#CE8E94] hover:text-white transition-all duration-300 shadow-sm group ${actionStatus === 'Facebook' ? 'bg-[#CE8E94] text-white' : 'text-gray-600'}`}
                            onClick={() => handleAction('Facebook')}
                        >
                            <Facebook className={`w-4 h-4 text-[#CE8E94] group-hover:text-white ${actionStatus === 'Facebook' ? 'text-white' : ''}`} />
                            <span className="text-[11px] font-bold">{actionStatus === 'Facebook' ? 'Oluşturuluyor' : 'Facebook'}</span>
                        </button>

                        <button
                            className={`flex items-center justify-center gap-2.5 p-3 rounded-full border border-gray-100 bg-white hover:bg-[#CE8E94] hover:text-white transition-all duration-300 shadow-sm group ${actionStatus === 'WhatsApp' ? 'bg-[#CE8E94] text-white' : 'text-gray-600'}`}
                            onClick={() => handleAction('WhatsApp')}
                        >
                            <MessageCircle className={`w-4 h-4 text-[#CE8E94] group-hover:text-white ${actionStatus === 'WhatsApp' ? 'text-white' : ''}`} />
                            <span className="text-[11px] font-bold">{actionStatus === 'WhatsApp' ? 'Oluşturuluyor' : 'WhatsApp'}</span>
                        </button>

                        <button
                            className={`flex items-center justify-center gap-2.5 p-3 rounded-full border border-gray-100 bg-white hover:bg-[#CE8E94] hover:text-white transition-all duration-300 shadow-sm group ${actionStatus === 'X' ? 'bg-[#CE8E94] text-white' : 'text-gray-600'}`}
                            onClick={() => handleAction('X')}
                        >
                            <Twitter className={`w-4 h-4 text-[#CE8E94] group-hover:text-white ${actionStatus === 'X' ? 'text-white' : ''}`} />
                            <span className="text-[11px] font-bold">{actionStatus === 'X' ? 'Oluşturuluyor' : 'X'}</span>
                        </button>
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex justify-center gap-8 pt-2">
                        <button
                            className={`flex items-center gap-2 text-[10px] transition-colors font-bold tracking-widest uppercase ${actionStatus === 'Copied!' ? 'text-green-500' : 'text-gray-400 hover:text-[#CE8E94]'}`}
                            onClick={() => handleAction('Copy Link')}
                            disabled={actionStatus === 'Copied!'}
                        >
                            <Link className="w-3.5 h-3.5" /> {actionStatus === 'Copied!' ? 'Link Kopyalandı!' : 'Link Kopyala'}
                        </button>
                        <button
                            className={`flex items-center gap-2 text-[10px] transition-colors font-bold tracking-widest uppercase ${actionStatus === 'Saved!' ? 'text-green-500' : 'text-gray-400 hover:text-[#CE8E94]'}`}
                            onClick={() => handleAction('Download Image')}
                            disabled={actionStatus === 'Saved!'}
                        >
                            <Download className="w-3.5 h-3.5" /> {actionStatus === 'Saved!' ? 'Kaydedildi!' : 'Görseli Kaydet'}
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
