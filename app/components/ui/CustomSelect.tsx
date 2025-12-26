"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/app/components/ui/button"; // Re-using cn utility

interface CustomSelectProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export const CustomSelect = ({
    options,
    value,
    onChange,
    placeholder = "Select...",
    className,
    disabled = false
}: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option: string) => {
        if (disabled) return;
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    "flex h-12 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#CE8E94] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                    isOpen && "ring-2 ring-[#CE8E94] border-transparent",
                    className
                )}
            >
                <span className={cn("truncate", !value && "text-gray-400")}>
                    {value || placeholder}
                </span>
                <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform duration-200", isOpen && "rotate-180")} />
            </button>

            {/* Dropdown List */}
            {isOpen && (
                <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-gray-100 bg-white p-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm animate-in fade-in zoom-in-95 duration-200 scrollbar-hide">
                    {options.map((option) => (
                        <div
                            key={option}
                            onClick={() => handleSelect(option)}
                            className={cn(
                                "relative flex w-full cursor-default select-none items-center rounded-lg py-2.5 pl-3 pr-9 outline-none transition-colors hover:bg-gray-50 cursor-pointer",
                                value === option && "bg-[#CE8E94]/10 text-[#CE8E94] font-medium"
                            )}
                        >
                            <span className="block truncate">{option}</span>
                            {value === option && (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#CE8E94]">
                                    <Check className="h-4 w-4" />
                                </span>
                            )}
                        </div>
                    ))}
                    {options.length === 0 && (
                        <div className="py-2 px-3 text-sm text-gray-500 text-center">
                            No options
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
