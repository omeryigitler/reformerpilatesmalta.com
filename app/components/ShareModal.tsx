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

                {/* Solaris Style Premium Card */}
                <div className="flex justify-center mb-10 mt-4">
                    <div
                        id="share-card"
                        className="relative w-[340px] aspect-[4/3] sm:w-[500px] flex flex-col items-center justify-center p-12 bg-[#FFF5F6] rounded-[48px] shadow-[0_45px_100px_-25px_rgba(0,0,0,0.12)] border border-white/60 overflow-hidden"
                    >
                        {/* Decorative subtle inner glow */}
                        <div className="absolute inset-0 rounded-[48px] shadow-[0_0_40px_rgba(255,255,255,0.8)_inset]" />

                        {/* Content Container */}
                        <div className="relative z-10 flex flex-col items-center text-center">
                            {/* Icon - Clean and focused */}
                            <div className="text-8xl mb-8 flex justify-center text-[#CE8E94] filter drop-shadow-[0_10px_15px_rgba(206,142,148,0.2)]">
                                {achievementIcon}
                            </div>

                            {/* Title - The Solaris Aesthetic */}
                            <h4 className="text-2xl font-bold tracking-[0.35em] text-[#B5838D] uppercase mb-4 leading-none">
                                {achievementTitle}
                            </h4>

                            {/* Description - Italic & Elegant */}
                            <p className="text-base text-[#8D7B70]/80 italic font-medium px-4">
                                {`"`}{achievementDescription}{`"`}
                            </p>
                        </div>

                        {/* Branding Watermark - Very Discreet */}
                        <div className="absolute bottom-8 left-0 right-0 text-center opacity-30">
                            <span className="text-[9px] font-bold tracking-[0.4em] text-[#CE8E94] uppercase">
                                Reformer Pilates Malta
                            </span>
                        </div>
                    </div>
                </div>

                {/* Share Actions Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                        className={`flex items-center justify-center gap-3 p-4 rounded-full border border-[#FFF0F3] bg-white shadow-sm hover:bg-[#CE8E94] hover:text-white transition-all duration-300 group ${actionStatus === 'Instagram' ? 'bg-[#CE8E94] text-white' : 'text-gray-600'}`}
                        onClick={() => handleAction('Instagram')}
                    >
                        <Instagram className={`w-5 h-5 text-[#CE8E94] group-hover:text-white ${actionStatus === 'Instagram' ? 'text-white' : ''}`} />
                        <span className="text-sm font-bold">{actionStatus === 'Instagram' ? 'Sharing...' : 'Instagram'}</span>
                    </button>

                    <button
                        className={`flex items-center justify-center gap-3 p-4 rounded-full border border-[#FFF0F3] bg-white shadow-sm hover:bg-[#CE8E94] hover:text-white transition-all duration-300 group ${actionStatus === 'Facebook' ? 'bg-[#CE8E94] text-white' : 'text-gray-600'}`}
                        onClick={() => handleAction('Facebook')}
                    >
                        <Facebook className={`w-5 h-5 text-[#CE8E94] group-hover:text-white ${actionStatus === 'Facebook' ? 'text-white' : ''}`} />
                        <span className="text-sm font-bold">{actionStatus === 'Facebook' ? 'Sharing...' : 'Facebook'}</span>
                    </button>

                    <button
                        className={`flex items-center justify-center gap-3 p-4 rounded-full border border-[#FFF0F3] bg-white shadow-sm hover:bg-[#CE8E94] hover:text-white transition-all duration-300 group ${actionStatus === 'WhatsApp' ? 'bg-[#CE8E94] text-white' : 'text-gray-600'}`}
                        onClick={() => handleAction('WhatsApp')}
                    >
                        <MessageCircle className={`w-5 h-5 text-[#CE8E94] group-hover:text-white ${actionStatus === 'WhatsApp' ? 'text-white' : ''}`} />
                        <span className="text-sm font-bold">{actionStatus === 'WhatsApp' ? 'Sharing...' : 'WhatsApp'}</span>
                    </button>

                    <button
                        className={`flex items-center justify-center gap-3 p-4 rounded-full border border-[#FFF0F3] bg-white shadow-sm hover:bg-[#CE8E94] hover:text-white transition-all duration-300 group ${actionStatus === 'X' ? 'bg-[#CE8E94] text-white' : 'text-gray-600'}`}
                        onClick={() => handleAction('X')}
                    >
                        <Twitter className={`w-5 h-5 text-[#CE8E94] group-hover:text-white ${actionStatus === 'X' ? 'text-white' : ''}`} />
                        <span className="text-sm font-bold">{actionStatus === 'X' ? 'Sharing...' : 'X'}</span>
                    </button>
                </div>

                {/* Secondary Actions */}
                <div className="flex justify-center gap-10">
                    <button
                        className={`flex items-center gap-2 text-[11px] transition-colors font-bold tracking-widest uppercase ${actionStatus === 'Copied!' ? 'text-green-500' : 'text-gray-400 hover:text-[#CE8E94]'}`}
                        onClick={() => handleAction('Copy Link')}
                        disabled={actionStatus === 'Copied!'}
                    >
                        <Link className="w-4 h-4" /> {actionStatus === 'Copied!' ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button
                        className={`flex items-center gap-2 text-[11px] transition-colors font-bold tracking-widest uppercase ${actionStatus === 'Saved!' ? 'text-green-500' : 'text-gray-400 hover:text-[#CE8E94]'}`}
                        onClick={() => handleAction('Download Image')}
                        disabled={actionStatus === 'Saved!'}
                    >
                        <Download className="w-4 h-4" /> {actionStatus === 'Saved!' ? 'Saved!' : 'Save Image'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
