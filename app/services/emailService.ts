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
        // --- DETERMINE THEME COLOR & TITLE ---
        let themeColor = '#6B7280'; // Default Grey
        let bannerTitle = 'SYSTEM ALERT';

        if (eventType === 'New Registration') {
            themeColor = '#4F46E5'; // Indigo
            bannerTitle = 'NEW MEMBER REGISTRATION';
        } else if (eventType === 'New Booking') {
            themeColor = '#10B981'; // Emerald Green
            bannerTitle = 'NEW CLASS BOOKING';
        } else if (eventType === 'Booking Cancelled') {
            themeColor = '#EF4444'; // Red
            bannerTitle = 'BOOKING CANCELLED';
        } else if (eventType === 'Class Cancelled by Admin') {
            themeColor = '#F59E0B'; // Amber
            bannerTitle = 'CLASS CANCELLED BY ADMIN';
        }

        const templateParams = {
            main_title: bannerTitle, // Used for Header Text
            theme_color: themeColor, // Used for Header Background
            event_type: eventType,
            user_name: `${user.firstName} ${user.lastName}`,
            user_email: user.email,
            user_phone: user.phone || 'N/A',
            event_date: slot ? formatDateDisplay(slot.date) : formatDateDisplay(user.registered),
            event_class_time: slot ? slot.time : 'N/A' // Renamed to avoid confusion with event timestamp
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
// --- HELPER: CONSTANT REMINDERS ---
const REMINDERS_HTML = `
<div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #CE8E94;">
    <h3 style="color: #CE8E94; margin-top: 0;">📝 A Few Reminders for a Great Class:</h3>
    <ul style="padding-left: 20px; color: #555;">
        <li style="margin-bottom: 8px;"><strong>Grip Socks:</strong> For hygiene and safety, grip socks are mandatory.</li>
        <li style="margin-bottom: 8px;"><strong>Arrival:</strong> Please arrive 10 minutes early.</li>
        <li><strong>Hydration:</strong> Don't forget your water bottle!</li>
    </ul>
</div>
`;

/**
 * Sends a confirmation/notification to the USER.
 */
export const sendUserBookingConfirmation = async (user: UserType, slot: Slot) => {
    try {
        const templateParams = {
            m_subject: 'Booking Confirmation - Reformer Pilates Malta', // Still used for email subject
            main_title: 'Booking Confirmed',
            intro_message: `Great news! Your spot is confirmed. We can't wait to see you on the reformer.`,
            reminder_section: REMINDERS_HTML, // SENDING REMINDERS
            to_name: user.firstName,
            to_email: user.email,
            studio_name: STUDIO_INFO.name,
            class_name: 'Reformer Pilates',
            class_date: formatDateDisplay(slot.date),
            class_time: slot.time,
            instructor_name: STUDIO_INFO.instructor,
            studio_address: STUDIO_INFO.address,
            maps_link: STUDIO_INFO.maps_link,
            website_url: STUDIO_INFO.website
        };

        await emailjs.send(SERVICE_ID, USER_TEMPLATE, templateParams, PUBLIC_KEY);
        console.log(`[EmailService] User Confirmation Sent: Booking`);
    } catch (error) {
        console.error("[EmailService] Failed to send User Confirmation:", error);
    }
};

/**
 * Sends a Cancellation notification to the USER.
 */
export const sendUserCancellationAlert = async (user: UserType, slot: Slot, reason: string = 'User Request') => {
    try {
        const templateParams = {
            m_subject: 'Booking Cancellation - Reformer Pilates Malta',
            main_title: 'Booking Cancelled',
            intro_message: `Important: Your booking has been cancelled.`,
            reminder_section: '', // NO REMINDERS FOR CANCELLATION
            to_name: user.firstName,
            to_email: user.email,
            studio_name: STUDIO_INFO.name,
            class_name: `CANCELLED: Reformer Pilates (${reason})`,
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
            main_title: 'Booking Rescheduled',
            intro_message: `Important: Your session has been rescheduled. We look forward to seeing you at the new time.`,
            reminder_section: REMINDERS_HTML, // SENDING REMINDERS
            to_name: user.firstName,
            to_email: user.email,
            studio_name: STUDIO_INFO.name,
            class_name: 'RESCHEDULED: Reformer Pilates',
            class_date: formatDateDisplay(newSlot.date),
            class_time: newSlot.time,
            instructor_name: STUDIO_INFO.instructor,
            studio_address: STUDIO_INFO.address,
            maps_link: STUDIO_INFO.maps_link,
            website_url: STUDIO_INFO.website
        };

        await emailjs.send(SERVICE_ID, USER_TEMPLATE, templateParams, PUBLIC_KEY);
        console.log(`[EmailService] User Confirmation Sent: Reschedule`);
    } catch (error) {
        console.error("[EmailService] Failed to send User Reschedule:", error);
    }
};
