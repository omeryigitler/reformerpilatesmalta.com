"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/app/components/ui/button';
import { LogOut, Calendar, Users, TrendingUp, Edit3, Star, Award, Mail, Clock, Plus, Trash2, Home, UserPlus, ShieldCheck, ChevronDown, Check, Search, FileText, MessageSquareText, CalendarPlus, User, Sparkles } from 'lucide-react';
import { Switch } from "@/app/components/ui/switch";
import { Slot, UserType, ManagementState } from '../types';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useNotification } from '../context/NotificationContext';
import { useConfirm } from '../context/ConfirmContext';
import { formatDateDisplay, getTodayDate, isPastSlot } from '../utils/helpers';
import { BookingCalendar } from './BookingCalendar';

import { AdminAnalytics } from './AdminAnalytics';
import { FileUploadInput } from './FileUploadInput';
import { Modal } from './Modal';
import { sendUserBookingConfirmation, sendUserCancellationAlert, sendUserRescheduleConfirmation } from '../services/emailService';
import { ErrorBoundary } from './ErrorBoundary';
import { SantaHat } from './ChristmasDecorations';

interface AdminPanelProps {
    loggedInUser: UserType;
    slots: Slot[];
    users: UserType[];
    managementState: ManagementState;
    setManagementState: React.Dispatch<React.SetStateAction<ManagementState>>;
    handleLogout: () => void;
    navigateToHome: () => void;
}

// --- HELPER WRAPPER FOR HIGHLIGHTING ---
const HighlightedText = ({ text, highlight }: { text: string, highlight: string }) => {
    if (!highlight.trim()) {
        return <>{text}</>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);

    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <span key={i} className="bg-yellow-200 text-gray-900 border-b-2 border-yellow-400 animate-pulse font-bold px-0.5 rounded-sm">
                        {part}
                    </span>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
};

