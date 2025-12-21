import emailjs from '@emailjs/browser';
import { UserType, Slot } from '../types';
import { formatDateDisplay } from '../utils/helpers';

// Configuration
const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;
const ADMIN_TEMPLATE = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ADMIN!;
const USER_TEMPLATE = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_USER!;

const STUDIO_INFO = {
    name: 'Reformer Pilates Malta',
    address: 'Triq Il-Hgejjeg, San Giljan, Malta',
    instructor: 'Ömer YİĞİTLER',
    maps_link: 'https://maps.app.goo.gl/YourGoogleMapsLinkHere', // TODO: User should update this
    website: 'https://www.reformerpilatesmalta.com'
};

// --- GENERIC SENDERS ---

/**
 * Sends a notification to the ADMIN.
 */
export const sendAdminAlert = async (
    eventType: 'New Registration' | 'New Booking' | 'Booking Cancelled' | 'Class Cancelled by Admin',
    user: UserType,
    slot?: Slot | null
) => {
    try {
        const templateParams = {
            event_type: eventType,
            user_name: `${user.firstName} ${user.lastName}`,
            user_email: user.email,
            user_phone: user.phone || 'N/A',
            event_date: slot ? formatDateDisplay(slot.date) : formatDateDisplay(user.registered),
            event_time: slot ? slot.time : 'N/A'
        };

        if (!SERVICE_ID || !ADMIN_TEMPLATE || !PUBLIC_KEY) {
            console.warn("EmailJS credentials missing. Check .env.local");
            return;
        }

        await emailjs.send(SERVICE_ID, ADMIN_TEMPLATE, templateParams, PUBLIC_KEY);
        console.log(`[EmailService] Admin Alert Sent: ${eventType}`);
    } catch (error) {
        console.error(`[EmailService] Failed to send Admin Alert (${eventType}):`, error);
    }
};

/**
 * Sends a confirmation/notification to the USER.
 * Note: We reuse the single USER_TEMPLATE but assume it's generic enough or we use the 'message' field if available.
 * Based on the screenshot provided, the User Template is structured for "Booking Confirmation".
 * We might need to adjust logic if we want to send "Cancellation" using the same template 
 * or request a new template. For now, we will try to fit it.
 */
export const sendUserBookingConfirmation = async (user: UserType, slot: Slot) => {
    try {
        const templateParams = {
            to_name: user.firstName,
            to_email: user.email,
            studio_name: STUDIO_INFO.name,
            class_name: 'Reformer Pilates',
            class_date: formatDateDisplay(slot.date),
            class_time: slot.time,
            instructor_name: STUDIO_INFO.instructor,
            studio_address: STUDIO_INFO.address,
            maps_link: STUDIO_INFO.maps_link,
            website_url: STUDIO_INFO.website,
            // Hidden/Optional fields if template supports them for custom messages
            message: `Your booking for ${slot.date} at ${slot.time} is confirmed.`
        };

        await emailjs.send(SERVICE_ID, USER_TEMPLATE, templateParams, PUBLIC_KEY);
        console.log(`[EmailService] User Confirmation Sent: Booking`);
    } catch (error) {
        console.error("[EmailService] Failed to send User Confirmation:", error);
    }
};

/**
 * Sends a Cancellation notification to the USER.
 * WARNING: The current User Template says "Great news! Your spot is confirmed."
 * We need to be careful. Ideally we need a separate template for Cancellations.
 * FOR NOW: We will use the same template but hopefully the user can distinguish via Subject line if we can set it?
 * Actually, the screenshot shows Subject: {{m_subject}}. So we CAN override the subject!
 */
export const sendUserCancellationAlert = async (user: UserType, slot: Slot, reason: string = 'User Request') => {
    try {
        const templateParams = {
            m_subject: 'Booking Cancellation - Reformer Pilates Malta', // OVERRIDE SUBJECT
            to_name: user.firstName,
            to_email: user.email,
            studio_name: STUDIO_INFO.name,
            class_name: `CANCELLED: Reformer Pilates (${reason})`, // Hack to show status in class name
            class_date: formatDateDisplay(slot.date),
            class_time: slot.time,
            instructor_name: STUDIO_INFO.instructor,
            studio_address: STUDIO_INFO.address,
            maps_link: STUDIO_INFO.maps_link,
            website_url: STUDIO_INFO.website
        };

        await emailjs.send(SERVICE_ID, USER_TEMPLATE, templateParams, PUBLIC_KEY);
        console.log(`[EmailService] User Alert Sent: Cancellation`);
    } catch (error) {
        console.error("[EmailService] Failed to send User Cancellation:", error);
    }
};

/**
 * Sends a Reschedule notification to the USER.
 */
export const sendUserRescheduleConfirmation = async (user: UserType, newSlot: Slot) => {
    try {
        const templateParams = {
            m_subject: 'Booking Rescheduled - Reformer Pilates Malta',
            to_name: user.firstName,
            to_email: user.email,
            studio_name: STUDIO_INFO.name,
            class_name: 'RESCHEDULED: Reformer Pilates',
            class_date: formatDateDisplay(newSlot.date),
            class_time: newSlot.time,
            instructor_name: STUDIO_INFO.instructor,
            studio_address: STUDIO_INFO.address,
            maps_link: STUDIO_INFO.maps_link,
            website_url: STUDIO_INFO.website,
            message: `Your booking has been moved to ${formatDateDisplay(newSlot.date)} at ${newSlot.time}.`
        };

        await emailjs.send(SERVICE_ID, USER_TEMPLATE, templateParams, PUBLIC_KEY);
        console.log(`[EmailService] User Confirmation Sent: Reschedule`);
    } catch (error) {
        console.error("[EmailService] Failed to send User Reschedule:", error);
    }
};
