
// STANDARDIZATION CONSTANTS
// Restored based on User Requirements & v9 Release Notes

export const TIME_SLOTS = [
    "06:00", "06:30",
    "07:00", "07:30",
    "08:00", "08:30",
    "09:00", "09:30",
    "10:00", "10:30",
    "11:00", "11:30",
    "12:00", "12:30",
    "13:00", "13:30",
    "14:00", "14:30",
    "15:00", "15:30",
    "16:00", "16:30",
    "17:00", "17:30",
    "18:00", "18:30",
    "19:00", "19:30",
    "20:00", "20:30",
    "21:00", "21:30",
    "22:00", "22:30",
    "23:00", "23:30"
];

export const BUTTON_VARIANTS = {
    primary: "bg-[#CE8E94] text-white hover:bg-[#b57a80] shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all active:scale-95",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-colors",
    success: "bg-[#25D366] text-white hover:bg-[#128C7E] shadow-sm hover:shadow-md",
    ghost: "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
};

export const MODAL_STYLES = {
    overlay: "fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#CE8E94]/10 backdrop-blur-md transition-opacity duration-300",
    content: "relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-8 md:p-10 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto scrollbar-hide z-10",
    closeButton: "absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-20"
};

export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
};
