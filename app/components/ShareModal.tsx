"use client";

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Facebook, Instagram, Twitter, MessageCircle, Link, Download } from 'lucide-react';
import * as htmlToImage from 'html-to-image';


interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    achievementTitle: string;
    achievementIcon: React.ReactNode;
    achievementDescription: string;
}

export const ShareModal = ({ isOpen, onClose, achievementTitle, achievementIcon, achievementDescription }: ShareModalProps) => {
    const [actionStatus, setActionStatus] = useState<string | null>(null);

    if (!isOpen) return null;

    // Helper to generate a blob from the badge card
    const generateImageBlob = async (): Promise<Blob | null> => {
        const element = document.getElementById('share-card');
        if (!element) return null;

        try {
            // html-to-image is much better with SVGs and complex CSS
            return await htmlToImage.toBlob(element, {
                pixelRatio: 3, // High depth
                backgroundColor: '#FFF0F3',
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

    const handleAction = async (platform: string) => {
        setActionStatus('Sharing...');
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
                        alert("Görüntü indirildi. Şimdi Story kısmına bu görüntüyü ekleyebilirsiniz.");
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
            alert("Bir sorun oluştu. Lütfen tekrar deneyin.");
        }

        // Reset status
        setTimeout(() => {
            setActionStatus(null);
            if (!['Copy Link', 'Download Image'].includes(platform)) {
                onClose();
            }
        }, 2000);
    };

    return (
        <Modal onClose={onClose}>
            <div className="text-center p-2">
                <h3 className="text-2xl font-bold text-[#CE8E94] mb-2">Share Your Success</h3>
                <p className="text-gray-500 text-sm mb-6">
                    Show off your new <strong>{achievementTitle}</strong> badge to the world!
                </p>

                {/* Story-Ready Achievement Card */}
                <div className="flex justify-center mb-8">
                    <div
                        id="share-card"
                        className="relative w-[340px] aspect-[3/4.2] sm:w-[380px] flex flex-col items-center justify-between p-12 bg-gradient-to-br from-[#FFF5F7] via-[#FFFDFE] to-[#FAF6F4] rounded-[54px] shadow-2xl border border-white/40 overflow-hidden"
                    >
                        {/* Decorative Top Glow */}
                        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

                        {/* Central Card - Matches the screenshot aesthetic */}
                        <div className="relative z-10 w-full flex-grow flex flex-col items-center justify-center bg-white/90 rounded-[40px] p-10 shadow-[0_15px_35px_rgba(206,142,148,0.08)] border border-white/20 my-8">
                            {/* Achievement Icon */}
                            <div className="text-6xl mb-8 flex justify-center text-[#CE8E94] filter drop-shadow-[0_4px_8px_rgba(206,142,148,0.2)]">
                                {achievementIcon}
                            </div>

                            {/* Badge Title */}
                            <div className="text-2xl font-bold tracking-[0.2em] text-[#B5838D] uppercase mb-5 leading-none text-center">
                                {achievementTitle}
                            </div>

                            {/* Description */}
                            <div className="text-[13px] text-gray-500 italic font-medium text-center leading-relaxed px-2">
                                {`"`}{achievementDescription}{`"`}
                            </div>
                        </div>

                        {/* Branding Watermark - Bottom Centered */}
                        <div className="w-full text-center pb-2">
                            <span className="text-[11px] font-bold tracking-[0.35em] text-[#CE8E94]/50 uppercase">
                                Reformer Pilates Malta
                            </span>
                        </div>
                    </div>
                </div>

                {/* Share Actions Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        className={`flex items-center justify-center gap-2 p-4 rounded-full border border-gray-100 bg-white hover:bg-[#CE8E94] hover:text-white hover:border-[#CE8E94] transition-all duration-300 shadow-sm group ${actionStatus === 'Instagram' ? 'bg-[#CE8E94] text-white' : 'text-gray-600'}`}
                        onClick={() => handleAction('Instagram')}
                    >
                        <Instagram className={`w-5 h-5 text-[#CE8E94] group-hover:text-white ${actionStatus === 'Instagram' ? 'text-white' : ''}`} />
                        <span className="text-xs font-bold">{actionStatus === 'Instagram' ? 'Sharing...' : 'Instagram'}</span>
                    </button>

                    <button
                        className={`flex items-center justify-center gap-2 p-4 rounded-full border border-gray-100 bg-white hover:bg-[#CE8E94] hover:text-white hover:border-[#CE8E94] transition-all duration-300 shadow-sm group ${actionStatus === 'Facebook' ? 'bg-[#CE8E94] text-white' : 'text-gray-600'}`}
                        onClick={() => handleAction('Facebook')}
                    >
                        <Facebook className={`w-5 h-5 text-[#CE8E94] group-hover:text-white ${actionStatus === 'Facebook' ? 'text-white' : ''}`} />
                        <span className="text-xs font-bold">{actionStatus === 'Facebook' ? 'Sharing...' : 'Facebook'}</span>
                    </button>

                    <button
                        className={`flex items-center justify-center gap-2 p-4 rounded-full border border-gray-100 bg-white hover:bg-[#CE8E94] hover:text-white hover:border-[#CE8E94] transition-all duration-300 shadow-sm group ${actionStatus === 'WhatsApp' ? 'bg-[#CE8E94] text-white' : 'text-gray-600'}`}
                        onClick={() => handleAction('WhatsApp')}
                    >
                        <MessageCircle className={`w-5 h-5 text-[#CE8E94] group-hover:text-white ${actionStatus === 'WhatsApp' ? 'text-white' : ''}`} />
                        <span className="text-xs font-bold">{actionStatus === 'WhatsApp' ? 'Sharing...' : 'WhatsApp'}</span>
                    </button>

                    <button
                        className={`flex items-center justify-center gap-2 p-4 rounded-full border border-gray-100 bg-white hover:bg-[#CE8E94] hover:text-white hover:border-[#CE8E94] transition-all duration-300 shadow-sm group ${actionStatus === 'X' ? 'bg-[#CE8E94] text-white' : 'text-gray-600'}`}
                        onClick={() => handleAction('X')}
                    >
                        <Twitter className={`w-5 h-5 text-[#CE8E94] group-hover:text-white ${actionStatus === 'X' ? 'text-white' : ''}`} />
                        <span className="text-xs font-bold">{actionStatus === 'X' ? 'Sharing...' : 'X'}</span>
                    </button>
                </div>

                {/* Secondary Actions */}
                <div className="flex justify-center gap-8">
                    <button
                        className={`flex items-center gap-2 text-[11px] transition-colors font-bold tracking-wider uppercase ${actionStatus === 'Copied!' ? 'text-green-500' : 'text-gray-400 hover:text-[#CE8E94]'}`}
                        onClick={() => handleAction('Copy Link')}
                        disabled={actionStatus === 'Copied!'}
                    >
                        <Link className="w-3.5 h-3.5" /> {actionStatus === 'Copied!' ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button
                        className={`flex items-center gap-2 text-[11px] transition-colors font-bold tracking-wider uppercase ${actionStatus === 'Saved!' ? 'text-green-500' : 'text-gray-400 hover:text-[#CE8E94]'}`}
                        onClick={() => handleAction('Download Image')}
                        disabled={actionStatus === 'Saved!'}
                    >
                        <Download className="w-3.5 h-3.5" /> {actionStatus === 'Saved!' ? 'Saved!' : 'Save Image'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
