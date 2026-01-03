"use client";

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Facebook, Instagram, Twitter, MessageCircle, Link, Download } from 'lucide-react';
import html2canvas from 'html2canvas';


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

    const handleAction = async (platform: string) => {
        setActionStatus(platform);

        const text = `I just unlocked the ${achievementTitle} badge on Reformer Pilates Malta! 🏆`;
        const url = typeof window !== 'undefined' ? window.location.href : '';

        // Immediate Actions for Copy/Download
        if (platform === 'Copy Link') {
            try {
                await navigator.clipboard.writeText(`${text} ${url}`);
                // Status will show "Opened" -> maybe redundant but confirms click
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        } else if (platform === 'Download Image') {
            const element = document.getElementById('share-card');
            if (element) {
                try {
                    const canvas = await html2canvas(element, {
                        useCORS: true,
                    });

                    const link = document.createElement('a');
                    link.download = `pilates-badge-${achievementTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
                    link.href = canvas.toDataURL('image/png');

                    // Robust trigger
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                } catch (err) {
                    console.error('Failed to capture image: ', err);
                    alert("Görüntü kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
                }
            }
        } else {
            // Social Media Links
            setTimeout(() => {
                if (platform === 'Facebook') {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
                } else if (platform === 'Instagram') {
                    window.open('https://instagram.com', '_blank');
                } else if (platform === 'WhatsApp') {
                    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                } else if (platform === 'X') {
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                }
            }, 300);
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
                    {/* Placeholder for header spacing if needed */}
                    <div></div>
                    {/* Close button is handled by generic Modal, but we can have custom header too */}
                </div>

                <h3 className="text-2xl font-bold text-[#CE8E94] mb-2">Share Your Success</h3>
                <p className="text-gray-500 text-sm mb-6">
                    Show off your new <strong>{achievementTitle}</strong> badge to the world!
                </p>

                {/* Preview Card */}
                <div
                    id="share-card"
                    className="bg-gradient-to-br from-[#FFF0F3] to-[#F5F1EE] rounded-3xl p-8 mb-8 shadow-lg border border-[#CE8E94]/10 transform transition-all hover:scale-105 duration-300"
                >
                    <div className="text-6xl mb-4 flex justify-center text-[#CE8E94]">
                        {achievementIcon}
                    </div>
                    <div className="text-sm font-bold tracking-widest text-[#B5838D] uppercase mb-2">
                        {achievementTitle}
                    </div>
                    <div className="text-xs text-gray-400 italic font-medium">
                        {achievementDescription}
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
                        className={`flex items-center gap-1 text-xs transition-colors font-medium ${actionStatus === 'Copy Link' ? 'text-green-500' : 'text-gray-400 hover:text-[#CE8E94]'}`}
                        onClick={() => handleAction('Copy Link')}
                        disabled={actionStatus === 'Copy Link'}
                    >
                        <Link className="w-3 h-3" /> {actionStatus === 'Copy Link' ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button
                        className={`flex items-center gap-1 text-xs transition-colors font-medium ${actionStatus === 'Download Image' ? 'text-green-500' : 'text-gray-400 hover:text-[#CE8E94]'}`}
                        onClick={() => handleAction('Download Image')}
                        disabled={actionStatus === 'Download Image'}
                    >
                        <Download className="w-3 h-3" /> {actionStatus === 'Download Image' ? 'Saved!' : 'Save Image'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
