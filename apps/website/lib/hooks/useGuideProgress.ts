'use client';

import { useState, useCallback, useEffect } from 'react';

// LocalStorage key for storing guide progress
const STORAGE_KEY_PREFIX = 'guide-progress-';

export interface GuideProgress {
    completedSteps: {
        [stepId: string]: {
            title: string;
            completedAt: string;
        };
    };
    totalSteps: number;
    lastUpdated: string;
}

export function useGuideProgress(guideId: string) {
    const [progress, setProgress] = useState<GuideProgress | null>(null);
    const storageKey = `${STORAGE_KEY_PREFIX}${guideId}`;

    // Load progress from localStorage on component mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const savedProgress = localStorage.getItem(storageKey);
                if (savedProgress) {
                    setProgress(JSON.parse(savedProgress));
                }
            } catch (error) {
                console.error('Error loading guide progress:', error);
            }
        }
    }, [storageKey]);

    // Save progress to localStorage
    const saveProgress = useCallback((newProgress: GuideProgress) => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(storageKey, JSON.stringify(newProgress));
                setProgress(newProgress);
            } catch (error) {
                console.error('Error saving guide progress:', error);
            }
        }
    }, [storageKey]);

    // Initialize progress if not already done
    const initProgress = useCallback((totalSteps: number) => {
        if (!progress) {
            const newProgress: GuideProgress = {
                completedSteps: {},
                totalSteps,
                lastUpdated: new Date().toISOString(),
            };
            saveProgress(newProgress);
            return newProgress;
        }
        return progress;
    }, [progress, saveProgress]);

    // Mark a step as completed
    const markStepCompleted = useCallback((stepId: string, stepTitle: string) => {
        let currentProgress = progress;

        if (!currentProgress) {
            currentProgress = initProgress(0);
        }

        const newProgress = {
            ...currentProgress,
            completedSteps: {
                ...currentProgress.completedSteps,
                [stepId]: {
                    title: stepTitle,
                    completedAt: new Date().toISOString(),
                },
            },
            lastUpdated: new Date().toISOString(),
        };

        saveProgress(newProgress);
        return Promise.resolve(true);
    }, [progress, initProgress, saveProgress]);

    // Check if a step is completed
    const isStepCompleted = useCallback((stepId: string) => {
        if (!progress) return Promise.resolve(false);
        return Promise.resolve(!!progress.completedSteps[stepId]);
    }, [progress]);

    // Get the number of completed steps
    const getCompletedStepCount = useCallback(() => {
        if (!progress) return 0;
        return Object.keys(progress.completedSteps).length;
    }, [progress]);

    // Reset progress for this guide
    const resetProgress = useCallback(() => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(storageKey);
            setProgress(null);
        }
    }, [storageKey]);

    return {
        progress,
        markStepCompleted,
        isStepCompleted,
        getCompletedStepCount,
        resetProgress,
        initProgress,
    };
}