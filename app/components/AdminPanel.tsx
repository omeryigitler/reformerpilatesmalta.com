"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { AdminPanel as OriginalAdminPanel } from './AdminPanelOriginal';
import { Modal } from './Modal';
import { useNotification } from '../context/NotificationContext';
import { db } from '../firebase';
import { sendUserBookingConfirmation } from '../services/emailService';
import { ManagementState, Slot, UserType } from '../types';
import { formatDateDisplay, isPastSlot } from '../utils/helpers';

interface AdminPanelProps {
    loggedInUser: UserType;
    slots: Slot[];
    users: UserType[];
    managementState: ManagementState;
    setManagementState: React.Dispatch<React.SetStateAction<ManagementState>>;
    handleLogout: () => void;
    navigateToHome: () => void;
}

const formatMaskedDate = (input: string) => {
    let val = input.replace(/\D/g, '');
    if (val.length > 8) val = val.substring(0, 8);
    if (val.length > 4) return `${val.substring(0, 2)}/${val.substring(2, 4)}/${val.substring(4)}`;
    if (val.length > 2) return `${val.substring(0, 2)}/${val.substring(2)}`;
    return val;
};

const formatMaskedTime = (input: string) => {
    let val = input.replace(/\D/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length > 2) return `${val.substring(0, 2)}:${val.substring(2)}`;
    return val;
};

const toIsoDate = (date: string) => {
    const parts = date.split('/');
    if (parts.length !== 3) return '';
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

export const AdminPanel = (props: AdminPanelProps) => {
    const { users, slots } = props;
    const { showNotification } = useNotification();
    const [futureBookingMember, setFutureBookingMember] = useState<UserType | null>(null);
    const [futureSlotDate, setFutureSlotDate] = useState('');
    const [futureSlotTime, setFutureSlotTime] = useState('');
    const [isSavingFutureBooking, setIsSavingFutureBooking] = useState(false);

    useEffect(() => {
        const handleBookClassCapture = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            const button = target?.closest('button');
            if (!button || !button.textContent?.includes('Book Class')) return;

            const modal = button.closest('.relative.flex.flex-col.bg-white') || button.closest('[class*="rounded"]');
            const modalText = modal?.textContent?.toLowerCase() || '';
            const member = users.find(user => modalText.includes(user.email.toLowerCase()));

            if (!member) return;

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            setFutureBookingMember(member);
        };

        document.addEventListener('click', handleBookClassCapture, true);
        return () => document.removeEventListener('click', handleBookClassCapture, true);
    }, [users]);

    const resetFutureBookingForm = () => {
        setFutureBookingMember(null);
        setFutureSlotDate('');
        setFutureSlotTime('');
        setIsSavingFutureBooking(false);
    };

    const handleAddFutureBookingForMember = async () => {
        if (!futureBookingMember || futureSlotDate.length !== 10 || futureSlotTime.length !== 5) return;

        const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

        if (!dateRegex.test(futureSlotDate)) {
            showNotification('Invalid date format. Use DD/MM/YYYY.', 'error');
            return;
        }

        if (!timeRegex.test(futureSlotTime)) {
            showNotification('Invalid time format. Use HH:MM (e.g., 09:30).', 'error');
            return;
        }

        const dateStr = toIsoDate(futureSlotDate);
        if (!dateStr || isPastSlot(dateStr, futureSlotTime)) {
            showNotification('Please choose a future class date and time.', 'error');
            return;
        }

        const isSlotTaken = slots.some(slot =>
            slot.date === dateStr &&
            slot.time === futureSlotTime &&
            (slot.status === 'Booked' || slot.status === 'Active')
        );

        if (isSlotTaken) {
            showNotification('This class is already booked. Please choose another date or time.', 'error');
            return;
        }

        const slotId = `${dateStr}_${futureSlotTime}`;
        const slot: Slot = {
            id: slotId,
            date: dateStr,
            time: futureSlotTime,
            status: 'Booked',
            bookedBy: `${futureBookingMember.firstName} ${futureBookingMember.lastName} (Admin)`,
            bookedByEmail: futureBookingMember.email.trim().toLowerCase()
        };

        try {
            setIsSavingFutureBooking(true);
            await setDoc(doc(db, 'slots', slotId), slot);
            await sendUserBookingConfirmation(futureBookingMember, slot);
            showNotification(`Future class booked for ${futureBookingMember.firstName} on ${formatDateDisplay(dateStr)} at ${futureSlotTime}.`, 'success');
            resetFutureBookingForm();
        } catch (error) {
            console.error('Error adding future booking', error);
            showNotification('Failed to book future class.', 'error');
            setIsSavingFutureBooking(false);
        }
    };

    return (
        <>
            <OriginalAdminPanel {...props} />

            {futureBookingMember && (
                <Modal onClose={resetFutureBookingForm} showCloseIcon={false}>
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#CE8E94]/10 text-[#CE8E94]">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900">Book Class</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Create a future class for {futureBookingMember.firstName} {futureBookingMember.lastName}.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Date (DD/MM/YYYY)</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#CE8E94]" />
                                    <input
                                        type="text"
                                        placeholder="DD/MM/YYYY"
                                        value={futureSlotDate}
                                        onChange={event => setFutureSlotDate(formatMaskedDate(event.target.value))}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-9 pr-3 text-sm font-bold text-gray-700 outline-none transition focus:border-[#CE8E94] focus:bg-white focus:ring-2 focus:ring-[#CE8E94]/20"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Time (HH:MM)</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#CE8E94]" />
                                    <input
                                        type="text"
                                        placeholder="HH:MM"
                                        value={futureSlotTime}
                                        onChange={event => setFutureSlotTime(formatMaskedTime(event.target.value))}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-9 pr-3 text-sm font-bold text-gray-700 outline-none transition focus:border-[#CE8E94] focus:bg-white focus:ring-2 focus:ring-[#CE8E94]/20"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-1">
                            <Button
                                onClick={resetFutureBookingForm}
                                className="flex-1 rounded-xl bg-gray-100 py-3 font-bold text-gray-600 hover:bg-gray-200"
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={futureSlotDate.length !== 10 || futureSlotTime.length !== 5 || isSavingFutureBooking}
                                onClick={handleAddFutureBookingForMember}
                                className="flex-1 rounded-xl bg-[#CE8E94] py-3 font-bold text-white shadow-md transition hover:bg-[#B57A80] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSavingFutureBooking ? 'Booking...' : 'Book Future Class'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};
