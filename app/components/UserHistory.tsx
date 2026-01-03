"use client";

import React, { useState } from "react";
import { Award, Clock, Share2 } from "lucide-react";
import { Slot } from "../types";
import { isPastSlot, formatDateDisplay } from "../utils/helpers";
import { Button } from '@/app/components/ui/button';
import { ShareModal } from './ShareModal';

export const UserHistory = ({ slots, userName, userEmail }: { slots: Slot[], userName: string, userEmail: string }) => {
    // State for ShareModal
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState<{ title: string, description: string, icon: React.ReactNode } | null>(null);

    // Geçmiş dersleri bul ve sırala (En yeniden eskiye)
    const pastBookings = slots
        .filter(slot => {
            let isMatch = false;
            if (slot.bookedByEmail) {
                isMatch = slot.bookedByEmail === userEmail;
            } else if (slot.bookedBy) {
                // Robust name matching fallback
                const cleanBookedBy = slot.bookedBy.replace(' (Admin)', '').trim().toLowerCase();
                const myName = userName.trim().toLowerCase();
                isMatch = cleanBookedBy === myName;
            }
            // Standardized Logic: History = Past (Time expired) OR Status Completed
            // This captures "Active" bookings that just expired 1 second ago.
            return isMatch && (isPastSlot(slot.date, slot.time) || slot.status === 'Completed');
        })
        .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

    const totalSessions = pastBookings.length;

    const handleShare = (slot: Slot) => {
        // Calculate Milestone / Badge logic here dynamically
        // For now, we simulate a standard "Session Completed" badge
        // In future, this could be "10th Session", "Early Bird", etc.

        let title = "Pilates Enthusiast";
        const description = `Completed a session on ${formatDateDisplay(slot.date)}`;
        const icon = <Award className="w-16 h-16 text-[#CE8E94]" strokeWidth={1} />;

        // Simple Gamification Example
        if (totalSessions >= 1) title = "First Step";
        if (totalSessions >= 5) title = "Consistency Is Key";
        if (totalSessions >= 10) title = "Pilates Pro";
        if (totalSessions >= 50) title = "Elite Member";

        setSelectedAchievement({
            title,
            description,
            icon
        });
        setIsShareModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* İstatistik Kartları */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#CE8E94]/20 text-center">
                    <h3 className="text-4xl font-bold text-[#CE8E94]">{totalSessions}</h3>
                    <p className="text-gray-500 text-sm font-medium mt-1">Total Sessions Completed</p>
                </div>
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#CE8E94]/20 text-center flex flex-col items-center justify-center">
                    <Award className="w-10 h-10 text-[#CE8E94] mb-2" />
                    <p className="text-gray-500 text-sm font-medium">Keep it up!</p>
                </div>
            </div>

            {/* Geçmiş Ders Listesi */}
            <div className="bg-white rounded-3xl shadow-lg border border-white/50 p-6 md:p-8">
                <h3 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" /> Session History
                </h3>

                {pastBookings.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {pastBookings.map((slot, idx) => (
                            <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 opacity-75 hover:opacity-100 transition group">
                                <div>
                                    <span className="font-bold text-gray-700 block">{formatDateDisplay(slot.date)}</span>
                                    <span className="text-sm text-gray-500">{slot.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                        Completed
                                    </span>
                                    <Button
                                        variant="ghost"
                                        className="h-8 w-8 p-0 rounded-full hover:bg-[#CE8E94]/10 hover:text-[#CE8E94] text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                        onClick={() => handleShare(slot)}
                                        title="Share this achievement"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-10">No past sessions found.</p>
                )}
            </div>

            {/* Share Modal Integration */}
            {selectedAchievement && (
                <ShareModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    achievementTitle={selectedAchievement.title}
                    achievementDescription={selectedAchievement.description}
                    achievementIcon={selectedAchievement.icon}
                />
            )}
        </div>
    );
};
