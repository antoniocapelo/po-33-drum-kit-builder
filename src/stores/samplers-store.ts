/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { createFFmpeg } from "@ffmpeg/ffmpeg";
import { Frequency, Recorder, Sampler, ToneAudioBuffer } from "tone";
import { create } from "zustand";
import { SamplesMap } from "../App";
import { playPad as playPadSounds } from "../components/Sample/playPad";

import hat from "./../assets/hat.wav";
import kick from "./../assets/kick.wav";
import rim from "./../assets/rim.wav";
import { stopPad } from "../components/Sample/stopPad";

export interface PadState {
  samplers: Array<Sampler>;
  baseNote: number;
  baseVolume: number;
  padNumber: number;
}

export const DEFAULT_BASE_NOTE = 60;
export const DEFAULT_BASE_VOL = 0;

interface SamplersState {
  samplers: Record<number, PadState>;
  addSampler: (pad: number, sampler: Sampler) => void;
  copyPad: (from: number, to: number) => void;
  mergePads: (from: number, to: number) => void;
  removeSampler: (pad: number) => void;
  playPad: (padNumber: number) => void;
  playAll: () => Promise<void>;
  stopAll: () => void;
  saveAll: () => Promise<void>;
  setVolume: (pad: number, to: number) => void;
  setPitch: (pad: number, to: number) => void;
  hasUploadedAtLeastOnce: boolean;
}

const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

const initialSamples = [kick, hat, rim];
const initialSamplers: Record<number, PadState> = {};
initialSamples.forEach((sample, idx) => {
  const padNumber = idx + 1;
  const player = new Sampler({
    [DEFAULT_BASE_NOTE]: sample,
  }).toDestination();

  initialSamplers[padNumber] = {
    padNumber: padNumber,
    baseNote: DEFAULT_BASE_NOTE,
    baseVolume: DEFAULT_BASE_VOL,
    samplers: [player],
  };
});

const recorder = new Recorder();

async function convertWebmToMp3(webmBlob: Blob): Promise<Blob> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const ffmpeg = createFFmpeg({ log: true });
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await ffmpeg.load();
  } catch (e) {
    console.error(e);
  }

  const inputName = "input.webm";
  const outputName = "output.mp3";

  function blob2uint(blob: Blob) {
    return new Response(blob).arrayBuffer().then((buffer) => {
      return new Uint8Array(buffer);
    });
  }

  const uint8data = await blob2uint(webmBlob);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  ffmpeg.FS(
    "writeFile",
    inputName,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    uint8data
  );

  console.log("yo");

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await ffmpeg.run("-i", inputName, outputName);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const outputData = ffmpeg.FS("readFile", outputName);
  const outputBlob = new Blob([outputData.buffer], { type: "audio/mp3" });

  return outputBlob;
}

const key = "has-uploaded-item";
const hasAnyPadBeenAdded = () => {
  if (typeof window !== "undefined") {
    const hasLSItem = localStorage.getItem(key);
    if (hasLSItem) {
      return true;
    }
  }
  return false;
};

export const useSamplerStore = create<SamplersState>((set, get) => ({
  hasUploadedAtLeastOnce: hasAnyPadBeenAdded(),
  samplers: hasAnyPadBeenAdded() ? {} : initialSamplers,
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
    await timer(350);
  },
  stopAll: () => {
    const samplers = get().samplers;

    const keys = Object.keys(samplers);

    for (let index = 0; index < keys.length; index++) {
      const element = keys[index];
      stopPad(samplers[+element]);
    }
  },
  saveAll: async () => {
    const samplers = get().samplers;

    const keys = Object.keys(samplers);

    for (let index = 0; index < keys.length; index++) {
      const padNumber = keys[index];
      const pad = samplers[+padNumber];
      pad.samplers.forEach((s) => s.connect(recorder));
    }

    void recorder.start();

    await get().playAll();
    const rec = await recorder.stop();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const mp3 = await convertWebmToMp3(rec);

    // download the recording by creating an anchor element and blob url
    const url = URL.createObjectURL(mp3);
    const anchor = document.createElement("a");
    anchor.download = "recording.wav";
    anchor.href = url;
    anchor.click();
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
  addSampler: (padNumber: string | number, sampler: Sampler) => {
    if (!get().hasUploadedAtLeastOnce) {
      localStorage.setItem(key, "true");
    }

    return set(({ samplers }) => {
      if (samplers[+padNumber]) {
        return {
          samplers: {
            ...samplers,
            [padNumber]: {
              samplers: [...samplers[+padNumber].samplers, sampler],
              baseNote: samplers[+padNumber].baseNote,
              baseVolume: samplers[+padNumber].baseVolume,
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
    });
  },
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
  setPitch: (padNumber, newValue) => {
    const pad = get().samplers[padNumber];
    const diff = pad.baseNote - newValue;
    console.log(diff);
    set(({ samplers }) => {
      return {
        samplers: {
          ...samplers,
          [padNumber]: {
            ...samplers[padNumber],
            baseNote: newValue,
          },
        },
      };
    });
  },
}));
