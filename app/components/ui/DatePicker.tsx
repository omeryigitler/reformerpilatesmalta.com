"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/components/ui/button";

interface DatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    minDate?: string; // Optional min date YYYY-MM-DD
}

export const DatePicker = ({
    value,
    onChange,
    placeholder = "Select Date",
    className,
    disabled = false,
    minDate
}: DatePickerProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date()); // Controls the month currently being viewed
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize viewDate from value if present
    useEffect(() => {
        if (value) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                setViewDate(date);
            }
        }
    }, [isOpen, value]); // Reset to selected date when opening

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

    const daysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handleDateClick = (day: number) => {
        const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        // Format to YYYY-MM-DD local time (avoid UTC shifts)
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayStr}`;

        onChange(dateStr);
        setIsOpen(false);
    };

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const formatDateDisplay = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const renderCalendarDays = () => {
        const totalDays = daysInMonth(viewDate);
        const startDay = firstDayOfMonth(viewDate);
        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
        }

        // Days
        for (let day = 1; day <= totalDays; day++) {
            const currentDayDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
            const dateStr = `${currentDayDate.getFullYear()}-${String(currentDayDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = value === dateStr;
            const isToday = new Date().toDateString() === currentDayDate.toDateString();
            const isDisabled = minDate ? dateStr < minDate : false;

            days.push(
                <button
                    key={day}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleDateClick(day)}
                    className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all",
                        isSelected ? "bg-[#CE8E94] text-white shadow-md" : "hover:bg-gray-100 text-gray-700",
                        isToday && !isSelected && "border border-[#CE8E94] text-[#CE8E94] font-medium",
                        isDisabled && "opacity-20 cursor-not-allowed hover:bg-transparent"
                    )}
                >
                    {day}
                </button>
            );
        }
        return days;
    };

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            {/* Trigger Button */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={cn(
                    "flex h-12 w-full items-center justify-start rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#CE8E94] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                    isOpen && "ring-2 ring-[#CE8E94] border-transparent",
                    !value && "text-gray-400",
                    className
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4 text-[#CE8E94]" />
                <span className="truncate">{value ? formatDateDisplay(value) : placeholder}</span>
            </button>

            {/* Calendar Popover */}
            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-2 w-[320px] rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                            <ChevronLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div className="text-base font-bold text-gray-900">
                            {viewDate.toLocaleDateString("en-US", { month: 'long', year: 'numeric' })}
                        </div>
                        <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                            <ChevronRight className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 mb-2 text-center">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="text-xs font-medium text-gray-400 h-8 flex items-center justify-center">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-y-1 justify-items-center">
                        {renderCalendarDays()}
                    </div>
                </div>
            )}
        </div>
    );
};
