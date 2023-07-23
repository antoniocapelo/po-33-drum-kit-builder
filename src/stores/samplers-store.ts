/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Frequency, Sampler, ToneAudioBuffer } from "tone";
import { create } from "zustand";
import { SamplesMap } from "../App";
import { playPad } from "../components/Sample/playPad";

export interface PadState {
  samplers: Array<Sampler>;
  baseNote: number;
}

export const DEFAULT_BASE_NOTE = 60;

interface SamplersState {
  samplers: Record<number, PadState>;
  addSampler: (pad: number, sampler: Sampler) => void;
  copyPad: (from: number, to: number) => void;
  mergePads: (from: number, to: number) => void;
  removeSampler: (pad: number) => void;
  playAll: () => Promise<void>;
}

const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const useSamplerStore = create<SamplersState>((set, get) => ({
  samplers: {},
  playAll: async () => {
    const samplers = get().samplers;

    const keys = Object.keys(samplers);

    for (let index = 0; index < keys.length; index++) {
      const element = keys[index];
      playPad(samplers[+element]);
      await timer(350);
    }
  },
  copyPad: (from: number, to: number) => {
    const fromPad = get().samplers[from];
    const toPad = get().samplers[to];
    if (fromPad && !toPad) {
      const newState: PadState = {
        samplers: [],
        baseNote: fromPad.baseNote,
      };
      fromPad.samplers.forEach((s) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        const sampleMap = s["_buffers"]["_buffers"] as Map<
          number,
          ToneAudioBuffer
        >;
        const sampleMapNotes: SamplesMap = {};

        sampleMap.forEach((value) => {
          sampleMapNotes[DEFAULT_BASE_NOTE] = value;
        });
        const newSampler = new Sampler(sampleMapNotes, () => {
          newSampler.triggerAttack([
            Frequency(newState.baseNote, "midi").toFrequency(),
          ]);
        }).toDestination();
        newState.samplers.push(newSampler);
      });

      set(({ samplers }) => {
        return {
          samplers: {
            ...samplers,
            [to]: newState,
          },
        };
      });
    }
  },
  mergePads: (from: number, to: number) => {
    const fromPad = get().samplers[from];
    const toPad = get().samplers[to];
    debugger;
    if (fromPad && toPad) {
      const newSamplers: Array<Sampler> = [];
      fromPad.samplers.forEach((s) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        const sampleMap = s["_buffers"]["_buffers"] as Map<
          number,
          ToneAudioBuffer
        >;
        const sampleMapNotes: SamplesMap = {};

        sampleMap.forEach((value) => {
          sampleMapNotes[DEFAULT_BASE_NOTE] = value;
        });
        const newSampler = new Sampler(sampleMapNotes, () => {
          newSampler.triggerAttack([
            Frequency(toPad.baseNote, "midi").toFrequency(),
          ]);
        }).toDestination();
        newSamplers.push(newSampler);
      });

      set(({ samplers }) => {
        return {
          samplers: {
            ...samplers,
            [to]: {
              ...toPad,
              samplers: [...toPad.samplers, ...newSamplers],
            },
          },
        };
      });
    }
    playPad(get().samplers[to]);
  },
  addSampler: (pad, sampler) =>
    set(({ samplers }) => {
      if (samplers[pad]) {
        return {
          samplers: {
            ...samplers,
            [pad]: {
              samplers: [...samplers[pad].samplers, sampler],
              baseNote: samplers[pad].baseNote,
            },
          },
        };
      }
      return {
        samplers: {
          ...samplers,
          [pad]: {
            samplers: [sampler],
            baseNote: DEFAULT_BASE_NOTE,
          },
        },
      };
    }),
  removeSampler: (pad: number) =>
    set(({ samplers }) => {
      delete samplers[pad];
      return {
        samplers,
      };
    }),
}));
