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

    // Helper to generate canvas from the badge card
    const generateCanvas = async (): Promise<HTMLCanvasElement | null> => {
        const element = document.getElementById('share-card');
        if (!element) return null;

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const options: any = {
                useCORS: true,
                scale: 3,
                backgroundColor: '#FFF0F3',
                logging: false,
                onclone: (clonedDoc: Document) => {
                    const clonedElement = clonedDoc.getElementById('share-card');
                    if (clonedElement) {
                        clonedElement.style.transform = 'none';
                        clonedElement.style.transition = 'none';
                    }
                }
            };
            return await html2canvas(element, options);
        } catch (err) {
            console.error('Canvas generation failed:', err);
            return null;
        }
    };

    const handleAction = async (platform: string) => {
        setActionStatus(platform);
        const text = `I just unlocked the ${achievementTitle} badge on Reformer Pilates Malta! 🏆`;
        const url = typeof window !== 'undefined' ? window.location.href : '';

        // Generate the image for all platforms that might use it
        let canvas: HTMLCanvasElement | null = null;
        if (['Instagram', 'WhatsApp', 'Facebook', 'X', 'Download Image'].includes(platform)) {
            canvas = await generateCanvas();
        }

        try {
            if (platform === 'Download Image') {
                if (!canvas) throw new Error('Canvas failed');
                const link = document.createElement('a');
                link.download = `pilates-badge-${achievementTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
                link.href = canvas.toDataURL('image/png');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setActionStatus('Saved!');
            }
            else if (platform === 'Copy Link') {
                await navigator.clipboard.writeText(`${text} ${url}`);
                setActionStatus('Copied!');
            }
            else {
                // For Mobile: Try Direct File Sharing (The "Automatic" way for Stories/WhatsApp)
                if (canvas && navigator.share && navigator.canShare) {
                    const blob = await new Promise<Blob | null>(resolve => canvas!.toBlob(resolve, 'image/png'));
                    if (blob) {
                        const file = new File([blob], 'achievement.png', { type: 'image/png' });
                        if (navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                files: [file],
                                title: achievementTitle,
                                text: text,
                            });
                            setActionStatus('Shared!');
                            return; // Success
                        }
                    }
                }

                // Fallback for Desktop or if Share API fails: Just open the link
                if (platform === 'Facebook') {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
                } else if (platform === 'Instagram') {
                    window.open('https://instagram.com', '_blank'); // Instagram web doesn't support direct story intent
                } else if (platform === 'WhatsApp') {
                    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                } else if (platform === 'X') {
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                }
            }
        } catch (err) {
            console.error('Action failed:', err);
            // If it's a mobile share cancel, we don't need to alert. For others, maybe.
            if (platform === 'Download Image') alert("Görüntü oluşturulamadı. Lütfen tekrar deneyin.");
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
                    Show off your <strong>{achievementTitle}</strong> badge to the world!
                </p>

                {/* Preview Card - Note: Removed transform from here to fix capture bugs */}
                <div
                    id="share-card"
                    className="bg-gradient-to-br from-[#FFF0F3] to-[#F5F1EE] rounded-3xl p-8 mb-8 shadow-lg border border-[#CE8E94]/10 transition-all duration-300"
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
                        className={`flex items-center justify-center gap-2 p-3 rounded-full border border-gray-100 bg-white hover:bg-[#CE8E94] hover:text-white hover:border-[#CE8E94] transition-all duration-300 shadow-sm group ${actionStatus === 'Instagram' ? 'bg-[#CE8E94] text-white' : 'text-gray-600'}`}
                        onClick={() => handleAction('Instagram')}
                    >
                        <Instagram className={`w-5 h-5 text-[#CE8E94] group-hover:text-white ${actionStatus === 'Instagram' ? 'text-white' : ''}`} />
                        <span className="text-xs font-bold">{actionStatus === 'Instagram' ? 'Sharing...' : 'Instagram'}</span>
                    </button>

                    <button
                        className={`flex items-center justify-center gap-2 p-3 rounded-full border border-gray-100 bg-white hover:bg-[#CE8E94] hover:text-white hover:border-[#CE8E94] transition-all duration-300 shadow-sm group ${actionStatus === 'Facebook' ? 'bg-[#CE8E94] text-white' : 'text-gray-600'}`}
                        onClick={() => handleAction('Facebook')}
                    >
                        <Facebook className={`w-5 h-5 text-[#CE8E94] group-hover:text-white ${actionStatus === 'Facebook' ? 'text-white' : ''}`} />
                        <span className="text-xs font-bold">{actionStatus === 'Facebook' ? 'Sharing...' : 'Facebook'}</span>
                    </button>

                    <button
                        className={`flex items-center justify-center gap-2 p-3 rounded-full border border-gray-100 bg-white hover:bg-[#CE8E94] hover:text-white hover:border-[#CE8E94] transition-all duration-300 shadow-sm group ${actionStatus === 'WhatsApp' ? 'bg-[#CE8E94] text-white' : 'text-gray-600'}`}
                        onClick={() => handleAction('WhatsApp')}
                    >
                        <MessageCircle className={`w-5 h-5 text-[#CE8E94] group-hover:text-white ${actionStatus === 'WhatsApp' ? 'text-white' : ''}`} />
                        <span className="text-xs font-bold">{actionStatus === 'WhatsApp' ? 'Sharing...' : 'WhatsApp'}</span>
                    </button>

                    <button
                        className={`flex items-center justify-center gap-2 p-3 rounded-full border border-gray-100 bg-white hover:bg-[#CE8E94] hover:text-white hover:border-[#CE8E94] transition-all duration-300 shadow-sm group ${actionStatus === 'X' ? 'bg-[#CE8E94] text-white' : 'text-gray-600'}`}
                        onClick={() => handleAction('X')}
                    >
                        <Twitter className={`w-5 h-5 text-[#CE8E94] group-hover:text-white ${actionStatus === 'X' ? 'text-white' : ''}`} />
                        <span className="text-xs font-bold">{actionStatus === 'X' ? 'Sharing...' : 'X'}</span>
                    </button>
                </div>

                {/* Secondary Actions */}
                <div className="flex justify-center gap-6">
                    <button
                        className={`flex items-center gap-1 text-xs transition-colors font-medium ${actionStatus === 'Copied!' ? 'text-green-500' : 'text-gray-400 hover:text-[#CE8E94]'}`}
                        onClick={() => handleAction('Copy Link')}
                    >
                        <Link className="w-3 h-3" /> {actionStatus === 'Copied!' ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button
                        className={`flex items-center gap-1 text-xs transition-colors font-medium ${actionStatus === 'Saved!' ? 'text-green-500' : 'text-gray-400 hover:text-[#CE8E94]'}`}
                        onClick={() => handleAction('Download Image')}
                    >
                        <Download className="w-3 h-3" /> {actionStatus === 'Saved!' ? 'Saved!' : 'Save Image'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
