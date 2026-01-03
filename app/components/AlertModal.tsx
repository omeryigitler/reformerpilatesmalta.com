"use client";

import React from 'react';
import { Modal } from './Modal';
import { Info, CheckCircle, AlertCircle } from 'lucide-react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'error';
}

export const AlertModal = ({ isOpen, onClose, title, message, type = 'info' }: AlertModalProps) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle className="w-12 h-12 text-green-500" />;
            case 'error': return <AlertCircle className="w-12 h-12 text-red-500" />;
            default: return <Info className="w-12 h-12 text-[#CE8E94]" />;
        }
    };

    return (
        <Modal onClose={onClose} showCloseIcon={true} className="max-w-sm">
            <div className="flex flex-col items-center text-center p-2">
                <div className="mb-4">
                    {getIcon()}
                </div>
                <h3 className="text-xl font-bold text-[#CE8E94] mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    {message}
                </p>
                <button
                    onClick={onClose}
                    className="w-full py-3 px-6 bg-[#CE8E94] text-white rounded-full font-bold shadow-lg hover:bg-[#B5838D] transition-all duration-300"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
};
