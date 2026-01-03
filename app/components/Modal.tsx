"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export const Modal = ({
    children,
    onClose,
    showCloseIcon = true,
    className = "",
    overlayClassName = "",
    useDefaultPadding = true
}: {
    children: React.ReactNode,
    onClose: () => void,
    showCloseIcon?: boolean,
    className?: string,
    overlayClassName?: string,
    useDefaultPadding?: boolean
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Modal açıldığında arka planın kaymasını engelle
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!mounted) return null;

    // Default overlay style + custom override
    const overlayStyle = `fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ${overlayClassName || "bg-[#CE8E94]/10 backdrop-blur-md"}`;

    // Default content style + custom override
    // Note: We use useDefaultPadding to toggle the p-8 md:p-10 classes
    const paddingClasses = useDefaultPadding ? "p-8 md:p-10" : "";


    return createPortal(
        <div className={overlayStyle}>
            {/* Arka plan overlay - tıklayınca kapanır */}
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className={`relative flex flex-col bg-white rounded-[1.5rem] shadow-2xl w-full animate-in fade-in zoom-in duration-300 max-h-[90vh] z-10 ${className ? className : 'max-w-lg'} overflow-hidden`}>
                {showCloseIcon && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 left-4 w-[32px] h-[32px] flex items-center justify-center bg-white rounded-full text-[#6B5E5E] shadow-[0_4px_10px_rgba(0,0,0,0.1)] hover:text-black hover:scale-110 transition-all z-50 cursor-pointer"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
                <div className={`flex-1 overflow-y-auto scrollbar-hide ${paddingClasses}`}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
