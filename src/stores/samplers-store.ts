import { Sampler } from "tone";
import { create } from "zustand";
import { playAllSamples } from "../components/Sample/playAllSamples";

interface SamplersState {
  samplers: Record<number, Sampler>;
  addSampler: (pad: number, sampler: Sampler) => void;
  playAll: () => Promise<void>;
}

const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const useSamplerStore = create<SamplersState>((set, get) => ({
  samplers: {},
  playAll: async () => {
    const samplers = get().samplers;
    for (let index = 1; index <= Object.values(samplers).length; index++) {
      const element = samplers[index];
      playAllSamples(element);
      await timer(350);
    }
  },
  addSampler: (pad, sampler) =>
    set(({ samplers }) => {
      return {
        samplers: {
          ...samplers,
          [pad]: sampler,
        },
      };
    }),
  removeSampler: ({ pad }: { pad: number }) => set({ [pad]: undefined }),
}));
