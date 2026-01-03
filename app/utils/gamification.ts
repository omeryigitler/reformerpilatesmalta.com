
export interface Level {
    id: number;
    name: string;
    icon: string;
    description: string;
    actionText: string;
    requiredLessons: number;
}

export interface Trait {
    id: string;
    name: string;
    icon: string;
    conditionDescription: string;
    meaning: string;
    actionText: string;
    isLocked?: boolean;
}

export const LEVELS: Level[] = [
    { id: 1, name: "SEED", icon: ".", description: "Your potential is still underground.", actionText: "Take First Step", requiredLessons: 0 },
    { id: 2, name: "NOVA", icon: "✦", description: "Your first spark has occurred.", actionText: "Follow the Light", requiredLessons: 1 },
    { id: 3, name: "PULSE", icon: "≋", description: "Your rhythm and breath have stabilized.", actionText: "Feel the Flow", requiredLessons: 5 },
    { id: 4, name: "FLUX", icon: "〰", description: "Your movements flow like water.", actionText: "Maintain Continuity", requiredLessons: 10 },
    { id: 5, name: "ORBIT", icon: "◎", description: "You found your own balance and orbit.", actionText: "Stay in Balance", requiredLessons: 20 },
    { id: 6, name: "ECLIPSE", icon: "◑", description: "Phase of deep focus and turning inward.", actionText: "Focus Deeply", requiredLessons: 30 },
    { id: 7, name: "NEBULA", icon: "░", description: "Your knowledge expanded like a star cloud.", actionText: "Start Expansion", requiredLessons: 50 },
    { id: 8, name: "QUASAR", icon: "⚡", description: "You became a center of immense energy.", actionText: "Manage Power", requiredLessons: 75 },
    { id: 9, name: "SUPERNOVA", icon: "✳", description: "Great transformation; your light reaches everywhere.", actionText: "Celebrate Change", requiredLessons: 100 },
    { id: 10, name: "COSMOS", icon: "🌌", description: "You and the practice have become one.", actionText: "Live the Oneness", requiredLessons: 150 },
];

export const TRAITS: Trait[] = [
    { id: "SOLARIS", name: "SOLARIS", icon: "☼", conditionDescription: "Morning (09-12)", meaning: "Early spirit starting the day with energy.", actionText: "Say Good Morning" },
    { id: "LUNAR", name: "LUNAR", icon: "☽", conditionDescription: "Evening (18-21)", meaning: "Explorer turning inward in the silence of the night.", actionText: "Light the Night" },
    { id: "ZENITH", name: "ZENITH", icon: "△", conditionDescription: "Weekend", meaning: "Dedication to growth on rest days.", actionText: "Reach Peak" },
    { id: "GRAVITY", name: "GRAVITY", icon: "♾", conditionDescription: "7 Day Streak", meaning: "Unwavering, steady gravitational pull.", actionText: "Maintain Bond" },
    { id: "ECHO", name: "ECHO", icon: "☊", conditionDescription: "Comment/Interact", meaning: "Voice that echoes in the community.", actionText: "Spread Echo" },
    { id: "COMET", name: "COMET", icon: "☄", conditionDescription: "Fast Completion", meaning: "Moving fast without missing lessons.", actionText: "Gain Speed" },
    { id: "AURORA", name: "AURORA", icon: "ᯓ", conditionDescription: "Diverse Categories", meaning: "Colorful soul trying every type of lesson.", actionText: "See Colors" },
    { id: "METEOR", name: "METEOR", icon: "🚀", conditionDescription: "Long Lessons", meaning: "Power completing tough and long lessons.", actionText: "Break Limits" },
    { id: "STARLIGHT", name: "STARLIGHT", icon: "✧", conditionDescription: "Like/Support", meaning: "Being a light and support to other members.", actionText: "Shine Light" },
    { id: "POLARIS", name: "POLARIS", icon: "⚓", conditionDescription: "Old Member (1 Year)", meaning: "Guide and constant of the platform.", actionText: "Guide the Way" },
];
