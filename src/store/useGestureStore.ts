import { create } from 'zustand';

interface GestureState {
    gestureMode: 'NONE' | 'PINCH' | 'PALM' | 'POINT';
    pointer: { x: number; y: number; z: number };
    setGestureMode: (mode: 'NONE' | 'PINCH' | 'PALM' | 'POINT') => void;
    setPointer: (x: number, y: number, z: number) => void;

    // State history for undo/redo
    history: string[];
    pushHistory: (stateId: string) => void;
    popHistory: () => string | undefined;
}

export const useGestureStore = create<GestureState>((set, get) => ({
    gestureMode: 'NONE',
    pointer: { x: 0, y: 0, z: 0 },
    setGestureMode: (mode) => set({ gestureMode: mode }),
    setPointer: (x, y, z) => set({ pointer: { x, y, z } }),

    history: [],
    pushHistory: (stateId) => set((state) => ({ history: [...state.history, stateId] })),
    popHistory: () => {
        const { history } = get();
        if (history.length === 0) return undefined;
        const newHistory = [...history];
        const popped = newHistory.pop();
        set({ history: newHistory });
        return popped;
    }
}));
