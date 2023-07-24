import { create } from "zustand";

interface ExperienceState {
  currentPad?: number;
  setCurrentPad: (padNumber: number) => void;
}

export const useExperienceState = create<ExperienceState>((set) => ({
  currentPad: undefined,
  setCurrentPad: (padNumber) => set({ currentPad: padNumber }),
}));
