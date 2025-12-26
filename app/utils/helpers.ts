import { Slot } from "../types";

// NEW: Robust Malta Date without locale hacks
export const getTodayDate = () => {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Malta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });

    // formatToParts guarantees we get YYYY, MM, DD regardless of locale delimiters
    const parts = formatter.formatToParts(new Date());
    const y = parts.find(p => p.type === "year")?.value;
    const m = parts.find(p => p.type === "month")?.value;
    const d = parts.find(p => p.type === "day")?.value;

    return `${y}-${m}-${d}`;
};

export const sortSlots = (slots: Slot[]) => {
    if (!Array.isArray(slots)) return [];
    return [...slots].sort((a, b) => {
        if (!a.time || !b.time || !a.date || !b.date) return 0;
        const dateTimeA = `${a.date} ${a.time.replace('AM', 'a').replace('PM', 'p')}`;
        const dateTimeB = `${b.date} ${b.time.replace('AM', 'a').replace('PM', 'p')}`;
        return dateTimeA.localeCompare(dateTimeB);
    });
};

export const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

export const isPastDate = (dateString: string) => {
    if (!dateString) return false;
    // Strict string comparison for YYYY-MM-DD format is safe and timezone-independent
    // provided both are in the same format (which they are, via safe helpers)
    const today = getTodayDate();
    return dateString < today;
}

export const getCurrentTimeMalta = () => {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Malta",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
    return formatter.format(new Date());
};

export const isPastSlot = (dateString: string, timeString: string) => {
    if (!dateString || !timeString) return false;
    const today = getTodayDate();
    const now = getCurrentTimeMalta();

    if (dateString < today) return true;
    if (dateString > today) return false;

    // If date is today, compare time
    // Ensure both are comparable strings (HH:MM)
    const slotTime = convertTime12to24(timeString);
    const currentTime = convertTime12to24(now);

    return slotTime <= currentTime;
}

export const convertTime12to24 = (timeStr: string): string => {
    if (!timeStr) return "00:00";

    // If already 24h format (no AM/PM)
    if (!timeStr.toUpperCase().includes('AM') && !timeStr.toUpperCase().includes('PM')) {
        const parts = timeStr.trim().split(':');
        if (parts.length < 2) return timeStr; // Fallback
        const h = parts[0];
        const m = parts[1];
        return `${h.padStart(2, '0')}:${m}`;
    }

    const [time, modifier] = timeStr.trim().split(' ');
    const parts = time.split(':');
    let hours = parts[0];
    const minutes = parts[1];

    if (hours === '12') {
        hours = '00';
    }

    if (modifier?.toUpperCase() === 'PM') {
        hours = String(parseInt(hours, 10) + 12);
    }

    return `${hours.padStart(2, '0')}:${minutes}`;
};
