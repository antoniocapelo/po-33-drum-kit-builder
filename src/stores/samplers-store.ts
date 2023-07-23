/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Frequency, Sampler, ToneAudioBuffer } from "tone";
import { create } from "zustand";
import { SamplesMap } from "../App";
import { playPad as playPadSounds } from "../components/Sample/playPad";
import { useExperienceState } from "./experience-store";

export interface PadState {
  samplers: Array<Sampler>;
  baseNote: number;
  baseVolume: number;
  padNumber: number;
}

export const DEFAULT_BASE_NOTE = 60;
export const DEFAULT_BASE_VOL = -6;

interface SamplersState {
  samplers: Record<number, PadState>;
  addSampler: (pad: number, sampler: Sampler) => void;
  copyPad: (from: number, to: number) => void;
  mergePads: (from: number, to: number) => void;
  removeSampler: (pad: number) => void;
  playPad: (padNumber: number) => void;
  playAll: () => Promise<void>;
  setVolume: (pad: number, to: number) => void;
}

const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const useSamplerStore = create<SamplersState>((set, get) => ({
  samplers: {},
  playPad: (padNumber) => {
    playPadSounds(get().samplers[padNumber]);
  },
  playAll: async () => {
    const samplers = get().samplers;

    const keys = Object.keys(samplers);

    for (let index = 0; index < keys.length; index++) {
      const element = keys[index];
      playPadSounds(samplers[+element]);
      await timer(350);
    }
  },
  copyPad: (from: number, to: number) => {
    const fromPad = get().samplers[from];
    const toPad = get().samplers[to];
    if (fromPad && !toPad) {
      const newState: PadState = {
        samplers: [],
        baseVolume: fromPad.baseVolume,
        baseNote: fromPad.baseNote,
        padNumber: to,
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
        newSampler.volume.value = newState.baseVolume;
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
        newSampler.volume.value = s.volume.value;
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
    playPadSounds(get().samplers[to]);
  },
  addSampler: (padNumber, sampler) =>
    set(({ samplers }) => {
      if (samplers[padNumber]) {
        return {
          samplers: {
            ...samplers,
            [padNumber]: {
              samplers: [...samplers[padNumber].samplers, sampler],
              baseNote: samplers[padNumber].baseNote,
              baseVolume: samplers[padNumber].baseVolume,
              padNumber,
            },
          },
        };
      }
      return {
        samplers: {
          ...samplers,
          [padNumber]: {
            samplers: [sampler],
            baseNote: DEFAULT_BASE_NOTE,
            baseVolume: DEFAULT_BASE_VOL,
            padNumber,
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
  setVolume: (padNumber, newValue) => {
    const pad = get().samplers[padNumber];
    const diff = pad.baseVolume - newValue;
    console.log(diff);
    set(({ samplers }) => {
      return {
        samplers: {
          ...samplers,
          [padNumber]: {
            ...samplers[padNumber],
            baseVolume: newValue,
          },
        },
      };
    });
    pad.samplers.forEach((sampler) => {
      sampler.volume.value = sampler.volume.value - diff;
    });
  },
}));