export const AdminPanel = ({
    loggedInUser,
    slots,
    users,
    managementState,
    setManagementState,
    handleLogout,
    navigateToHome
}: AdminPanelProps) => {
    const { showNotification } = useNotification();
    const { showConfirm } = useConfirm();
    const [activeTab, setActiveTab] = useState<'bookings' | 'members' | 'management' | 'analytics'>('bookings');

    // --- PAST BOOKING LOGIC ---
    const [pastSlotDate, setPastSlotDate] = useState('');
    const [pastSlotTime, setPastSlotTime] = useState('');

    const handleAddPastSlot = async () => {
        if (!selectedMember || !pastSlotDate || !pastSlotTime) return;

        // Convert DD/MM/YYYY to YYYY-MM-DD
        let dateStr = pastSlotDate;
        if (pastSlotDate.includes('/')) {
            const parts = pastSlotDate.split('/');
            if (parts.length === 3) {
                // Input: DD/MM/YYYY -> Output: YYYY-MM-DD
                dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }

        // Validate Time (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(pastSlotTime)) {
            showNotification("Invalid time format. Use HH:MM (e.g., 09:30)", "error");
            return;
        }

        // NEW: Ensure this is ACTUALLY a past slot
        if (!isPastSlot(dateStr, pastSlotTime)) {
            showNotification("You can only add actual PAST bookings here. For future slots, use the 'Current Slots' section.", "error");
            return;
        }

        try {
            // Standard ID: date_time
            const slotId = `${dateStr}_${pastSlotTime}`;

            // Just use setDoc which handles both create and update reliably
            await setDoc(doc(db, "slots", slotId), {
                id: slotId,
                date: dateStr,
                time: pastSlotTime,
                status: 'Completed',
                bookedBy: `${selectedMember.firstName} ${selectedMember.lastName}`,
                bookedByEmail: selectedMember.email
            });

            showNotification("Past booking recorded successfully", "success");
            // Reset
            setPastSlotDate('');
            setPastSlotTime('');
        } catch (error) {
            console.error("Error adding past slot", error);
            showNotification("Failed to add past slot", "error");
        }
    };

    const [newSlotTime, setNewSlotTime] = useState('');
    const [newSlotDate, setNewSlotDate] = useState('');

    const [isPastBookingOpen, setIsPastBookingOpen] = useState(false); // Collapsible Past Booking
    // NEW: Date Filter State
    const [dateFilter, setDateFilter] = useState<'All' | 'Today' | 'Week' | 'Month' | 'Custom'>('Today');
    const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [showCustomDateModal, setShowCustomDateModal] = useState(false);

    const [statusFilter, setStatusFilter] = useState<'All' | 'Booked' | 'Completed' | 'Available'>('All');
    const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

    const filteredSlots = useMemo(() => {
        const todayStr = getTodayDate();
        const now = new Date();

        return slots.filter(slot => {
            // 1. Status Filter
            const isActuallyCompleted = slot.status === 'Completed' || isPastSlot(slot.date, slot.time);
            const isActuallyActive = (slot.status === 'Booked' || slot.status === 'Active') && !isActuallyCompleted;

            let statusMatch = true;
            if (statusFilter === 'All') statusMatch = true;
            else if (statusFilter === 'Booked') statusMatch = isActuallyActive;
            else if (statusFilter === 'Completed') statusMatch = isActuallyCompleted;
            else statusMatch = slot.status === statusFilter && !isActuallyCompleted;

            // 2. Date Filter
            let dateMatch = true;
            const slotDate = slot.date;

            if (dateFilter === 'All') dateMatch = true;
            else if (dateFilter === 'Today') dateMatch = slotDate === todayStr;
            else if (dateFilter === 'Week') {
                const sDate = new Date(slotDate);
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay() + 1);
                startOfWeek.setHours(0, 0, 0, 0);
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);
                dateMatch = sDate >= startOfWeek && sDate <= endOfWeek;
            }
            else if (dateFilter === 'Month') {
                dateMatch = slotDate.substring(0, 7) === todayStr.substring(0, 7);
            }
            else if (dateFilter === 'Custom') {
                if (customStartDate && customEndDate) {
                    dateMatch = slotDate >= customStartDate && slotDate <= customEndDate;
                }
            }

            return statusMatch && dateMatch;
        });
    }, [slots, statusFilter, dateFilter, customStartDate, customEndDate]);

    const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
    const [editFormData, setEditFormData] = useState({ date: '', time: '' });

    // NEW state for Assigning Slot
    const [assigningSlot, setAssigningSlot] = useState<Slot | null>(null);
    const [selectedUserEmailToAssign, setSelectedUserEmailToAssign] = useState('');

    // NEW CRM States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMember, setSelectedMember] = useState<UserType | null>(null);
    const [memberNotes, setMemberNotes] = useState('');
    const [bookingForMember, setBookingForMember] = useState<UserType | null>(null);
    const [bookingDateFilter, setBookingDateFilter] = useState<'all' | 'today' | 'week'>('today');

    const standardInputClass = "w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 focus:outline-none focus:border-[#CE8E94] focus:bg-white transition placeholder-gray-400 text-gray-700 shadow-sm";

    const [historyViewer, setHistoryViewer] = useState<{ type: 'Total' | 'Active' | 'Done', user: UserType } | null>(null);

    // --- HANDLERS ---
    // Unified Booking Logic
    const performBooking = async (slot: Slot, user: UserType) => {
        const fullName = `${user.firstName} ${user.lastName} `;
        const slotId = `${slot.date}_${slot.time}`;

        // CHECK: Prevent Double Booking
        const isSlotTaken = slots.some(s =>
            s.date === slot.date &&
            s.time === slot.time &&
            (s.status === 'Booked' || s.status === 'Active')
        );

        if (isSlotTaken) {
            showNotification('This slot is already booked! Please refresh or choose another.', 'error');
            return false;
        }

        try {
            // 1. Assign in Firestore
            await setDoc(doc(db, 'slots', slotId), {
                ...slot,
                status: 'Booked',
                bookedBy: `${fullName} (Admin)`,
                bookedByEmail: user.email.trim().toLowerCase()
            });

            // 2. Send Email Notification
            // Check if it's a past slot (Silent Restoration)
            const isPast = isPastSlot(slot.date, slot.time);

            if (!isPast) {
                showNotification('Slot assigned! Sending email...', 'info');
                await sendUserBookingConfirmation(user, slot);
                showNotification(`Slot assigned and email sent to ${user.firstName} !`, 'success');
            } else {
                showNotification(`Slot restored (Completed) without email to ${user.firstName}.`, 'success');
            }

            return true;
        } catch (error) {
            console.error(error);
            showNotification('Slot assigned purely locally (Network Error?)', 'error');
            return true; // Still return true as DB update likely succeeded or we want to clear modal
        }
    };

    const handleAssignSlot = async () => {
        if (!assigningSlot || !selectedUserEmailToAssign) return;
        const userToAssign = users.find(u => u.email.toLowerCase() === selectedUserEmailToAssign.toLowerCase());
        if (!userToAssign) return;

        const success = await performBooking(assigningSlot, userToAssign);
        if (success) {
            setAssigningSlot(null);
            setSelectedUserEmailToAssign('');
        }
    };

    const handleBookForMember = async (slot: Slot) => {
        if (!bookingForMember) return;

        showConfirm(
            `Book ${formatDateDisplay(slot.date)} at ${slot.time} for ${bookingForMember.firstName} ? `,
            async () => {
                const success = await performBooking(slot, bookingForMember);
                if (success) {
                    setBookingForMember(null); // Close modal on success
                }
            },
            "Confirm Booking"
        );
    };
    const handleUpload = (field: keyof ManagementState, file: File) => {
        if (!file) return;
        if (file.size > 800 * 1024) {
            showNotification('Image is too large! Please use an image under 800KB.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setManagementState(prev => ({ ...prev, [field]: base64String }));
        };
        reader.onerror = () => {
            showNotification('Failed to read file.', 'error');
        };
        reader.readAsDataURL(file);
    };

    const handleCampaignImage = (index: number, file: File) => {
        if (!file) return;
        if (file.size > 800 * 1024) {
            showNotification('Image is too large! Please use an image under 800KB.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setManagementState(prev => {
                const newCamps = [...prev.campaigns];
                newCamps[index] = { ...newCamps[index], image: base64String };
                return { ...prev, campaigns: newCamps };
            });
        };
        reader.onerror = () => {
            showNotification('Failed to read file.', 'error');
        };
        reader.readAsDataURL(file);
    };

    const handleSaveManagement = async () => {
        try {
            await setDoc(doc(db, "management", "settings"), managementState);
            showNotification('Site Settings Saved!', 'success');
        } catch (e) {
            console.error(e);
            showNotification('Error saving settings', 'error');
        }
    };

    const handleDeleteUser = (email: string) => {
        const userToDelete = users.find(u => u.email === email);
        if (!userToDelete) return;

        showConfirm(
            `Are you sure you want to delete the user: ${userToDelete.firstName} ${userToDelete.lastName} (${email})?`,
            async () => {
                try {
                    await deleteDoc(doc(db, "users", email));
                    showNotification(`User ${email} deleted.`, 'success');
                    if (selectedMember?.email === email) {
                        setSelectedMember(null);
                    }
                } catch (e) {
                    showNotification('Error deleting user', 'error');
                }
            },
            `Confirm User Deletion`
        );
    };

    // CRM HANDLERS
    const handleUpdateAdminNotes = async () => {
        if (!selectedMember) return;
        try {
            await updateDoc(doc(db, 'users', selectedMember.email), {
                adminNotes: memberNotes
            });

            // Force update local state to reflect change immediately
            setSelectedMember({ ...selectedMember, adminNotes: memberNotes });

            showNotification('Notes saved successfully!', 'success');
        } catch (error) {
            console.error(error);
            showNotification('Error saving notes', 'error');
        }
    };

    const handleSendWhatsApp = (phone: string, firstName: string) => {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (!cleanPhone) {
            showNotification('Invalid phone number', 'error');
            return;
        }
        const message = `Hi ${firstName}, regarding your Pilates sessions...`;
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleSendEmail = (email: string) => {
        window.open(`mailto:${email}`, '_blank');
    };

    const getMemberStats = (email: string) => {
        // Robust check for member stats based on email and name fallback
        const user = users.find(u => u.email === email);
        if (!user) return { total: 0, active: 0, completed: 0, history: [] };

        const fullName = `${user.firstName} ${user.lastName}`;
        const mySlots = slots.filter(s =>
            s.bookedByEmail === email ||
            (s.bookedByEmail === null && s.bookedBy && s.bookedBy.includes(fullName))
        );

        return {
            total: mySlots.length,
            active: mySlots.filter(s => (s.status === 'Booked' || s.status === 'Active') && !isPastSlot(s.date, s.time)).length,
            completed: mySlots.filter(s => s.status === 'Completed' || ((s.status === 'Booked' || s.status === 'Active') && isPastSlot(s.date, s.time))).length,
            history: mySlots.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Newest first
        };
    };

    const getMemberBadges = (user: UserType, stats: { total: number }) => {
        const badges = [];
        const regDate = new Date(user.registered);
        const daysSinceReg = (new Date().getTime() - regDate.getTime()) / (1000 * 3600 * 24);

        if (daysSinceReg < 7) badges.push({ label: 'New', color: 'bg-blue-100 text-blue-600' });
        if (stats.total > 10) badges.push({ label: 'VIP', color: 'bg-yellow-100 text-yellow-700' });
        if (stats.total === 0 && daysSinceReg > 30) badges.push({ label: 'Inactive', color: 'bg-gray-100 text-gray-500' });

        return badges;
    };

    // Filter Users
    const filteredUsers = users.filter(user => {
        const search = searchTerm.toLowerCase();
        return (
            user.firstName.toLowerCase().includes(search) ||
            user.lastName.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search)
        );
    });

    const handleToggleSlotStatus = async (slotDate: string, slotTime: string) => {
        const slot = slots.find(s => s.date === slotDate && s.time === slotTime);
        if (!slot) return;

        // If a slot is 'Available', toggling it means it becomes 'Booked' by admin (for private use or blocking)
        // If it's 'Booked' by admin, toggling it means it becomes 'Available' again.
        // This assumes the toggle is for admin to temporarily block/unblock a slot.
        const newStatus = slot.status === 'Available' ? 'Booked' : 'Available';
        const newBookedBy = newStatus === 'Booked' ? `Admin Action - ${loggedInUser?.firstName}` : null;
        const newBookedByEmail = newStatus === 'Booked' ? loggedInUser?.email : null;

        try {
            await updateDoc(doc(db, "slots", `${slotDate}_${slotTime}`), {
                status: newStatus,
                bookedBy: newBookedBy,
                bookedByEmail: newBookedByEmail
            });
            showNotification(`Slot is now ${newStatus === 'Available' ? 'AVAILABLE' : 'BOOKED (Admin)'}.`, 'info');
        } catch (e) {
            showNotification('Error toggling status', 'error');
        }
    };

    const handleDeleteSlot = async (slot: Slot) => {
        showConfirm(
            "Are you sure you want to delete this slot? This action cannot be undone.",
            async () => {
                try {
                    // Check if slot is occupied (Booked/Available) to notify user
                    const isOccupied = slot.status === 'Booked' || slot.status === 'Available';
                    const isPast = isPastSlot(slot.date, slot.time);

                    // Only send email if occupied AND in the future
                    if (isOccupied && !isPast) {
                        // Attempt to find user to notify using robust matching
                        const bookedName = slot.bookedBy ? slot.bookedBy.replace(' (Admin)', '').trim().toLowerCase() : '';

                        const userToNotify = users.find(u => {
                            if (slot.bookedByEmail) return u.email.toLowerCase() === slot.bookedByEmail.toLowerCase();
                            const fullName = `${u.firstName} ${u.lastName}`.trim().toLowerCase();
                            return fullName === bookedName;
                        });

                        if (userToNotify) {
                            showNotification(`Notifying ${userToNotify.firstName} of cancellation...`, 'info');
                            await sendUserCancellationAlert(userToNotify, slot, 'Admin Deleted Slot');
                        }
                    }

                    // Attempt to delete ALL possible ID variations to ensure cleanup
                    const possibleIds = [
                        `${slot.date}_${slot.time}`,       // Standard
                        `${slot.date}_${slot.time} `,      // Trailing space bug
                        `${slot.date}-${slot.time}`        // Legacy format
                    ];

                    await Promise.all(possibleIds.map(id => deleteDoc(doc(db, "slots", id))));
                    showNotification("Slot deleted successfully", "success");
                } catch (error) {
                    console.error("Error deleting slot:", error);
                    showNotification("Failed to delete slot", "error");
                }
            },
            "Delete Slot",
            undefined,
            "Delete",
            true
        );
    };



    const handleAddSlot = async () => {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/; // Strict 24h format

        if (!newSlotTime || !timeRegex.test(newSlotTime.trim())) {
            showNotification('Please enter a valid 24-hour time (e.g., 14:30 or 09:00).', 'error');
            return;
        }
        if (!newSlotDate) {
            showNotification('Please select a date for the slot.', 'error');
            return;
        }

        // NEW: Check if the slot is in the past or is the current time
        if (isPastSlot(newSlotDate, newSlotTime.trim())) {
            showNotification('You cannot add a slot in the past or for the current time.', 'error');
            return;
        }

        if (slots.some(s => s.date === newSlotDate && s.time.toLowerCase() === newSlotTime.trim().toLowerCase())) {
            showNotification(`A slot for ${newSlotDate} at ${newSlotTime.trim()} already exists.`, 'error');
            return;
        }

        const normalizedTime = newSlotTime.trim();
        // Enforce YYYY-MM-DD format strictly
        const normalizedDate = new Date(newSlotDate).toISOString().split('T')[0];

        const newSlot: Slot = { date: normalizedDate, time: normalizedTime, status: 'Available', bookedBy: null, bookedByEmail: null };
        try {
            await setDoc(doc(db, "slots", `${normalizedDate}_${normalizedTime}`), newSlot);
            setNewSlotTime('');
            showNotification('New slot added!', 'success');
        } catch (e) {
            showNotification('Error adding slot', 'error');
        }
    };

    const handleUpdateSlot = async () => {
        if (!editingSlot) return;

        // Convert DD/MM/YYYY to YYYY-MM-DD
        let dateToSave = editFormData.date;
        if (editFormData.date.includes('/')) {
            const parts = editFormData.date.split('/');
            if (parts.length === 3) {
                // Input: DD/MM/YYYY -> Output: YYYY-MM-DD
                dateToSave = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }

        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!editFormData.time || !timeRegex.test(editFormData.time.trim())) {
            showNotification('Please enter a valid 24-hour time (e.g. 14:30).', 'error');
            return;
        }
        if (!dateToSave || dateToSave.length !== 10) {
            showNotification('Please enter a valid date (DD/MM/YYYY).', 'error');
            return;
        }

        // NEW: Check if the new time/date is in the past or current time
        if (isPastSlot(dateToSave, editFormData.time.trim())) {
            showNotification('You cannot move a slot to the past or the current time.', 'error');
            return;
        }

        const isCollision = slots.some(s =>
            s.date === dateToSave &&
            s.time.toLowerCase() === editFormData.time.trim().toLowerCase() &&
            !(s.date === editingSlot.date && s.time === editingSlot.time) &&
            (s.status === 'Booked' || s.status === 'Available' || s.status === 'Completed')
        );

        if (isCollision) {
            showNotification(`A slot for ${editFormData.date} at ${editFormData.time} already exists.`, 'error');
            return;
        }

        try {
            if (editingSlot.date !== dateToSave || editingSlot.time !== editFormData.time.trim()) {
                const isOccupied = editingSlot.status === 'Booked' || editingSlot.status === 'Available' || editingSlot.status === 'Completed';

                if (isOccupied) {
                    // 1. CLEAR OLD SLOT (Both formats for safety)
                    await deleteDoc(doc(db, "slots", `${editingSlot.date}_${editingSlot.time}`));
                    await deleteDoc(doc(db, "slots", `${editingSlot.date}-${editingSlot.time}`));

                    // 2. Re-create old slot as Available (Underscore format only)
                    await setDoc(doc(db, "slots", `${editingSlot.date}_${editingSlot.time}`), {
                        date: editingSlot.date,
                        time: editingSlot.time,
                        status: 'Available',
                        bookedBy: null,
                        bookedByEmail: null
                    });

                    // 3. Create/Update the NEW slot with existing booking info
                    const newSlot: Slot = { ...editingSlot, date: dateToSave, time: editFormData.time.trim() };
                    await setDoc(doc(db, "slots", `${newSlot.date}_${newSlot.time}`), newSlot);

                    // Standardized User Matching
                    const bookedByEmail = editingSlot.bookedByEmail ? editingSlot.bookedByEmail.trim().toLowerCase() : '';
                    const bookedByName = editingSlot.bookedBy ? editingSlot.bookedBy.replace(' (Admin)', '').trim().toLowerCase() : '';

                    const user = users.find(u => {
                        // Priority 1: Email Match (Unique ID)
                        if (bookedByEmail && u.email.trim().toLowerCase() === bookedByEmail) return true;

                        // Priority 2: Fallback to Name Match (Legacy support)
                        const uName = `${u.firstName} ${u.lastName}`.trim().toLowerCase();
                        return !bookedByEmail && uName === bookedByName;
                    });

                    if (user) {
                        showNotification(`Booking moved. Notifying ${user.firstName}...`, 'info');
                        await sendUserRescheduleConfirmation(user, newSlot);
                    } else {
                        showNotification('Slot updated locally (User not found for email sync)', 'info');
                    }
                } else {
                    // Not Occupied -> Just move available slot
                    await deleteDoc(doc(db, "slots", `${editingSlot.date}_${editingSlot.time}`));
                    const newSlot: Slot = { ...editingSlot, date: dateToSave, time: editFormData.time.trim() };
                    await setDoc(doc(db, "slots", `${newSlot.date}_${newSlot.time}`), newSlot);
                }
            }

            setEditingSlot(null);
            showNotification('Slot updated successfully!', 'success');
        } catch (e) {
            console.error(e);
            showNotification('Error updating slot', 'error');
        }
    };


    const openEditSlotModal = (slot: Slot) => {
        setEditingSlot(slot);
        // Format YYYY-MM-DD -> DD/MM/YYYY for manual input
        let formattedDate = slot.date;
        if (slot.date.includes('-')) {
            const [y, m, d] = slot.date.split('-');
            formattedDate = `${d}/${m}/${y}`;
        }
        setEditFormData({ date: formattedDate, time: slot.time });
    };
    return <div className="pilates-root min-h-screen flex flex-col items-center p-4 md:p-10 space-y-10 font-sans bg-[#FFF0E5]">
        <div className="w-full max-w-7xl px-8 md:px-16 py-10 bg-white/60 backdrop-blur-md rounded-[3rem] shadow-2xl border border-white/50 space-y-12">
            {/* ... header ... */}


            <div className="flex justify-between items-start md:items-center border-b border-[#CE8E94]/20 pb-6">
                <h1 className="text-4xl font-bold text-[#CE8E94] flex items-center gap-3">
                    Admin Panel
                </h1>
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <Button
                        onClick={navigateToHome}
                        className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl text-sm font-bold hover:bg-gray-100 transition duration-300 flex items-center gap-2 w-full sm:w-auto justify-center relative group"
                    >
                        {managementState.holidayMode && <SantaHat className="absolute -top-4 -left-3 w-8 h-8 -rotate-[15deg] z-20 transition-all duration-500 group-hover:-rotate-[35deg] group-hover:-translate-y-1" />}
                        <Home className="w-4 h-4" /> Home
                    </Button>
                    <Button
                        onClick={handleLogout}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-red-100 hover:text-red-500 transition duration-300 flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                        <LogOut className="w-4 h-4" /> Logout
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 w-full max-w-4xl mx-auto">
                {(['bookings', 'members', 'analytics', 'management'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 border-2 ${activeTab === tab ? 'bg-white border-[#CE8E94] shadow-lg scale-105' : 'bg-white/50 border-transparent hover:bg-white hover:shadow-md'}`}
                    >
                        <div className={`p-3 rounded-full mb-2 ${activeTab === tab ? 'bg-[#CE8E94] text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {tab === 'bookings' && <Calendar className="w-6 h-6" />}
                            {tab === 'members' && <Users className="w-6 h-6" />}
                            {tab === 'analytics' && <TrendingUp className="w-6 h-6" />}
                            {tab === 'management' && <Edit3 className="w-6 h-6" />}
                        </div>
                        <span className={`font-bold capitalize ${activeTab === tab ? 'text-[#CE8E94]' : 'text-gray-500'}`}>{tab}</span>
                    </button>
                ))}
            </div>

            {
                activeTab === 'analytics' && (
                    <ErrorBoundary>
                        <AdminAnalytics slots={slots} users={users} currentLogo={managementState.logo} />
                    </ErrorBoundary>
                )
            }

            {
                activeTab === 'management' && (
                    <div className="space-y-10 p-6 md:p-8 rounded-[2rem] bg-white/50 border border-white/40">
                        {/* Holiday Mode Toggle */}
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-[#CE8E94]/20 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#CE8E94]/10 rounded-2xl text-[#CE8E94] group-hover:bg-[#CE8E94] group-hover:text-white transition-colors">
                                    <Sparkles className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Holiday Mode 🎄❄️</h3>
                                    <p className="text-sm text-gray-500">Enable Christmas decorations and snowfall across the site.</p>
                                </div>
                            </div>
                            <Switch
                                checked={managementState.holidayMode}
                                onCheckedChange={async (val) => {
                                    setManagementState(prev => ({ ...prev, holidayMode: val }));
                                    try {
                                        await updateDoc(doc(db, "management", "settings"), { holidayMode: val });
                                    } catch (e) {
                                        console.error("Error auto-saving holiday mode:", e);
                                    }
                                }}
                                className="data-[state=checked]:bg-[#CE8E94]"
                            />
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3 border-b pb-2"><Edit3 className="w-6 h-6 text-[#CE8E94]" /> Hero Section Content</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-600 mb-2">Main Title</label>
                                    <input
                                        type="text"
                                        value={managementState.heroTitle}
                                        onChange={e => setManagementState(prev => ({ ...prev, heroTitle: e.target.value }))}
                                        className={standardInputClass}
                                    />
                                    <label className="block text-sm font-bold text-gray-600 pt-4 mb-2">Subtitle</label>
                                    <input
                                        type="text"
                                        value={managementState.heroSubtitle}
                                        onChange={e => setManagementState(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                                        className={standardInputClass}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <FileUploadInput
                                        label="Hero Image"
                                        previewUrl={managementState.heroImage}
                                        onChange={(file) => handleUpload('heroImage', file)}
                                    />
                                    <FileUploadInput
                                        label="Logo Image"
                                        previewUrl={managementState.logo}
                                        onChange={(file) => handleUpload('logo', file)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold my-6 text-gray-800 flex items-center gap-3 border-b pb-2"><Star className="w-6 h-6 text-[#CE8E94]" /> Trust Signals</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {managementState.trustSignals.map((signal, idx) => (
                                    <div key={idx} className="p-4 bg-white rounded-xl shadow-sm space-y-3 border border-gray-100">
                                        <h4 className="text-lg font-bold text-[#CE8E94]">Signal {idx + 1}</h4>
                                        <input
                                            type="text"
                                            placeholder="Title"
                                            value={signal.title}
                                            onChange={e => setManagementState(prev => {
                                                const newSignals = [...prev.trustSignals];
                                                newSignals[idx] = { ...newSignals[idx], title: e.target.value };
                                                return { ...prev, trustSignals: newSignals };
                                            })}
                                            className={standardInputClass}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Subtitle"
                                            value={signal.sub}
                                            onChange={e => setManagementState(prev => {
                                                const newSignals = [...prev.trustSignals];
                                                newSignals[idx] = { ...newSignals[idx], sub: e.target.value };
                                                return { ...prev, trustSignals: newSignals };
                                            })}
                                            className={standardInputClass}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold my-6 text-gray-800 flex items-center gap-3 border-b pb-2"><Award className="w-6 h-6 text-[#CE8E94]" /> Campaigns</h3>
                            <div className="space-y-6">
                                {managementState.campaigns.map((camp, idx) => (
                                    <div key={idx} className="p-6 bg-white rounded-xl shadow-md space-y-4 border border-gray-100">
                                        <h4 className="text-xl font-bold text-[#CE8E94]">Campaign {idx + 1}</h4>
                                        <input
                                            type="text"
                                            placeholder="Title"
                                            value={camp.title}
                                            onChange={e => setManagementState(prev => {
                                                const newCamps = [...prev.campaigns];
                                                newCamps[idx] = { ...newCamps[idx], title: e.target.value };
                                                return { ...prev, campaigns: newCamps };
                                            })}
                                            className={standardInputClass}
                                        />
                                        <textarea
                                            placeholder="Description"
                                            rows={3}
                                            value={camp.description}
                                            onChange={e => setManagementState(prev => {
                                                const newCamps = [...prev.campaigns];
                                                newCamps[idx] = { ...newCamps[idx], description: e.target.value };
                                                return { ...prev, campaigns: newCamps };
                                            })}
                                            className={standardInputClass}
                                        />
                                        <FileUploadInput
                                            label="Campaign Image"
                                            previewUrl={camp.image}
                                            onChange={(file) => handleCampaignImage(idx, file)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold my-6 text-gray-800 flex items-center gap-3 border-b pb-2"><Mail className="w-6 h-6 text-[#CE8E94]" /> Contact & Social</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-600 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={managementState.contactInfo.email}
                                        onChange={e => setManagementState(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, email: e.target.value } }))}
                                        className={standardInputClass}
                                    />
                                    <label className="block text-sm font-bold text-gray-600 pt-4 mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={managementState.contactInfo.phone}
                                        onChange={e => setManagementState(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, phone: e.target.value } }))}
                                        className={standardInputClass}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-600 mb-2">Facebook URL</label>
                                    <input
                                        type="url"
                                        value={managementState.socialLinks.facebook}
                                        onChange={e => setManagementState(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, facebook: e.target.value } }))}
                                        className={standardInputClass}
                                    />
                                    <label className="block text-sm font-bold text-gray-600 pt-4 mb-2">Instagram URL</label>
                                    <input
                                        type="url"
                                        value={managementState.socialLinks.instagram}
                                        onChange={e => setManagementState(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, instagram: e.target.value } }))}
                                        className={standardInputClass}
                                    />
                                    <label className="block text-sm font-bold text-gray-600 pt-4 mb-2">X/Twitter URL</label>
                                    <input
                                        type="url"
                                        value={managementState.socialLinks.x}
                                        onChange={e => setManagementState(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, x: e.target.value } }))}
                                        className={standardInputClass}
                                    />
                                </div>
                            </div>
                        </div>



                        <div className="flex justify-end pt-6 items-center">
                            <Button onClick={handleSaveManagement} className="bg-[#CE8E94] hover:bg-[#B57A80] text-white py-6 px-8 rounded-xl text-lg shadow-xl shadow-[#CE8E94]/20 font-bold transform hover:scale-105 transition-all">
                                Save Changes
                            </Button>
                        </div>
                    </div>
                )
            }

            {activeTab === 'bookings' && (
                <div className="space-y-10 p-6 md:p-8 rounded-[2rem] bg-white/50 border border-white/40">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3 border-b pb-2"><Clock className="w-6 h-6 text-[#CE8E94]" /> Class Schedule Management</h3>

                    <h4 className="text-xl font-bold text-[#CE8E94] mb-4">Add New Slot</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="lg:col-span-1 space-y-4 h-full">
                            <BookingCalendar
                                slots={slots}
                                onSelectDate={setNewSlotDate}
                                selectedDate={newSlotDate}
                            />
                        </div>
                        <div className="lg:col-span-1 flex flex-col justify-between space-y-6 bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-white/50 h-full">
                            {/* Fixed Height Header Area to prevent Jumping */}
                            <div className="h-[88px] flex flex-col justify-center space-y-2 mb-2">
                                <label className="text-sm font-bold text-gray-600 block">Selected Date</label>
                                {newSlotDate ? (
                                    <div className="text-2xl font-bold text-gray-800 text-center">
                                        {formatDateDisplay(newSlotDate)}
                                    </div>
                                ) : (
                                    <div className="h-12 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 px-4 text-gray-400">
                                        <Calendar className="w-5 h-5 text-gray-300" />
                                        <span className="text-sm font-medium text-gray-300">Select date from calendar</span>
                                    </div>
                                )}
                            </div>

                            {/* Quick Time Selection Grid */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-600">
                                    Quick Time Select
                                </label>
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                    {['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map(time => {
                                        const isTaken = slots.some(s => s.date === newSlotDate && s.time === time && (s.status === 'Booked' || s.status === 'Available' || s.status === 'Completed'));
                                        return (
                                            <button
                                                key={time}
                                                disabled={isTaken}
                                                onClick={() => setNewSlotTime(time)}
                                                className={`
                                                        py-2 px-1 text-sm font-bold rounded-lg transition-all duration-200 border
                                                        ${isTaken
                                                        ? 'bg-red-50 text-red-400 border-red-100 cursor-not-allowed opacity-60'
                                                        : newSlotTime === time
                                                            ? 'bg-[#CE8E94] text-white border-[#CE8E94] shadow-md transform scale-105'
                                                            : 'bg-white text-gray-600 border-gray-200 hover:border-[#CE8E94] hover:text-[#CE8E94]'
                                                    }
                                                    `}
                                            >
                                                {time}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2 relative">
                                <label className="text-sm font-bold text-gray-600">Custom Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="e.g., 14:30 or 09:00"
                                        value={newSlotTime}
                                        onChange={e => setNewSlotTime(e.target.value)}
                                        className={`${standardInputClass} block text-lg py-4 pl-12`}
                                    />
                                </div>
                                <p className="text-xs text-gray-400">Type manually for custom times (24-hour format, e.g. 14:30)</p>
                            </div>

                            <div className="mt-auto">

                                <Button
                                    onClick={handleAddSlot}
                                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-md transition-colors text-lg flex items-center justify-center"
                                >
                                    <Plus className="w-6 h-6 mr-2" /> Add Slot
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 mt-10">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2">
                            <h4 className="text-xl font-bold text-gray-700">Current Slots ({filteredSlots.length})</h4>
                            <div className="flex flex-col md:flex-row gap-3 w-full sm:w-auto">
                                {/* Date Filter Dropdown */}
                                <div className="relative w-full sm:w-[200px] group">
                                    <button
                                        onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                                        className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 font-bold border border-gray-100 rounded-xl px-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#CE8E94]/20"
                                    >
                                        <span className="text-gray-800 truncate">
                                            {dateFilter === 'Custom' && customStartDate ? 'Custom Range' : dateFilter === 'All' ? 'All Dates' : dateFilter}
                                        </span>
                                        <Calendar className={`w-4 h-4 text-gray-400 transition-transform duration-300 group-hover:text-[#CE8E94] flex-shrink-0 ml-2 ${isDateFilterOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isDateFilterOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsDateFilterOpen(false)} />
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                                                {(['All', 'Today', 'Week', 'Month', 'Custom'] as const).map((option) => (
                                                    <div
                                                        key={option}
                                                        onClick={() => {
                                                            if (option === 'Custom') {
                                                                setShowCustomDateModal(true);
                                                                setIsDateFilterOpen(false);
                                                            } else {
                                                                setDateFilter(option);
                                                                setIsDateFilterOpen(false);
                                                            }
                                                        }}
                                                        className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors duration-200
                                                                ${dateFilter === option && option !== 'Custom'
                                                                ? 'bg-[#CE8E94]/10 text-[#CE8E94] font-bold'
                                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        <span className="text-sm">{option === 'All' ? 'All Dates' : option}</span>
                                                        {dateFilter === option && option !== 'Custom' && <Check className="w-4 h-4 text-[#CE8E94]" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Status Filter Dropdown */}
                                <div className="relative w-full sm:w-[200px] group">
                                    <button
                                        onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
                                        className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 font-bold border border-gray-100 rounded-xl px-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#CE8E94]/20"
                                    >
                                        <span className="text-gray-800 truncate">
                                            {statusFilter === 'All' ? 'All Statuses' : statusFilter === 'Completed' ? 'Completed Only' : statusFilter === 'Available' ? 'Available Only' : 'Booked Only'}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 group-hover:text-[#CE8E94] flex-shrink-0 ml-2 ${isStatusFilterOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isStatusFilterOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsStatusFilterOpen(false)} />
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                                                {(['All', 'Booked', 'Available', 'Completed'] as const).map((option) => (
                                                    <div
                                                        key={option}
                                                        onClick={() => {
                                                            setStatusFilter(option);
                                                            setIsStatusFilterOpen(false);
                                                        }}
                                                        className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors duration-200
                                                                ${statusFilter === option
                                                                ? 'bg-[#CE8E94]/10 text-[#CE8E94] font-bold'
                                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        <span className="text-sm">
                                                            {option === 'All' ? 'All Statuses' : option === 'Completed' ? 'Completed Only' : option === 'Available' ? 'Available Only' : 'Booked Only'}
                                                        </span>
                                                        {statusFilter === option && <Check className="w-4 h-4 text-[#CE8E94]" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredSlots.length === 0 ? (
                                <div className="text-center py-12 text-gray-400 italic">No slots found matching your filters.</div>
                            ) : (
                                Object.entries(
                                    filteredSlots.reduce((groups, slot) => {
                                        if (!groups[slot.date]) groups[slot.date] = [];
                                        groups[slot.date].push(slot);
                                        return groups;
                                    }, {} as Record<string, Slot[]>)
                                )
                                    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                                    .map(([date, slotsForDate]) => (
                                        <div key={date} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                                            {/* Date Header */}
                                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                                <div className="bg-[#CE8E94]/10 text-[#CE8E94] p-3 rounded-xl">
                                                    <Calendar className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-800">
                                                        {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                                    </h3>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{slotsForDate.length} Slots</p>
                                                </div>
                                            </div>

                                            {/* Compact Slots Grid */}
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                                {slotsForDate
                                                    .sort((a, b) => {
                                                        // Custom sort to handle AM/PM correctly if needed, but lexicographical is usually okay for 24h or consistent format. 
                                                        // Assuming format is consistent. Simple string compare for now.
                                                        // Actually, let's try to be smart about time sorting if formats vary.
                                                        return a.time.localeCompare(b.time);
                                                    })
                                                    .map((slot, idx) => (
                                                        <div key={idx} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-gray-100 hover:border-[#CE8E94]/30 group">

                                                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                                                <div className="text-2xl font-black text-gray-700 w-24 text-center sm:text-left">{slot.time}</div>

                                                                <div className="h-10 w-px bg-gray-200 hidden sm:block"></div>

                                                                <div className="flex flex-col items-center sm:items-start flex-1">
                                                                    <div className={`rounded-full font-bold shadow-sm transition-all duration-200 px-3 py-1.5 text-xs ${(isPastSlot(slot.date, slot.time) || slot.status === 'Completed')
                                                                            ? 'bg-gray-400 text-white'
                                                                            : slot.bookedBy
                                                                                ? 'bg-indigo-500 text-white'
                                                                                : slot.status === 'Available'
                                                                                    ? 'bg-emerald-500 text-white'
                                                                                    : 'bg-sky-400 text-white' // Passive state
                                                                        }`}>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <div className={`w-1 h-1 rounded-full bg-white opacity-80`} />
                                                                            {(isPastSlot(slot.date, slot.time) || slot.status === 'Completed')
                                                                                ? 'Completed'
                                                                                : slot.bookedBy
                                                                                    ? 'Booked'
                                                                                    : slot.status === 'Available'
                                                                                        ? 'Available'
                                                                                        : 'Passive'}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 max-w-[150px]">
                                                                        {slot.bookedBy ? (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="truncate text-[15px] font-bold text-gray-900 tracking-tight">
                                                                                    {slot.bookedBy.replace(' (Admin)', '')}
                                                                                </span>
                                                                                {slot.bookedBy.includes('(Admin)') && (
                                                                                    <ShieldCheck className="w-4 h-4 text-[#CE8E94] flex-shrink-0" />
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-gray-400 italic text-xs">No one yet</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Actions Toolbar - Always Visible or on Hover */}
                                                            <div className="flex items-center gap-3 mt-4 sm:mt-0 w-full sm:w-auto justify-center sm:justify-end">
                                                                <Switch
                                                                    checked={slot.status === 'Available'}
                                                                    onCheckedChange={() => handleToggleSlotStatus(slot.date, slot.time)}
                                                                    disabled={isPastSlot(slot.date, slot.time) || ((slot.status === 'Booked' || slot.status === 'Active' || slot.status === 'Completed') && slot.bookedBy !== `Admin Action - ${loggedInUser?.firstName}`)}
                                                                    className="data-[state=checked]:bg-green-500"
                                                                />

                                                                <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
                                                                    {slot.status === 'Available' && !isPastSlot(slot.date, slot.time) && (
                                                                        <button
                                                                            onClick={() => setAssigningSlot(slot)}
                                                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                            title="Assign"
                                                                        >
                                                                            <UserPlus className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => openEditSlotModal(slot)}
                                                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit3 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteSlot(slot)}
                                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>
            )}
            {
                activeTab === 'members' && (
                    <div className="space-y-6 p-6 md:p-8 rounded-[2rem] bg-white/50 border border-white/40">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200/50 pb-6">
                            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3"><Users className="w-6 h-6 text-[#CE8E94]" /> Member Management</h3>
                            <div className="relative w-full md:w-72">
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CE8E94]/20 shadow-sm"
                                />
                                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-12 text-xs font-bold uppercase text-gray-400 pb-2 px-4 gap-4">
                                <div className="col-span-12 md:col-span-5 xl:col-span-4 text-center xl:text-left md:pl-0 xl:pl-2">User info</div>
                                <div className="hidden md:block md:col-span-2 xl:col-span-3 text-center">Status</div>
                                <div className="hidden md:block md:col-span-2 xl:col-span-3 text-center">Stats</div>
                                <div className="hidden md:block md:col-span-3 xl:col-span-2 text-center xl:text-right pr-0 xl:pr-2">Actions</div>
                            </div>

                            <div className="space-y-3">
                                {filteredUsers.map((user, idx) => {
                                    const stats = getMemberStats(user.email);
                                    const badges = getMemberBadges(user, stats);

                                    return (
                                        <div key={idx} className="grid grid-cols-12 items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all group gap-4 relative">
                                            {/* User Info */}
                                            <div className="col-span-12 md:col-span-5 xl:col-span-4 flex flex-col md:flex-row items-center gap-3 md:gap-4 min-w-0 text-center md:text-center xl:text-left md:justify-center xl:justify-start">
                                                <div className={`w-14 h-14 xl:w-16 xl:h-16 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm bg-[#CE8E94]/10 border border-[#CE8E94]/20 shadow-sm text-[#CE8E94]`}>
                                                    <User className="w-7 h-7 xl:w-8 xl:h-8" />
                                                </div>
                                                <div className="min-w-0 flex-1 w-full md:w-auto">
                                                    <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2 mb-0.5 justify-center md:justify-center xl:justify-start">
                                                        <h4 className="font-bold text-gray-800 truncate text-base xl:text-xl font-sans">
                                                            <HighlightedText text={`${user.firstName} ${user.lastName}`} highlight={searchTerm} />
                                                        </h4>
                                                        {user.role === 'admin' && <span className="text-[10px] xl:text-xs font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">ADMIN</span>}
                                                    </div>
                                                    <p className="text-xs xl:text-sm text-gray-500 truncate">
                                                        <HighlightedText text={user.email} highlight={searchTerm} />
                                                    </p>
                                                    {/* Mobile Badges */}
                                                    <div className="flex md:hidden flex-wrap justify-center gap-1 mt-2">
                                                        {badges.map((b, i) => (
                                                            <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded border border-transparent ${b.color}`}>{b.label}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status / Badges (Desktop) */}
                                            <div className="hidden md:flex md:col-span-2 xl:col-span-3 flex-wrap gap-2 items-center justify-center">
                                                {badges.map((b, i) => (
                                                    <span key={i} className={`text-xs xl:text-sm font-bold px-4 py-1.5 xl:px-5 xl:py-2 rounded-full border border-transparent ${b.color}`}>{b.label}</span>
                                                ))}
                                                {user.role !== 'admin' && badges.length === 0 && <span className="text-xs xl:text-sm font-bold px-4 py-1.5 xl:px-5 xl:py-2 rounded-full bg-gray-50 text-gray-400 border border-gray-100">Member</span>}
                                            </div>

                                            {/* Stats (Desktop) */}
                                            <div className="hidden md:block md:col-span-2 xl:col-span-3 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-lg xl:text-3xl font-bold text-gray-700 font-sans">{stats.total}</span>
                                                    <span className="text-[10px] xl:text-xs text-gray-400 uppercase tracking-wider">Bookings</span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="col-span-12 md:col-span-3 xl:col-span-2 flex justify-center md:justify-center xl:justify-end mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                                                <Button
                                                    onClick={() => {
                                                        setSelectedMember(user);
                                                        setMemberNotes(user.adminNotes || '');
                                                    }}
                                                    className="w-full md:w-auto bg-[#CE8E94] hover:bg-[#b57a80] text-white text-xs xl:text-sm font-bold px-6 py-2.5 xl:px-8 xl:py-3 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 font-sans"
                                                >
                                                    Manage
                                                    <ChevronDown className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}

                                {filteredUsers.length === 0 && (
                                    <div className="text-center py-12 text-gray-400">
                                        No members found matching &quot;{searchTerm}&quot;
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                )
            }

            {/* Book For Member Modal (Reverse Flow) */}
            {
                bookingForMember && (
                    <Modal onClose={() => setBookingForMember(null)} showCloseIcon={false}>
                        <div className="space-y-6">
                            <div className="text-center border-b border-gray-100 pb-4">
                                <h2 className="text-xl font-bold text-gray-800">Book for {bookingForMember?.firstName}</h2>
                                <p className="text-xs text-gray-400 mb-3">Select an available slot below</p>

                                <div className="flex justify-center gap-2">
                                    {['today', 'week', 'all'].map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setBookingDateFilter(filter as 'today' | 'week' | 'all')}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${bookingDateFilter === filter
                                                ? 'bg-[#CE8E94] text-white shadow-md'
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                }`}
                                        >
                                            {filter === 'all' ? 'All' : filter === 'today' ? 'Today' : 'This Week'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar">
                                {/* Removed duplicate generic empty check to rely on the specific one below */}

                                {slots
                                    .filter(s => s.status === 'Available')
                                    .filter(s => {
                                        if (bookingDateFilter === 'all') return true;

                                        const todayStr = getTodayDate();
                                        const now = new Date(); // Only used for Week/Time comparision if needed, but 'today' comparison must use standardized string

                                        if (bookingDateFilter === 'today') {
                                            return s.date === todayStr;
                                        }

                                        if (bookingDateFilter === 'week') {
                                            const slotDate = new Date(s.date);  // DEFINE IT
                                            const nextWeek = new Date(now);
                                            nextWeek.setDate(now.getDate() + 7);
                                            return slotDate >= now && slotDate <= nextWeek;
                                        }
                                        return true;
                                    })
                                    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
                                    .map((slot, i) => (
                                        <div key={i} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors px-2">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-lg">{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long' })}</span>
                                                <span className="text-sm text-gray-500">{new Date(slot.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} • {slot.time}</span>
                                            </div>
                                            <Button
                                                onClick={() => handleBookForMember(slot)}
                                                className="bg-[#CE8E94] text-white hover:bg-[#b57a80] rounded-full px-6 py-2 text-xs font-bold transition-transform active:scale-95 shadow-md shadow-[#CE8E94]/20"
                                            >
                                                Book
                                            </Button>
                                        </div>
                                    ))}

                                {slots.filter(s => s.status === 'Available').filter(s => {
                                    if (bookingDateFilter === 'all') return true;
                                    const slotDate = new Date(s.date);
                                    const now = new Date();
                                    const todayStr = now.toISOString().split('T')[0];
                                    if (bookingDateFilter === 'today') return s.date === todayStr;
                                    if (bookingDateFilter === 'week') {
                                        const nextWeek = new Date(now);
                                        nextWeek.setDate(now.getDate() + 7);
                                        return slotDate >= now && slotDate <= nextWeek;
                                    }
                                    return true;
                                }).length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-12 opacity-50">
                                            <Calendar className="w-12 h-12 text-gray-300 mb-2" />
                                            <p className="text-sm font-bold text-gray-400">No available slots found for {bookingDateFilter}.</p>
                                        </div>
                                    )}
                                {/* 7. Delete Actions (Danger Zone) */}
                                <div className="pt-4">
                                    <Button
                                        onClick={() => setBookingForMember(null)}
                                        className="w-full py-4 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl font-bold transition-all"
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )
            }

            {/* Member Details CRM Modal */}
            {
                selectedMember && (
                    <Modal onClose={() => setSelectedMember(null)}>
                        <div className="space-y-4 md:space-y-5 pr-1">

                            <div className="flex flex-col items-center justify-center text-center pb-1">
                                <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase mb-1 font-sans leading-none">{selectedMember?.firstName} {selectedMember?.lastName}</h2>

                                {/* Badge Row */}
                                <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-4 md:mb-6">
                                    {selectedMember?.role === 'admin' && (
                                        <span className="text-xs font-bold px-3 py-1 md:px-5 md:py-2 rounded-full bg-black text-white tracking-widest uppercase shadow-sm">ADMIN</span>
                                    )}
                                    {getMemberBadges(selectedMember!, getMemberStats(selectedMember?.email || '')).map((b, i) => (
                                        <span key={i} className={`text-[10px] md:text-xs font-bold px-3 py-1 md:px-4 md:py-2 rounded-full border border-gray-200 text-gray-600 tracking-widest uppercase bg-gray-50 shadow-sm`}>{b.label}</span>
                                    ))}
                                    {selectedMember?.role !== 'admin' && getMemberBadges(selectedMember!, getMemberStats(selectedMember?.email || '')).length === 0 && (
                                        <span className="text-[10px] md:text-xs font-bold px-3 py-1 md:px-4 md:py-2 rounded-full bg-gray-50 text-gray-400 border border-gray-100 tracking-widest uppercase shadow-sm">MEMBER</span>
                                    )}
                                </div>

                                {/* Symmetrical Contact Info Grid (Compact Mobile & Desktop) */}
                                <div className="grid grid-cols-2 gap-2 md:gap-3 w-full px-1 md:px-2">
                                    <div className="bg-white border-2 border-gray-50 rounded-2xl p-2 md:p-3 flex flex-col items-center justify-center gap-0.5 shadow-sm hover:border-[#CE8E94]/20 transition-colors">
                                        <span className="text-[10px] font-bold text-[#CE8E94] uppercase tracking-widest mb-0.5">Email</span>
                                        <span className="text-xs md:text-sm font-bold text-gray-900 break-all font-sans line-clamp-1">{selectedMember?.email}</span>
                                    </div>
                                    <div className="bg-white border-2 border-gray-50 rounded-2xl p-2 md:p-3 flex flex-col items-center justify-center gap-0.5 shadow-sm hover:border-[#CE8E94]/20 transition-colors">
                                        <span className="text-[10px] font-bold text-[#CE8E94] uppercase tracking-widest mb-0.5">Phone</span>
                                        <span className="text-xs md:text-sm font-bold text-gray-900 font-mono">{selectedMember?.phone || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full h-px bg-gray-100"></div>

                            {/* 2. Stats Row (Interactive & Large) */}
                            {/* 2. Stats Row (Interactive & Large) */}
                            {/* 2. Stats Row (Interactive Boxes) */}
                            <div className="grid grid-cols-3 gap-2 px-1">
                                <button
                                    onClick={() => setHistoryViewer({ type: 'Total', user: selectedMember! })}
                                    className="flex flex-col items-center group cursor-pointer p-2 rounded-xl border border-gray-100 hover:border-[#CE8E94]/50 hover:bg-[#CE8E94]/5 transition-all shadow-sm"
                                >
                                    <div className="text-2xl font-black text-gray-900 group-hover:text-[#CE8E94] transition-colors tracking-tight">{getMemberStats(selectedMember?.email ?? '').total}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-[#CE8E94]">Total</div>
                                </button>

                                <button
                                    onClick={() => setHistoryViewer({ type: 'Active', user: selectedMember! })}
                                    className="flex flex-col items-center group cursor-pointer p-2 rounded-xl border border-gray-100 hover:border-[#CE8E94]/50 hover:bg-[#CE8E94]/5 transition-all shadow-sm"
                                >
                                    <div className="text-2xl font-black text-gray-900 group-hover:text-[#CE8E94] transition-colors tracking-tight">{getMemberStats(selectedMember?.email ?? '').active}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-[#CE8E94]">Active</div>
                                </button>

                                <button
                                    onClick={() => setHistoryViewer({ type: 'Done', user: selectedMember! })}
                                    className="flex flex-col items-center group cursor-pointer p-2 rounded-xl border border-gray-100 hover:border-[#CE8E94]/50 hover:bg-[#CE8E94]/5 transition-all shadow-sm"
                                >
                                    <div className="text-2xl font-black text-gray-300 group-hover:text-[#CE8E94] transition-colors tracking-tight">{getMemberStats(selectedMember?.email ?? '').completed}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-[#CE8E94]">Done</div>
                                </button>
                            </div>

                            {/* 3. Compact Action Grid */}
                            <div className="grid grid-cols-4 gap-2 px-1">
                                {/* 1. WhatsApp (Left - Small) */}
                                {selectedMember?.phone ? (
                                    <div
                                        onClick={() => handleSendWhatsApp(selectedMember.phone, selectedMember.firstName)}
                                        className="col-span-1 bg-[#CE8E94]/5 text-[#CE8E94] p-2 rounded-xl border border-[#CE8E94]/20 hover:bg-[#CE8E94]/10 cursor-pointer flex flex-col items-center justify-center gap-0.5 transition-all"
                                    >
                                        <MessageSquareText className="w-4 h-4" />
                                        <span className="text-[10px] font-bold">WhatsApp</span>
                                    </div>
                                ) : (
                                    <div className="col-span-1 bg-gray-50 text-gray-300 p-2 rounded-xl border border-gray-100 flex flex-col items-center justify-center gap-0.5 cursor-not-allowed">
                                        <MessageSquareText className="w-4 h-4" />
                                        <span className="text-[10px] font-bold">No Phone</span>
                                    </div>
                                )}

                                {/* 2. Book Action (Center - Wide) */}
                                <div
                                    onClick={() => {
                                        setBookingForMember(selectedMember);
                                        setSelectedMember(null);
                                    }}
                                    className="col-span-2 bg-[#CE8E94] text-white p-3 rounded-xl shadow-lg shadow-[#CE8E94]/20 cursor-pointer flex items-center justify-center gap-2 hover:bg-[#b07278] active:scale-95 transition-all"
                                >
                                    <CalendarPlus className="w-5 h-5" />
                                    <div className="font-bold text-sm">Book Class</div>
                                </div>

                                {/* 3. Email (Right - Small) */}
                                <div
                                    onClick={() => handleSendEmail(selectedMember?.email || '')}
                                    className="col-span-1 bg-[#CE8E94]/5 text-[#CE8E94] p-2 rounded-xl border border-[#CE8E94]/20 hover:bg-[#CE8E94]/10 cursor-pointer flex flex-col items-center justify-center gap-0.5 transition-all"
                                >
                                    <Mail className="w-4 h-4" />
                                    <span className="text-[10px] font-bold">Email</span>
                                </div>
                            </div>

                            {/* --- ADD PAST BOOKING ACCORDION --- */}
                            <div className="pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setIsPastBookingOpen(!isPastBookingOpen)}
                                    className="w-full flex items-center justify-between text-sm font-bold text-gray-700 bg-gray-50 p-3 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-[#CE8E94]" />
                                        <span>Add Past Booking</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isPastBookingOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isPastBookingOpen && (
                                    <div className="bg-gray-50 p-3 rounded-xl rounded-t-none space-y-3 animate-in slide-in-from-top-2 fade-in duration-200 border-t border-gray-100/50">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Date (DD/MM/YYYY)</label>
                                                <input
                                                    type="text"
                                                    placeholder="(DD/MM/YYYY)"
                                                    value={pastSlotDate}
                                                    onChange={e => {
                                                        let val = e.target.value.replace(/\D/g, '');
                                                        if (val.length > 8) val = val.substring(0, 8);
                                                        let formatted = val;
                                                        if (val.length > 4) {
                                                            formatted = `${val.substring(0, 2)}/${val.substring(2, 4)}/${val.substring(4)}`;
                                                        } else if (val.length > 2) {
                                                            formatted = `${val.substring(0, 2)}/${val.substring(2)}`;
                                                        }
                                                        setPastSlotDate(formatted);
                                                    }}
                                                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#CE8E94] outline-none text-sm font-sans font-bold text-gray-700 placeholder:font-normal placeholder:text-gray-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Time (HH:MM)</label>
                                                <input
                                                    type="text"
                                                    placeholder="(HH:MM)"
                                                    value={pastSlotTime}
                                                    onChange={e => {
                                                        let val = e.target.value.replace(/\D/g, '');
                                                        if (val.length > 4) val = val.substring(0, 4);
                                                        let formatted = val;
                                                        if (val.length > 2) {
                                                            formatted = `${val.substring(0, 2)}:${val.substring(2)}`;
                                                        }
                                                        setPastSlotTime(formatted);
                                                    }}
                                                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#CE8E94] outline-none text-sm font-sans font-bold text-gray-700 placeholder:font-normal placeholder:text-gray-400"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full h-9 bg-gray-800 text-white hover:bg-gray-900 text-xs rounded-lg"
                                            disabled={pastSlotDate.length !== 10 || pastSlotTime.length !== 5}
                                            onClick={handleAddPastSlot}
                                        >
                                            Add to History
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Admin Notes CRM (Condensed) */}
                            {/* Admin Notes CRM (Condensed) */}
                            {/* Admin Notes CRM (Condensed) */}
                            <div className="mx-2 bg-white border border-[#CE8E94]/30 rounded-xl p-3 shadow-sm">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                        <FileText className="w-3 h-3" /> Notes
                                    </label>
                                    <button onClick={handleUpdateAdminNotes} className="text-[10px] font-bold text-[#CE8E94] hover:text-[#b07278]">
                                        Save
                                    </button>
                                </div>
                                <textarea
                                    value={memberNotes}
                                    onChange={(e) => setMemberNotes(e.target.value)}
                                    placeholder="Private admin notes..."
                                    className="w-full bg-transparent border-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none p-0 text-sm text-gray-700 placeholder:text-gray-400 min-h-[40px] resize-none leading-tight shadow-none ring-0 outline-none"
                                />
                            </div>

                            {/* Delete Action (Subtle) */}
                            {selectedMember?.role !== 'admin' && (
                                <div className="flex justify-center pt-2">
                                    <button
                                        onClick={() => handleDeleteUser(selectedMember?.email || '')}
                                        className="text-xs font-bold text-gray-300 hover:text-red-500 flex items-center gap-1 transition-colors py-2 px-4 rounded-lg hover:bg-red-50"
                                    >
                                        <Trash2 className="w-3 h-3" /> Delete Member
                                    </button>
                                </div>
                            )}

                        </div>
                    </Modal>
                )
            }

            {/* Edit Slot Modal */}
            {
                editingSlot && (
                    <Modal onClose={() => setEditingSlot(null)} showCloseIcon={false}>
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-[#CE8E94] mb-2">Edit Slot</h2>
                                <p className="text-gray-500">Update date and time for this slot.</p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">Date (DD/MM/YYYY)</label>
                                    <input
                                        type="text"
                                        placeholder="(DD/MM/YYYY)"
                                        value={editFormData.date}
                                        onChange={e => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.length > 8) val = val.substring(0, 8);
                                            let formatted = val;
                                            if (val.length > 4) {
                                                formatted = `${val.substring(0, 2)}/${val.substring(2, 4)}/${val.substring(4)}`;
                                            } else if (val.length > 2) {
                                                formatted = `${val.substring(0, 2)}/${val.substring(2)}`;
                                            }
                                            setEditFormData(prev => ({ ...prev, date: formatted }));
                                        }}
                                        className={standardInputClass}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">Time (HH:MM)</label>
                                    <input
                                        type="text"
                                        placeholder="(HH:MM)"
                                        value={editFormData.time}
                                        onChange={e => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.length > 4) val = val.substring(0, 4);
                                            let formatted = val;
                                            if (val.length > 2) {
                                                formatted = `${val.substring(0, 2)}:${val.substring(2)}`;
                                            }
                                            setEditFormData(prev => ({ ...prev, time: formatted }));
                                        }}
                                        className={standardInputClass}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button
                                    onClick={() => setEditingSlot(null)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdateSlot}
                                    className="flex-1 py-3 bg-[#CE8E94] text-white rounded-xl font-bold hover:bg-[#B57A80] transition shadow-md"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )
            }

            {/* Assign Slot Modal */}
            {
                assigningSlot && (
                    <Modal onClose={() => { setAssigningSlot(null); setSelectedUserEmailToAssign(''); }}>
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-[#CE8E94] mb-2">Assign Slot</h2>
                                <p className="text-gray-500">
                                    Assign <strong>{formatDateDisplay(assigningSlot.date)}</strong> at <strong>{assigningSlot.time}</strong> to a member.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">Select Member</label>
                                    <select
                                        value={selectedUserEmailToAssign}
                                        onChange={(e) => setSelectedUserEmailToAssign(e.target.value)}
                                        className={standardInputClass}
                                    >
                                        <option value="">-- Choose a Member --</option>
                                        {users.filter(u => u.role !== 'admin').map((user) => (
                                            <option key={user.email} value={user.email}>
                                                {user.firstName} {user.lastName} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button
                                    onClick={() => { setAssigningSlot(null); setSelectedUserEmailToAssign(''); }}
                                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAssignSlot}
                                    disabled={!selectedUserEmailToAssign}
                                    className="flex-1 py-3 bg-[#CE8E94] text-white rounded-xl font-bold hover:bg-[#B57A80] transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Assign Member
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )
            }


            {/* Custom Date Range Modal for Admin Slots Filtering */}
            {
                showCustomDateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#CE8E94]/10 backdrop-blur-md animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                            <h3 className="text-xl font-bold text-gray-800">Select Date Range</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Start Date</label>
                                    <input
                                        type="date"
                                        value={customStartDate}
                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#CE8E94]/20 outline-none text-gray-800 bg-white placeholder-gray-600"
                                        style={{ colorScheme: 'light' }}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">End Date</label>
                                    <input
                                        type="date"
                                        value={customEndDate}
                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#CE8E94]/20 outline-none text-gray-800 bg-white placeholder-gray-600"
                                        style={{ colorScheme: 'light' }}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button
                                    onClick={() => {
                                        setShowCustomDateModal(false);
                                        setDateFilter('All');
                                    }}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (customStartDate && customEndDate) {
                                            setDateFilter('Custom');
                                            setShowCustomDateModal(false);
                                        }
                                    }}
                                    className="flex-1 bg-[#CE8E94] hover:bg-[#B57A80] text-white"
                                >
                                    Apply
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* History Modal */}
            {
                historyViewer && (
                    <Modal onClose={() => setHistoryViewer(null)} showCloseIcon={false}>
                        <div className="space-y-4">
                            <div className="text-center border-b border-gray-100 pb-4">
                                <h2 className="text-2xl font-bold text-gray-900">{historyViewer.type} Bookings</h2>
                                <p className="text-sm text-gray-500">History for {historyViewer.user.firstName}</p>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar space-y-2">
                                {getMemberStats(historyViewer.user.email).history
                                    .filter(s => {
                                        const isEffectivelyCompleted = s.status === 'Completed' || ((s.status === 'Booked' || s.status === 'Active') && isPastSlot(s.date, s.time));
                                        if (historyViewer.type === 'Total') return true;
                                        if (historyViewer.type === 'Active') return (s.status === 'Booked' || s.status === 'Active') && !isPastSlot(s.date, s.time);
                                        if (historyViewer.type === 'Done') return isEffectivelyCompleted;
                                        return true;
                                    })
                                    .map((slot, i) => (
                                        <div key={i} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors px-2">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-lg">{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long' })}</span>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(slot.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} •
                                                    <span className={`uppercase text-xs font-bold tracking-wider ml-1 ${((slot.status === 'Booked' || slot.status === 'Active') && isPastSlot(slot.date, slot.time)) || slot.status === 'Completed' ? 'text-gray-400' : 'text-[#CE8E94]'}`}>
                                                        {((slot.status === 'Booked' || slot.status === 'Active') && isPastSlot(slot.date, slot.time)) ? 'Completed' : slot.status}
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="text-xl font-black text-[#CE8E94] tracking-tight">
                                                {slot.time}
                                            </div>
                                        </div>
                                    ))}
                                {getMemberStats(historyViewer.user.email).history.filter(s => {
                                    const isEffectivelyCompleted = s.status === 'Completed' || ((s.status === 'Booked' || s.status === 'Active') && isPastSlot(s.date, s.time));
                                    if (historyViewer.type === 'Total') return true;
                                    if (historyViewer.type === 'Active') return (s.status === 'Booked' || s.status === 'Active') && !isPastSlot(s.date, s.time);
                                    if (historyViewer.type === 'Done') return isEffectivelyCompleted;
                                    return true;
                                }).length === 0 && (
                                        <div className="text-center py-8 text-gray-400">No {historyViewer.type.toLowerCase()} bookings found.</div>
                                    )}
                            </div>
                            <Button
                                onClick={() => setHistoryViewer(null)}
                                className="w-full py-4 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl font-bold transition-all"
                            >
                                Close
                            </Button>
                        </div>
                    </Modal>
                )
            }
        </div >
    </div >
        ;
};
