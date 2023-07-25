import { create } from "zustand";

type UtilState = "idle" | "playing" | "exporting";

interface ExperienceState {
  currentPad?: number;
  setCurrentPad: (padNumber: number) => void;
  state: UtilState;
  setIsExporting: () => void;
  setIsIdle: () => void;
  setIsPlaying: () => void;
}

export const useExperienceState = create<ExperienceState>((set) => ({
  currentPad: undefined,
  state: "idle",
  setCurrentPad: (padNumber) => set({ currentPad: padNumber }),
  setIsExporting: () => set({ state: "exporting" }),
  setIsIdle: () => set({ state: "idle" }),
  setIsPlaying: () => set({ state: "playing" }),
}));
