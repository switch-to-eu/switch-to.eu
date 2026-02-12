import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/* eslint-disable no-unused-vars */
// Type definitions with unused parameters are intentional - they define the API surface
// Define types for our store
type GuideStepState = {
    [guideId: string]: {
        [stepId: string]: boolean;
    };
};

type GuideProgressState = {
    completedSteps: GuideStepState;
    completedGuides: string[];
    hydrated: boolean; // Track if store has been hydrated from localStorage
};

type GuideProgressActions = {
    initGuide: (guideId: string) => void;
    toggleStepCompleted: (guideId: string, stepId: string) => void;
    markStepCompleted: (guideId: string, stepId: string) => void;
    markStepIncomplete: (guideId: string, stepId: string) => void;
    getGuideProgress: (guideId: string, totalSteps: number) => number;
    isStepCompleted: (guideId: string, stepId: string) => boolean;
    isGuideCompleted: (guideId: string, totalSteps: number) => boolean;
    markGuideCompleted: (guideId: string) => void;
    resetGuideProgress: (guideId: string) => void;
    setHydrated: (hydrated: boolean) => void;
};
/* eslint-enable no-unused-vars */

type GuideProgressStore = GuideProgressState & GuideProgressActions;

// Create the store with persistence
export const useGuideProgressStore = create<GuideProgressStore>()(
    persist(
        (set, get) => ({
            // State
            completedSteps: {},
            completedGuides: [],
            hydrated: false,

            // Set hydrated state
            setHydrated: (hydrated) => set({ hydrated }),

            // Actions
            initGuide: (guideId) => {
                set((state) => {
                    const newCompletedSteps = { ...state.completedSteps };

                    // Initialize the guide if it doesn't exist yet
                    if (!newCompletedSteps[guideId]) {
                        newCompletedSteps[guideId] = {};
                    }

                    return { completedSteps: newCompletedSteps };
                });
            },

            toggleStepCompleted: (guideId, stepId) => {
                set((state) => {
                    const currentCompleted = state.completedSteps[guideId]?.[stepId] || false;

                    // Create a new state object for immutability
                    const newCompletedSteps = { ...state.completedSteps };

                    // Ensure the guide ID exists in the object
                    if (!newCompletedSteps[guideId]) {
                        newCompletedSteps[guideId] = {};
                    }

                    // Toggle the step's completion status
                    newCompletedSteps[guideId] = {
                        ...newCompletedSteps[guideId],
                        [stepId]: !currentCompleted
                    };

                    return { completedSteps: newCompletedSteps };
                });
            },

            markStepCompleted: (guideId, stepId) => {
                set((state) => {
                    // Create a new state object for immutability
                    const newCompletedSteps = { ...state.completedSteps };

                    // Ensure the guide ID exists in the object
                    if (!newCompletedSteps[guideId]) {
                        newCompletedSteps[guideId] = {};
                    }

                    // Mark the step as completed
                    newCompletedSteps[guideId] = {
                        ...newCompletedSteps[guideId],
                        [stepId]: true
                    };

                    return { completedSteps: newCompletedSteps };
                });
            },

            markStepIncomplete: (guideId, stepId) => {
                set((state) => {
                    // If the guide doesn't exist in state, no changes needed
                    if (!state.completedSteps[guideId]) {
                        return state;
                    }

                    // Create a new state object for immutability
                    const newCompletedSteps = { ...state.completedSteps };

                    // Mark the step as incomplete
                    newCompletedSteps[guideId] = {
                        ...newCompletedSteps[guideId],
                        [stepId]: false
                    };

                    return { completedSteps: newCompletedSteps };
                });
            },

            getGuideProgress: (guideId, totalSteps) => {
                const state = get();
                if (!state.completedSteps[guideId] || totalSteps === 0) {
                    return totalSteps === 0 ? 100 : 0;
                }

                const completedCount = Object.values(state.completedSteps[guideId]).filter(Boolean).length;
                return Math.floor((completedCount / totalSteps) * 100);
            },

            isStepCompleted: (guideId, stepId) => {
                const state = get();
                return !!state.completedSteps[guideId]?.[stepId];
            },

            isGuideCompleted: (guideId, totalSteps) => {
                // If there are no required steps (totalSteps = 0), then the guide is complete
                if (totalSteps === 0) return true;

                const progress = get().getGuideProgress(guideId, totalSteps);
                return progress === 100;
            },

            markGuideCompleted: (guideId) => {
                set((state) => {
                    // Only add the guide if it's not already in the completed list
                    if (state.completedGuides.includes(guideId)) {
                        return state;
                    }

                    return {
                        completedGuides: [...state.completedGuides, guideId]
                    };
                });
            },

            resetGuideProgress: (guideId) => {
                set((state) => {
                    // Create a new state object for immutability
                    const newCompletedSteps = { ...state.completedSteps };

                    // Remove the guide entry completely
                    if (newCompletedSteps[guideId]) {
                        delete newCompletedSteps[guideId];
                    }

                    // Also remove from completed guides if present
                    const newCompletedGuides = state.completedGuides.filter(id => id !== guideId);

                    return {
                        completedSteps: newCompletedSteps,
                        completedGuides: newCompletedGuides
                    };
                });
            }
        }),
        {
            name: 'guide-progress-storage', // unique name for localStorage
            storage: createJSONStorage(() => localStorage),
            // Skip hydration if running on server
            skipHydration: typeof window === 'undefined',
            // Handle hydration manually for more control
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.setHydrated(true);
                }
            }
        }
    )
);

// Create a hook to ensure hydration has occurred before using stored values
// eslint-disable-next-line no-unused-vars
export function useHydratedGuideProgressStore<T>(selector: (state: GuideProgressStore) => T): T {
    const hydrated = useGuideProgressStore(state => state.hydrated);
    const value = useGuideProgressStore(selector);

    // While not hydrated, return empty/default values
    if (!hydrated) {
        // Return empty values based on the return type of the selector
        if (typeof value === 'boolean') return false as T;
        if (typeof value === 'number') return 0 as T;
        if (typeof value === 'string') return '' as T;
        if (Array.isArray(value)) return [] as T;
        if (typeof value === 'object' && value !== null) return {} as T;
    }

    return value;
}