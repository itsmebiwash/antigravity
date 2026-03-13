import { create } from 'zustand';

interface GestureState {
    gestureMode: 'NONE' | 'FIST' | 'TWO_FINGER_SWIPE' | 'TRI_FINGER_PINCH' | 'ONE_TAP';
    pointer: { x: number; y: number; z: number };
    setGestureMode: (mode: 'NONE' | 'FIST' | 'TWO_FINGER_SWIPE' | 'TRI_FINGER_PINCH' | 'ONE_TAP') => void;
    setPointer: (x: number, y: number, z: number) => void;

    // State history for undo/redo
    history: any[];
    pushHistory: (state: any) => void;
    popHistory: () => any | undefined;
}

export const useGestureStore = create<GestureState>((set, get) => ({
    gestureMode: 'NONE',
    pointer: { x: 0, y: 0, z: 0 },
    setGestureMode: (mode) => set({ gestureMode: mode }),
    setPointer: (x, y, z) => set({ pointer: { x, y, z } }),

    history: [],
    pushHistory: (state) => set((s) => ({ history: [...s.history, state] })),
    popHistory: () => {
        const { history } = get();
        if (history.length === 0) return undefined;
        const newHistory = [...history];
        const popped = newHistory.pop();
        set({ history: newHistory });
        return popped;
    }
}));
