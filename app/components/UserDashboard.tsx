"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/app/components/ui/button';
import { User, LogOut, Calendar, Clock, Zap, Home, ShieldCheck, Trophy, Activity, Sparkles, Quote } from 'lucide-react';
import { UserType, Slot } from '../types';
import { getTodayDate, isPastSlot, formatDateDisplay } from '../utils/helpers';
import { useConfirm } from '../context/ConfirmContext';
import { BookingCalendar } from './BookingCalendar';
import { UserHistory } from './UserHistory';
import { SantaHat } from './ChristmasDecorations';
import { BADGE_DEFINITIONS, WELLNESS_QUOTES } from '../utils/gamificationConfig';

// --- SYSTEM SAFETY SWITCH ---
// Set this to FALSE to instantly disable all Gamification features (Badges, Stats, Tips)
// and revert to the classic dashboard layout.
const SHOW_GAMIFICATION = true;

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
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

    React.useEffect(() => {
        setSelectedDate(getTodayDate());
    }, []);

    // --- LOGIC: Active & History ---
    const futureSlots = useMemo(() => slots.filter(slot => !isPastSlot(slot.date, slot.time)), [slots]);

    const myHistory = useMemo(() => {
        return slots.filter(s => {
            if (s.bookedByEmail && s.bookedByEmail.toLowerCase() === loggedInUser.email.toLowerCase()) return true;
            if (!s.bookedBy) return false;
            const cleanBooked = s.bookedBy.replace(' (Admin)', '').trim().toLowerCase();
            const myName = userName.trim().toLowerCase();
            return cleanBooked === myName;
        });
    }, [slots, loggedInUser, userName]);

    const completedCount = myHistory.filter(s => s.status === 'Completed' || isPastSlot(s.date, s.time)).length;

    const userBookings = futureSlots
        .filter(slot => {
            if (slot.status === 'Completed') return false;
            if (slot.bookedByEmail) {
                return slot.bookedByEmail.toLowerCase() === loggedInUser.email.toLowerCase();
            }
            if (!slot.bookedBy) return false;
            const cleanBookedBy = slot.bookedBy.replace(' (Admin)', '').trim().toLowerCase();
            return cleanBookedBy === userName.trim().toLowerCase();
        })
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    const availableSlotsForSelectedDate = futureSlots
        .filter(slot => slot.date === selectedDate && slot.status === 'Available')
        .sort((a, b) => a.time.localeCompare(b.time));


    // --- GAMIFICATION LOGIC (Calculated Memoized) ---
    const myBadges = useMemo(() => {
        if (!SHOW_GAMIFICATION) return [];
        return BADGE_DEFINITIONS.filter(def => {
            const c = def.criteria;
            // TS Fix: Fallback for optional values
            if (c.type === 'count') return completedCount >= (c.value || 0);

            if (c.type === 'time') {
                const count = myHistory.filter(s => {
                    if (s.status !== 'Completed' && !isPastSlot(s.date, s.time)) return false;
                    return s.time >= c.start! && s.time <= c.end!;
                }).length;
                return count >= c.count!;
            }

            if (c.type === 'weekend') {
                const count = myHistory.filter(s => {
                    const d = new Date(s.date).getDay();
                    return d === 0 || d === 6; // Sun or Sat
                }).length;
                return count >= c.count!;
            }

            if (c.type === 'monthly') {
                const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
                const count = myHistory.filter(s => s.date.startsWith(currentMonth)).length;
                return count >= (c.value || 0);
            }

            if (c.type === 'loyalty_days') {
                const regDate = new Date(loggedInUser.registered);
                const days = (new Date().getTime() - regDate.getTime()) / (1000 * 3600 * 24);
                return days >= (c.value || 0);
            }

            if (c.type === 'profile') {
                return loggedInUser.phone && loggedInUser.phone.length > 5;
            }

            return false;
        });
    }, [myHistory, completedCount, loggedInUser]);

    // Daily Tip Selection
    const dailyTip = useMemo(() => {
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
        return WELLNESS_QUOTES[dayOfYear % WELLNESS_QUOTES.length];
    }, []);


    return (
        <div className="pilates-root min-h-screen flex flex-col items-center p-4 md:p-8 lg:p-10 space-y-6 md:space-y-10 font-sans bg-[#FFF0E5]">
            <div className="w-full max-w-6xl px-4 py-8 md:px-12 md:py-10 lg:px-16 bg-white/60 backdrop-blur-md rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-white/50 space-y-8 md:space-y-12">

                {/* HEAD & WELCOME - UPDATED LAYOUT V3 */}
                <div className="flex flex-col md:flex-row-reverse justify-between items-center md:items-start border-b border-[#CE8E94]/20 pb-6 gap-6 md:gap-0">

                    {/* BUTTONS (Mobile: Top, Desktop: Right) */}
                    <div className="flex flex-row gap-3 items-center w-full md:w-auto justify-end">
                        <Button
                            onClick={navigateToHome}
                            className="flex-1 md:flex-none px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl text-sm font-bold hover:bg-gray-100 transition duration-300 flex items-center justify-center gap-2 relative group shadow-sm"
                        >
                            {holidayMode && <SantaHat className="absolute -top-3 -left-2 w-8 h-8 -rotate-[15deg] z-20 transition-all duration-500 group-hover:-rotate-[35deg] group-hover:-translate-y-1" />}
                            <Home className="w-4 h-4" /> <span className="hidden sm:inline">Home</span>
                        </Button>
                        <Button
                            onClick={onLogout}
                            className="flex-1 md:flex-none px-6 py-3 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-red-100 hover:text-red-500 transition duration-300 flex items-center justify-center gap-2 shadow-sm"
                        >
                            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </div>

                    {/* NAME & BADGES (Mobile: Bottom L/R, Desktop: Left Stack) */}
                    <div className="w-full md:w-auto flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start">
                        <h1 className="text-3xl md:text-4xl font-bold text-[#CE8E94] flex items-center gap-3">
                            <User className="w-8 h-8 flex-shrink-0 hidden md:block" />
                            <span className="flex flex-col md:flex-row md:gap-2">
                                <span>Hi,</span>
                                <span>{loggedInUser.firstName}</span>
                            </span>
                        </h1>

                        {/* BADGES ROW */}
                        {SHOW_GAMIFICATION && myBadges.length > 0 && (
                            <div className="flex flex-wrap gap-2 md:mt-3 justify-end md:justify-start animate-in fade-in slide-in-from-left-4 duration-500 max-w-[50%] md:max-w-none">
                                {myBadges.map((badge) => (
                                    <div
                                        key={badge.id}
                                        className={`px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-sm font-bold flex items-center gap-1 md:gap-2 border shadow-sm transition-transform hover:scale-105 select-none cursor-default ${badge.color}`}
                                        title={badge.description}
                                    >
                                        <span className="text-sm md:text-lg leading-none">{badge.icon}</span>
                                        <span className="hidden sm:inline">{badge.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* TABS */}
                <div className="flex justify-center">
                    <div className="bg-white p-1 rounded-full shadow-sm border border-gray-200 inline-flex w-full md:w-auto">
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'upcoming' ? 'bg-[#CE8E94] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Upcoming
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-[#CE8E94] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            History
                        </button>
                    </div>
                </div>

                {activeTab === 'upcoming' ? (
                    <div className="space-y-8 md:space-y-12">
                        {/* ACTIVE BOOKINGS SECTION */}
                        <div className="space-y-6">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-700 flex items-center gap-2 border-b pb-2">
                                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-[#CE8E94]" /> Your Active Bookings ({userBookings.length})
                            </h2>
                            {userBookings.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {userBookings.map((slot, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-white rounded-2xl shadow-md transition border border-[#CE8E94]/20 relative overflow-hidden group hover:border-[#CE8E94]/50">
                                            {slot.bookedBy?.includes('(Admin)') && (
                                                <div className="absolute top-0 right-0 bg-blue-50 px-3 py-1 rounded-bl-xl text-[10px] font-bold text-blue-600 flex items-center gap-1 border-b border-l border-blue-100">
                                                    <ShieldCheck className="w-3 h-3" /> Confirmed
                                                </div>
                                            )}
                                            <div className="space-y-3 w-full sm:w-auto">
                                                <div className="space-y-1">
                                                    <span className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                                        <Clock className="w-5 h-5 text-[#CE8E94]" /> {slot.time}
                                                    </span>
                                                    <span className="text-sm text-gray-500 block ml-7 font-medium">{formatDateDisplay(slot.date)}</span>
                                                </div>

                                                {/* Calendar Buttons */}
                                                <div className="flex gap-2 ml-7">
                                                    <Button
                                                        className="h-7 text-xs px-2 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm transition-transform active:scale-95"
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
                                                        className="h-7 text-xs px-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 shadow-sm transition-transform active:scale-95"
                                                        onClick={() => {
                                                            const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nURL:${window.location.origin}\nDTSTART:${slot.date.replace(/-/g, '')}T${slot.time.replace(':', '')}00\nDTEND:${slot.date.replace(/-/g, '')}T${parseInt(slot.time.split(':')[0]) + 1}${slot.time.split(':')[1]}00\nSUMMARY:Pilates Session\nDESCRIPTION:Reformer Pilates Malta Session\nLOCATION:Reformer Pilates Malta\nEND:VEVENT\nEND:VCALENDAR`;
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
                                                className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg mt-4 sm:mt-0 text-xs font-bold transition-colors"
                                            >
                                                Contact
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="p-6 bg-yellow-50 border border-yellow-200 rounded-2xl text-gray-600 text-center font-medium shadow-sm">
                                    You have no active bookings. Time to hit the mat!
                                </p>
                            )}
                        </div>

                        {/* --- ENGAGEMENT SECTION (GAMIFICATION) --- */}
                        {SHOW_GAMIFICATION && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {/* Stats Card */}
                                <div className="bg-gradient-to-br from-white to-gray-50 p-6 md:p-8 rounded-[2rem] border border-white shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                                    <div className="z-10 relative">
                                        <h3 className="text-gray-400 text-xs md:text-sm font-black uppercase tracking-widest mb-2">Total Sessions</h3>
                                        <div className="text-5xl md:text-6xl font-black text-gray-800 font-sans tracking-tight">{completedCount}</div>
                                        <p className="text-xs md:text-sm text-green-600 font-bold mt-3 flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full w-fit">
                                            <Activity className="w-3 h-3 md:w-4 md:h-4" /> Keep moving!
                                        </p>
                                    </div>
                                    <div className="w-20 h-20 md:w-24 md:h-24 bg-[#CE8E94]/10 rounded-full flex items-center justify-center text-[#CE8E94] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                                        <Trophy className="w-10 h-10 md:w-12 md:h-12" />
                                    </div>
                                    {/* Decorative bg blobs */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#CE8E94]/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-150 duration-700"></div>
                                </div>

                                {/* Wellness Tip Card (Light Theme) */}
                                <div className="bg-[#FFF5F0] border border-[#CE8E94]/20 p-6 md:p-8 rounded-[2rem] shadow-sm relative overflow-hidden text-[#CE8E94] group hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[200px]">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 opacity-80 mb-4">
                                            <div className="p-1.5 bg-[#CE8E94]/10 rounded-full">
                                                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-[#CE8E94]" />
                                            </div>
                                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#CE8E94]">Daily Wisdom</span>
                                        </div>
                                        <h4 className="text-lg md:text-2xl font-bold leading-relaxed font-serif italic text-gray-700">
                                            &quot;{dailyTip}&quot;
                                        </h4>
                                    </div>
                                    <div className="relative z-10 mt-6 flex justify-end opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Quote className="w-8 h-8 md:w-10 md:h-10 rotate-180 text-[#CE8E94]" />
                                    </div>

                                    {/* Decorative circles (Subtle) */}
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#CE8E94]/5 rounded-full blur-2xl group-hover:bg-[#CE8E94]/10 transition-colors duration-500"></div>
                                </div>
                            </div>
                        )}

                        {/* BOOKING SECTION */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 pt-4">
                            <div className="lg:col-span-1 space-y-6">
                                <h2 className="text-xl md:text-2xl font-bold text-gray-700 flex items-center gap-2 border-b pb-2">
                                    <Zap className="w-5 h-5 md:w-6 md:h-6 text-[#CE8E94]" /> Book a Class
                                </h2>
                                <div className="h-full">
                                    <BookingCalendar
                                        slots={futureSlots}
                                        onSelectDate={setSelectedDate}
                                        selectedDate={selectedDate}
                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-1 space-y-6">
                                <h3 className="text-lg md:text-xl font-bold text-gray-700 border-b pb-2 flex items-center justify-between">
                                    <span>Available: {formatDateDisplay(selectedDate)}</span>
                                    <span className="text-xs font-normal text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                        {availableSlotsForSelectedDate.length} slots
                                    </span>
                                </h3>
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {availableSlotsForSelectedDate.length > 0 ? (
                                        availableSlotsForSelectedDate.map((slot, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-4 md:p-5 bg-white/60 rounded-2xl hover:bg-white hover:shadow-md transition border border-white/40 hover:border-[#CE8E94]/30 gap-4 group">
                                                <span className="text-lg md:text-xl font-medium text-gray-800 flex items-center gap-3 min-w-0">
                                                    <Clock className="w-5 h-5 text-green-600 transition-transform group-hover:scale-110 flex-shrink-0" />
                                                    <span className="truncate">{slot.time}</span>
                                                </span>
                                                <Button
                                                    onClick={() => handleBookSlot(slot.date, slot.time)}
                                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                                                >
                                                    Book
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-8 bg-red-50/50 border border-red-100 rounded-[2rem] text-center space-y-2">
                                            <Calendar className="w-8 h-8 text-red-300 mb-2" />
                                            <p className="font-bold text-gray-600">No slots available.</p>
                                            <p className="text-xs text-gray-400">Try selecting another date from the calendar.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <UserHistory slots={slots} userName={userName} userEmail={loggedInUser.email} />
                )}
            </div>

            {/* Footer / Copyright / Version */}
            <div className="text-center pb-8 opacity-30 text-[10px] font-mono hover:opacity-100 transition-opacity cursor-default">
                <p>Reformer Pilates Malta • V44-UI-POLISH</p>
            </div>
        </div>
    );
}
