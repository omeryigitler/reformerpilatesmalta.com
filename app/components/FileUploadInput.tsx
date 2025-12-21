"use client";

import React, { useState, useEffect } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export const FileUploadInput = ({ label, onChange, previewUrl }: { label: string, onChange: (file: File) => void, previewUrl: string }) => {
    const inputId = `file-input-${label.replace(/\s/g, '-')}`;
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        setImgError(false);
    }, [previewUrl]);

    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-600 mb-2">{label}</label>
            <div className="flex items-center space-x-4">
                <label
                    htmlFor={inputId}
                    className="flex-shrink-0 cursor-pointer bg-[#CE8E94] hover:bg-[#B57A80] text-white py-3 px-6 rounded-xl font-medium shadow-md transition-colors flex items-center gap-2"
                >
                    <Upload className="w-5 h-5 mr-1" />
                    Choose File
                </label>
                <input
                    id={inputId}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            onChange(e.target.files[0]);
                        }
                    }}
                    className="hidden"
                />
                {previewUrl && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-4 border-[#CE8E94]/30 shadow-md bg-gray-50 flex items-center justify-center">
                        {!imgError ? (
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center animate-pulse">
                                <ImageIcon className="w-6 h-6 text-[#CE8E94]/40" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
