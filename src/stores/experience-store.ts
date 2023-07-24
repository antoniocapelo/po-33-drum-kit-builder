import { create } from "zustand";

interface ExperienceState {
  currentPad?: number;
  isExporting: boolean;
  setCurrentPad: (padNumber: number) => void;
  setIsExporting: (is: boolean) => void;
}

export const useExperienceState = create<ExperienceState>((set) => ({
  currentPad: undefined,
  isExporting: false,
  setCurrentPad: (padNumber) => set({ currentPad: padNumber }),
  setIsExporting: (is) => set({ isExporting: is }),
}));
