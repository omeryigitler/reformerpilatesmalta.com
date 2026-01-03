"use client";

import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { User, LogOut, Calendar, Clock, Zap, Home, ShieldCheck, Phone, Mail, Star } from 'lucide-react';
import { UserType, Slot } from '../types';
import { getTodayDate, isPastSlot, formatDateDisplay } from '../utils/helpers';
import { useConfirm } from '../context/ConfirmContext';
import { BookingCalendar } from './BookingCalendar';
import { UserHistory } from './UserHistory';
import { SantaHat } from './ChristmasDecorations';
import { ProgressionDashboard } from './ProgressionDashboard';
import { Modal } from './Modal';
import { ShareModal } from './ShareModal';

export const UserDashboard = ({
    loggedInUser,
    slots,
    handleBookSlot,
    onLogout,
    navigateToHome,
    holidayMode
}: {
    loggedInUser: UserType,
    slots: Slot[],
    handleBookSlot: (date: string, time: string) => void,
    handleCancelBooking?: (date: string, time: string) => void,
    onLogout: () => void,
    navigateToHome: () => void,
    holidayMode?: boolean
}) => {
    const userName = `${loggedInUser.firstName} ${loggedInUser.lastName}`;
    const { showConfirm } = useConfirm();
    const [selectedDate, setSelectedDate] = useState('');

    React.useEffect(() => {
        setSelectedDate(getTodayDate());
    }, []);
    const [showGamification, setShowGamification] = useState(false);
    const [sharingItem, setSharingItem] = useState<{ title: string, icon: React.ReactNode, description: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'profile'>('upcoming');

    // Standardized Logic: Active = Not Past + Not Completed
    const futureSlots = slots.filter(slot => !isPastSlot(slot.date, slot.time));

    // Filter out Completed slots from active bookings even if date is today/future
    // Also ensures we strictly show only what hasn't passed in time
    const userBookings = futureSlots
        .filter(slot => {
            if (slot.status === 'Completed') return false;
            // Double check for logic consistency - futureSlots already filters past time

            // Standardized Email Matching (Case-insensitive)
            if (slot.bookedByEmail) {
                return slot.bookedByEmail.toLowerCase() === loggedInUser.email.toLowerCase();
            }

            // Fallback for old data (Robust matching)
            if (!slot.bookedBy) return false;
            const cleanBookedBy = slot.bookedBy.replace(' (Admin)', '').trim().toLowerCase();
            const myFullName = `${loggedInUser.firstName} ${loggedInUser.lastName}`.trim().toLowerCase();
            return cleanBookedBy === myFullName;
        })
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    const availableSlotsForSelectedDate = futureSlots
        .filter(slot => slot.date === selectedDate && slot.status === 'Available');

    availableSlotsForSelectedDate.sort((a, b) => a.time.localeCompare(b.time));

    // Standardized Logic for History (Past or Completed)
    const pastBookings = slots.filter(slot => {
        let isMatch = false;
        if (slot.bookedByEmail) {
            isMatch = slot.bookedByEmail.toLowerCase() === loggedInUser.email.toLowerCase();
        } else if (slot.bookedBy) {
            const cleanBookedBy = slot.bookedBy.replace(' (Admin)', '').trim().toLowerCase();
            const myFullName = `${loggedInUser.firstName} ${loggedInUser.lastName}`.trim().toLowerCase();
            isMatch = cleanBookedBy === myFullName;
        }
        return isMatch && (isPastSlot(slot.date, slot.time) || slot.status === 'Completed');
    });

    // Dynamic Gamification Logic
    const lessonsCompleted = pastBookings.length;

    // Dynamically calculate traits based on history
    const unlockedTraits = React.useMemo(() => {
        const traits: string[] = [];
        if (lessonsCompleted > 0) {
            // SOLARIS: Morning (09-12)
            const hasMorning = pastBookings.some(s => {
                const hour = parseInt(s.time.split(':')[0]);
                return hour >= 9 && hour < 12;
            });
            if (hasMorning) traits.push('SOLARIS');

            // LUNAR: Evening (18-21)
            const hasEvening = pastBookings.some(s => {
                const hour = parseInt(s.time.split(':')[0]);
                return hour >= 18 && hour < 21;
            });
            if (hasEvening) traits.push('LUNAR');

            // ZENITH: Weekend (Saturday=6, Sunday=0)
            const hasWeekend = pastBookings.some(s => {
                const day = new Date(s.date).getDay();
                return day === 0 || day === 6;
            });
            if (hasWeekend) traits.push('ZENITH');

            // GRAVITY: 7 or more lifetime sessions (Simplified for now)
            if (lessonsCompleted >= 7) traits.push('GRAVITY');

            // STARLIGHT: Placeholder for interaction (if it was tracked)
            // if (user.totalLikes > 0) traits.push('STARLIGHT');
        }
        return traits;
    }, [pastBookings, lessonsCompleted]);

    return (
        <div className="pilates-root min-h-screen flex flex-col items-center p-4 md:p-10 space-y-10 font-sans bg-[#FFF0E5]">
            <div className="w-full max-w-6xl px-8 md:px-16 py-10 bg-white/60 backdrop-blur-md rounded-[3rem] shadow-2xl border border-white/50 space-y-12">
                <div className="flex justify-between items-start md:items-center border-b border-[#CE8E94]/20 pb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#CE8E94] flex items-center gap-3"><User className="w-8 h-8" />
                        <span className="flex flex-col md:flex-row md:gap-2">
                            <span>Hi,</span>
                            <span>{loggedInUser.firstName}</span>
                        </span>
                    </h1>
                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                        <Button
                            onClick={navigateToHome}
                            className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl text-sm font-bold hover:bg-gray-100 transition duration-300 flex items-center gap-2 w-full sm:w-auto justify-center relative group"
                        >
                            {holidayMode && <SantaHat className="absolute -top-3 -left-2 w-8 h-8 -rotate-[15deg] z-20 transition-all duration-500 group-hover:-rotate-[35deg] group-hover:-translate-y-1" />}
                            <Home className="w-4 h-4" /> Home
                        </Button>
                        <Button
                            onClick={() => {
                                console.log('My Path button clicked, setting showGamification to true');
                                setShowGamification(true);
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-[#B5838D] to-[#CE8E94] text-white border-none rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition duration-300 flex items-center gap-2 w-full sm:w-auto justify-center"
                        >
                            <Zap className="w-4 h-4 text-yellow-200" /> My Path
                        </Button>
                        <Button
                            onClick={onLogout}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-red-100 hover:text-red-500 transition duration-300 flex items-center gap-2 w-full sm:w-auto justify-center"
                        >
                            <LogOut className="w-4 h-4" /> Logout
                        </Button>
                    </div>
                </div>

                {/* Tab Toggle */}
                <div className="flex justify-center">
                    <div className="bg-white p-1 rounded-full shadow-sm border border-gray-200 inline-flex">
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'upcoming' ? 'bg-[#CE8E94] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Upcoming
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-[#CE8E94] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            History
                        </button>
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-[#CE8E94] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Profile
                        </button>
                    </div>
                </div>

                {activeTab === 'upcoming' ? (
                    <>
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2 border-b pb-2"><Calendar className="w-6 h-6 text-[#CE8E94]" /> Your Active Bookings ({userBookings.length})</h2>
                            {userBookings.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {userBookings.map((slot, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-white rounded-2xl shadow-md transition border border-[#CE8E94]/20 relative overflow-hidden">
                                            {slot.bookedBy?.includes('(Admin)') && (
                                                <div className="absolute top-0 right-0 bg-blue-50 px-3 py-1 rounded-bl-xl text-[10px] font-bold text-blue-600 flex items-center gap-1 border-b border-l border-blue-100">
                                                    <ShieldCheck className="w-3 h-3" /> Confirmed by Studio
                                                </div>
                                            )}
                                            <div className="space-y-3 w-full sm:w-auto">
                                                <div className="space-y-1">
                                                    <span className="text-lg font-bold text-gray-800 flex items-center gap-2"><Clock className="w-5 h-5 text-[#CE8E94]" /> {slot.time}</span>
                                                    <span className="text-sm text-gray-500 block ml-7">{formatDateDisplay(slot.date)}</span>
                                                </div>

                                                {/* Calendar Buttons */}
                                                <div className="flex gap-2 ml-7">
                                                    <Button
                                                        className="h-7 text-xs px-2 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm"
                                                        onClick={() => {
                                                            const startTime = `${slot.date.replace(/-/g, '')}T${slot.time.replace(':', '')}00`;
                                                            const endTime = `${slot.date.replace(/-/g, '')}T${parseInt(slot.time.split(':')[0]) + 1}${slot.time.split(':')[1]}00`;
                                                            const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pilates+Session&dates=${startTime}/${endTime}&details=Reformer+Pilates+Malta+Session&location=Reformer+Pilates+Malta`;
                                                            window.open(url, '_blank');
                                                        }}
                                                    >
                                                        G-Cal
                                                    </Button>
                                                    <Button
                                                        className="h-7 text-xs px-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 shadow-sm"
                                                        onClick={() => {
                                                            const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:${window.location.origin}
DTSTART:${slot.date.replace(/-/g, '')}T${slot.time.replace(':', '')}00
DTEND:${slot.date.replace(/-/g, '')}T${parseInt(slot.time.split(':')[0]) + 1}${slot.time.split(':')[1]}00
SUMMARY:Pilates Session
DESCRIPTION:Reformer Pilates Malta Session
LOCATION:Reformer Pilates Malta
END:VEVENT
END:VCALENDAR`;
                                                            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                                                            const link = document.createElement('a');
                                                            link.href = window.URL.createObjectURL(blob);
                                                            link.setAttribute('download', 'pilates_session.ics');
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            document.body.removeChild(link);
                                                        }}
                                                    >
                                                        Apple
                                                    </Button>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => showConfirm('Please contact your instructor to cancel this booking.', () => { }, 'Contact Instructor', undefined, 'OK', false)}
                                                className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg mt-3 sm:mt-0"
                                                title="Contact Instructor"
                                            >
                                                Contact
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 bg-[#CE8E94] text-white rounded-[2rem] shadow-lg flex items-center gap-4 animate-in fade-in zoom-in duration-500">
                                    <Zap className="w-8 h-8 text-yellow-200 shrink-0" />
                                    <p className="font-extrabold text-lg leading-relaxed">You currently have no active bookings. Time to book a session!</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
                            {/* 1. KISIM: SOL TARAF (TAKVİM) - h-full eklenerek sağdaki kutuyla boyu eşitlendi */}
                            <div className="lg:col-span-1 space-y-4 flex flex-col h-full">
                                <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2 border-b pb-2">
                                    <Zap className="w-6 h-6 text-[#CE8E94]" /> Book a Class
                                </h2>
                                <div className="flex-1">
                                    <BookingCalendar
                                        slots={futureSlots}
                                        onSelectDate={setSelectedDate}
                                        selectedDate={selectedDate}
                                    />
                                </div>
                            </div>

                            {/* 2. & 3. KISIM: SAĞ TARAF (SLOT LİSTESİ) - Admin Panel'deki beyaz kutu ve başlık yapısı */}
                            <div className="lg:col-span-1 space-y-4 flex flex-col h-full">
                                {/* Sabit Başlık Alanı - Sol tarafla TAM SİMETRİK (Kutunun Üstünde) */}
                                <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2 border-b pb-2">
                                    {formatDateDisplay(selectedDate)}
                                </h2>

                                <div className="flex-1 flex flex-col bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-white/50">
                                    {/* Slotların Listelendiği Alan - Senin orijinal slot tasarımın korundu */}
                                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide">
                                        {availableSlotsForSelectedDate.length > 0 ? (
                                            availableSlotsForSelectedDate.map((slot, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-5 bg-white/60 rounded-2xl shadow-sm hover:bg-white hover:shadow-md transition border border-gray-100 hover:border-[#CE8E94]/30 gap-4">
                                                    <span className="text-xl font-medium text-gray-800 flex items-center gap-3">
                                                        <Clock className="w-5 h-5 text-green-600" /> {slot.time}
                                                    </span>
                                                    <Button
                                                        onClick={() => handleBookSlot(slot.date, slot.time)}
                                                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md transition-colors"
                                                    >
                                                        Book
                                                    </Button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-5 bg-white/40 backdrop-blur-md border-2 border-[#CE8E94] rounded-2xl text-[#CE8E94] font-extrabold flex items-start gap-3">
                                                <Zap className="w-5 h-5 mt-1 shrink-0" />
                                                <p>No available slots on this date. Please choose another day from the calendar.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : activeTab === 'history' ? (
                    <UserHistory slots={slots} userName={userName} userEmail={loggedInUser.email} />
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="border-b border-[#CE8E94]/20 pb-4">
                            <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
                                <User className="w-6 h-6 text-[#CE8E94]" /> Your Profile
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Manage your personal information and account details.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Info Card */}
                            <div className="bg-white/40 backdrop-blur-sm p-8 rounded-[2rem] border border-white/50 shadow-sm space-y-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#CE8E94] uppercase tracking-wider">Full Name</label>
                                    <div className="flex items-center gap-3 text-lg text-gray-800 font-medium">
                                        <div className="bg-[#CE8E94]/10 p-2 rounded-lg">
                                            <User className="w-5 h-5 text-[#CE8E94]" />
                                        </div>
                                        {loggedInUser.firstName} {loggedInUser.lastName}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#CE8E94] uppercase tracking-wider">Phone Number</label>
                                    <div className="flex items-center gap-3 text-lg text-gray-800 font-medium">
                                        <div className="bg-[#CE8E94]/10 p-2 rounded-lg">
                                            <Phone className="w-5 h-5 text-[#CE8E94]" />
                                        </div>
                                        {loggedInUser.phone}
                                    </div>
                                </div>

                                <div className="space-y-1 overflow-hidden">
                                    <label className="text-xs font-bold text-[#CE8E94] uppercase tracking-wider">Email Address</label>
                                    <div className="flex items-center gap-3 text-lg text-gray-800 font-medium break-all">
                                        <div className="bg-[#CE8E94]/10 p-2 rounded-lg shrink-0">
                                            <Mail className="w-5 h-5 text-[#CE8E94]" />
                                        </div>
                                        <span className="truncate">{loggedInUser.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Account Stats / Details Card */}
                            <div className="bg-white/40 backdrop-blur-sm p-8 rounded-[2rem] border border-white/50 shadow-sm space-y-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#CE8E94] uppercase tracking-wider">Member Since</label>
                                    <div className="flex items-center gap-3 text-lg text-gray-800 font-medium">
                                        <div className="bg-[#CE8E94]/10 p-2 rounded-lg">
                                            <Calendar className="w-5 h-5 text-[#CE8E94]" />
                                        </div>
                                        {formatDateDisplay(loggedInUser.registered)}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#CE8E94] uppercase tracking-wider">Instructor</label>
                                    <div className="flex items-center gap-3 text-lg text-gray-800 font-medium">
                                        <div className="bg-[#CE8E94]/10 p-2 rounded-lg">
                                            <Star className="w-5 h-5 text-[#CE8E94]" />
                                        </div>
                                        Gözde
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-sm text-blue-600 flex items-start gap-3">
                                        <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0" />
                                        <p>Your profile information is securely stored and only visible to you and the studio administrators.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showGamification && (
                <Modal
                    onClose={() => setShowGamification(false)}
                    className="max-w-[1050px] bg-[#FFF0E5] rounded-[24px]" // Use site BG color
                    overlayClassName="bg-[#CE8E94]/40 backdrop-blur-[5px]" // Brand-tinted overlay
                    useDefaultPadding={false}
                >
                    <ProgressionDashboard
                        lessonsCompleted={lessonsCompleted}
                        unlockedTraits={unlockedTraits}
                        onShare={(item) => setSharingItem(item)}
                    />
                </Modal>
            )}

            <ShareModal
                isOpen={!!sharingItem}
                onClose={() => setSharingItem(null)}
                achievementTitle={sharingItem?.title || ''}
                achievementIcon={sharingItem?.icon}
                achievementDescription={sharingItem?.description || ''}
            />
        </div>
    );
}
