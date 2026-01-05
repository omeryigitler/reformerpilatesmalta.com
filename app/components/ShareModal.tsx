"use client";

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Facebook, Instagram, Twitter, MessageCircle, Link, Download } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { shareBackgroundBase64 } from '@/app/data/shareBackgroundBase64';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    achievementTitle: string;
    achievementIcon: React.ReactNode;
    achievementDescription: string;
}

export const ShareModal = ({ isOpen, onClose, achievementTitle, achievementIcon, achievementDescription }: ShareModalProps) => {
    const [actionStatus, setActionStatus] = useState<string | null>(null);

    // If not open, don't render anything
    if (!isOpen) return null;

    const generateImageBlob = async (): Promise<Blob | null> => {
        // Target the hidden high-res container
        const element = document.getElementById('capture-container');
        if (!element) return null;

        try {
            // Small delay to ensure rendering artifacts are cleared if any
            await new Promise(resolve => setTimeout(resolve, 100));

            return await htmlToImage.toBlob(element, {
                pixelRatio: 1, // 1:1 since the container is already 1080x1920
                style: { transform: 'scale(1)' },
                backgroundColor: '#FFF0E5',
                width: 1080,
                height: 1920
            });
        } catch (err) {
            console.error('Image generation failed:', err);
            return null;
        }
    };

    const handleAction = async (platform: string) => {
        setActionStatus(platform);

        const text = `I just unlocked the ${achievementTitle} badge on Reformer Pilates Malta! 🏆`;
        const url = typeof window !== 'undefined' ? window.location.href : '';

        // Generate image if needed for download or share
        if (platform === 'Download Image' || platform === 'Instagram') {
            const blob = await generateImageBlob();
            if (blob) {
                if (platform === 'Download Image') {
                    const link = document.createElement('a');
                    link.download = `pilates-achievement-${Date.now()}.png`;
                    link.href = URL.createObjectURL(blob);
                    link.click();
                } else if (platform === 'Instagram' && navigator.share && navigator.canShare) {
                    const file = new File([blob], 'pilates-story.png', { type: 'image/png' });
                    if (navigator.canShare({ files: [file] })) {
                        try {
                            await navigator.share({
                                files: [file],
                                title: 'Share Achievement',
                                text: text
                            });
                        } catch (err) {
                            console.error('Share failed:', err);
                            window.open('https://instagram.com', '_blank');
                        }
                    } else {
                        window.open('https://instagram.com', '_blank');
                    }
                } else {
                    window.open('https://instagram.com', '_blank');
                }
            } else {
                // If blob generation failed, fallback
                if (platform === 'Instagram') window.open('https://instagram.com', '_blank');
            }
        } else {
            setTimeout(() => {
                if (platform === 'Facebook') {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
                } else if (platform === 'WhatsApp') {
                    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                } else if (platform === 'X') {
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                } else if (platform === 'Copy Link') {
                    navigator.clipboard.writeText(`${text} ${url}`);
                }
            }, 500);
        }

        // Reset status
        setTimeout(() => {
            setActionStatus(null);
            if (platform !== 'Copy Link' && platform !== 'Download Image') {
                onClose();
            }
        }, 1500);
    };

    return (
        <Modal onClose={onClose}>
            <div className="text-center">
                <div className="flex justify-between items-center mb-2">
                    <div></div>
                </div>

                <h3 className="text-2xl font-bold text-[#CE8E94] mb-2">Share Your Success</h3>
                <p className="text-gray-500 text-sm mb-6">
                    Show off your new <strong>{achievementTitle}</strong> badge to the world!
                </p>

                {/* --- VISIBLE PREVIEW CARD (User Sees This) --- */}
                {/* Clean CSS representation without the scaling hacks causing glitches */}
                <div className="relative w-full max-w-[320px] mx-auto aspect-[9/16] rounded-xl overflow-hidden shadow-lg mb-8 border border-gray-100">
                    <img
                        src={shareBackgroundBase64}
                        alt="Background"
                        className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                    <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
                        <div className="text-6xl mb-6 text-[#CE8E94] drop-shadow-sm">
                            {achievementIcon}
                        </div>
                        <div className="text-xl font-bold tracking-widest text-[#B5838D] uppercase mb-3">
                            {achievementTitle}
                        </div>
                        <div className="text-xs text-gray-500 italic font-medium max-w-[200px]">
                            {achievementDescription}
                        </div>
                    </div>
                </div>

                {/* --- HIDDEN HIGH-RES CAPTURE CONTAINER (System Uses This) --- */}
                {/* Strictly 1080x1920, using the 'Working System' structure but isolated to prevent visual bugs */}
                <div className="fixed top-0 left-0 pointer-events-none opacity-0 z-[-1]" style={{ transform: 'translateX(-9999px)' }}>
                    <div id="capture-container" className="relative w-[1080px] h-[1920px] flex flex-col items-center justify-center overflow-hidden">
                        <img
                            src={shareBackgroundBase64}
                            alt="Background"
                            className="absolute inset-0 w-full h-full object-cover z-0"
                        />
                        <div className="relative z-10 flex flex-col items-center justify-center p-16 text-center">
                            {/* Scaled up content for 1080p */}
                            <div className="text-[200px] mb-12 text-[#CE8E94]">
                                {achievementIcon}
                            </div>
                            <div className="text-6xl font-bold tracking-[0.2em] text-[#B5838D] uppercase mb-10">
                                {achievementTitle}
                            </div>
                            <div className="text-4xl text-gray-500 italic font-medium max-w-[800px]">
                                {achievementDescription}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Share Actions Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        className={`flex items-center justify-center gap-2 p-3 rounded-full border border-gray-100 bg-white hover:bg-[#CE8E94] hover:text-white hover:border-[#CE8E94] transition-all duration-300 shadow-sm group ${actionStatus === 'Instagram' ? 'bg-[#CE8E94] text-white border-[#CE8E94]' : 'text-gray-600'}`}
                        onClick={() => handleAction('Instagram')}
                    >
                        <Instagram className={`w-5 h-5 text-[#CE8E94] group-hover:text-white ${actionStatus === 'Instagram' ? 'text-white' : ''}`} />
                        <span className="text-xs font-bold">{actionStatus === 'Instagram' ? 'Opened' : 'Instagram'}</span>
                    </button>

                    <button
                        className={`flex items-center justify-center gap-2 p-3 rounded-full border border-gray-100 bg-white hover:bg-[#CE8E94] hover:text-white hover:border-[#CE8E94] transition-all duration-300 shadow-sm group ${actionStatus === 'Facebook' ? 'bg-[#CE8E94] text-white border-[#CE8E94]' : 'text-gray-600'}`}
                        onClick={() => handleAction('Facebook')}
                    >
                        <Facebook className={`w-5 h-5 text-[#CE8E94] group-hover:text-white ${actionStatus === 'Facebook' ? 'text-white' : ''}`} />
                        <span className="text-xs font-bold">{actionStatus === 'Facebook' ? 'Opened' : 'Facebook'}</span>
                    </button>

                    <button
                        className={`flex items-center justify-center gap-2 p-3 rounded-full border border-gray-100 bg-white hover:bg-[#CE8E94] hover:text-white hover:border-[#CE8E94] transition-all duration-300 shadow-sm group ${actionStatus === 'WhatsApp' ? 'bg-[#CE8E94] text-white border-[#CE8E94]' : 'text-gray-600'}`}
                        onClick={() => handleAction('WhatsApp')}
                    >
                        <MessageCircle className={`w-5 h-5 text-[#CE8E94] group-hover:text-white ${actionStatus === 'WhatsApp' ? 'text-white' : ''}`} />
                        <span className="text-xs font-bold">{actionStatus === 'WhatsApp' ? 'Opened' : 'WhatsApp'}</span>
                    </button>

                    <button
                        className={`flex items-center justify-center gap-2 p-3 rounded-full border border-gray-100 bg-white hover:bg-[#CE8E94] hover:text-white hover:border-[#CE8E94] transition-all duration-300 shadow-sm group ${actionStatus === 'X' ? 'bg-[#CE8E94] text-white border-[#CE8E94]' : 'text-gray-600'}`}
                        onClick={() => handleAction('X')}
                    >
                        <Twitter className={`w-5 h-5 text-[#CE8E94] group-hover:text-white ${actionStatus === 'X' ? 'text-white' : ''}`} />
                        <span className="text-xs font-bold">{actionStatus === 'X' ? 'Opened' : 'X'}</span>
                    </button>
                </div>

                {/* Secondary Actions */}
                <div className="flex justify-center gap-4">
                    <button
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#CE8E94] transition-colors font-medium"
                        onClick={() => handleAction('Copy Link')}
                    >
                        <Link className="w-3 h-3" /> Copy Link
                    </button>
                    <button
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#CE8E94] transition-colors font-medium"
                        onClick={() => handleAction('Download Image')}
                    >
                        <Download className="w-3 h-3" /> Save Image
                    </button>
                </div>
            </div>
        </Modal>
    );
};
