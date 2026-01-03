import React, { useState } from 'react';
import { LEVELS, TRAITS } from '../utils/gamification';
import './gamification.css';

interface ProgressionDashboardProps {
    lessonsCompleted?: number; // Mock input for now
    unlockedTraits?: string[]; // IDs of unlocked traits
    onShare?: (item: { title: string, icon: React.ReactNode, description: string }) => void;
}

export const ProgressionDashboard: React.FC<ProgressionDashboardProps> = ({
    lessonsCompleted = 18, // Default to simulate "ORBIT" level roughly or closer to user example
    unlockedTraits = ['SOLARIS', 'GRAVITY'],
    onShare
}) => {
    const [activeTab, setActiveTab] = useState<'path' | 'traits'>('path');

    // Logic to determine current level (Safe for older environments)
    let currentLevelIndex = 0;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (lessonsCompleted >= LEVELS[i].requiredLessons) {
            currentLevelIndex = i;
            break;
        }
    }
    // const currentLevel = LEVELS[currentLevelIndex] || LEVELS[0];
    // const nextLevel = LEVELS[currentLevelIndex + 1];

    return (
        <>
            {/* Mobile Tab Navigation (Visible only on mobile) */}
            <div className="md:hidden flex p-4 pb-0 gap-8 justify-center border-b border-[#F5F1EE]">
                <button
                    onClick={() => setActiveTab('path')}
                    className={`pb-2 text-[10px] font-bold uppercase tracking-[2px] border-b-2 transition-all ${activeTab === 'path' ? 'border-[#CE8E94] text-[#CE8E94]' : 'border-transparent text-gray-400'}`}
                >
                    Path
                </button>
                <button
                    onClick={() => setActiveTab('traits')}
                    className={`pb-2 text-[10px] font-bold uppercase tracking-[2px] border-b-2 transition-all ${activeTab === 'traits' ? 'border-[#CE8E94] text-[#CE8E94]' : 'border-transparent text-gray-400'}`}
                >
                    Traits
                </button>
            </div>

            <div className="system-wrapper">
                {/* 1. Progression Section */}
                <div className={`card-box ${activeTab === 'traits' ? '!hidden md:!flex' : '!flex'}`}>
                    <span className="title">Your Transformation Path</span>
                    <div className="progression-list">
                        {LEVELS.map((level, index) => {
                            const isActive = index === currentLevelIndex;
                            const isUnlocked = index <= currentLevelIndex;
                            const isNext = index === currentLevelIndex + 1;

                            // Only show active, next, and maybe a few others? Or all? User said "10'lu Gelişim Listesi", so distinct rows.
                            // Responsive design considerations: maybe not all 10 on mobile, but full list on desktop.
                            // For now, render all to show the full path.

                            return (
                                <div
                                    key={level.id}
                                    className={`level-row ${isActive ? 'active' : ''}`}
                                    style={{ opacity: isUnlocked || isNext ? 1 : 0.4 }}
                                >
                                    <div className="level-icon">{level.icon}</div>
                                    <div className="level-info">
                                        <span className="level-name">{level.name}</span>
                                        <p className="level-desc">
                                            {isActive ? `${lessonsCompleted} Lessons Completed` :
                                                isNext ? `${level.requiredLessons - lessonsCompleted} lessons to unlock` :
                                                    level.description}
                                        </p>
                                    </div>
                                    {isActive && (
                                        <button
                                            className="action-btn"
                                            style={{ width: 'auto' }}
                                            onClick={() => onShare?.({
                                                title: level.name,
                                                icon: level.icon,
                                                description: level.description
                                            })}
                                        >
                                            {level.actionText}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Traits Section */}
                <div className={`card-box ${activeTab === 'path' ? '!hidden md:!flex' : '!flex'}`}>
                    <span className="title">Your Cosmic Traits</span>
                    <div className="traits-grid">
                        {TRAITS.map(trait => {
                            const isUnlocked = unlockedTraits.includes(trait.id);

                            return (
                                <div
                                    key={trait.id}
                                    className={`trait-item ${isUnlocked ? '' : 'locked'}`}
                                >
                                    <div className="trait-icon">{trait.icon}</div>
                                    <span className="trait-name">{trait.name}</span>
                                    <span style={{ fontSize: '9px', color: '#999', display: 'block', marginBottom: '5px' }}>
                                        {trait.conditionDescription}
                                    </span>
                                    <button
                                        className="action-btn"
                                        onClick={() => isUnlocked && onShare?.({
                                            title: trait.name,
                                            icon: trait.icon,
                                            description: trait.meaning
                                        })}
                                    >
                                        {isUnlocked ? trait.actionText : 'Locked'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};
