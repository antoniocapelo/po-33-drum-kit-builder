import { Sampler } from "tone";
import { create } from "zustand";

interface SamplersState {
  samplers: Record<number, Sampler>;
  addSampler: (pad: number, sampler: Sampler) => void;
}

export const useSamplerStore = create<SamplersState>((set) => ({
  samplers: {},
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
