/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { createFFmpeg } from "@ffmpeg/ffmpeg";
import {
  BitCrusher,
  Distortion,
  FeedbackDelay,
  Player,
  Recorder,
  Reverb,
  ToneAudioBuffer,
} from "tone";
import { create } from "zustand";
import { playPad as playPadSounds } from "../components/Sample/playPad";

import { stopPad } from "../components/Sample/stopPad";
import hat from "./../assets/hat.wav";
import kick from "./../assets/kick.wav";
import rim from "./../assets/rim.wav";

export interface PadState {
  players: Array<Player>;
  baseNote: number;
  baseVolume: number;
  padNumber: number;
  start: number;
  end: number;
  fx: {
    bitCrusher: BitCrusher;
    distortion: Distortion;
    reverb: Reverb;
    feedbackDelay: FeedbackDelay;
  };
}

export const DEFAULT_BASE_NOTE = 1;
export const DEFAULT_BASE_VOL = 0;

interface SamplersState {
  samplers: Record<number, PadState>;
  getSampleForPadNumber: (padNumber?: number) => PadState | undefined;
  addSampler: (pad: number, sampler: Player) => void;
  copyPad: (from: number, to: number) => void;
  mergePads: (from: number, to: number) => void;
  removeSampler: (pad: number) => void;
  playPad: (padNumber: number) => void;
  playAll: () => Promise<void>;
  stopAll: () => void;
  saveAll: () => Promise<void>;
  setVolume: (pad: number, to: number) => void;
  setPitch: (pad: number, to: number) => void;
  setFxAmount: (
    padNumber: number,
    effect: "bitCrusher" | "distortion" | "reverb" | "feedbackDelay",
    amount: number
  ) => void;
  addPlayer: (padNumber: number, audioFile: string) => void;
  hasUploadedAtLeastOnce: boolean;
  setStart: (padNumber: number, newStart: number) => void;
  setEnd: (padNumber: number, newEnd: number) => void;
}

const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

const createFreshEffects = () => {
  // Initialize effects
  const bitCrusher = new BitCrusher(4).toDestination();
  bitCrusher.wet.value = 0; // Start turned off

  const distortion = new Distortion(0.4).toDestination();
  distortion.oversample = "4x";
  distortion.wet.value = 0; // Start turned off

  const reverb = new Reverb({ decay: 2 }).toDestination();
  reverb.wet.value = 0; // Start turned off

  const feedbackDelay = new FeedbackDelay(0.5, 0.8).toDestination();
  feedbackDelay.wet.value = 0; // Start turned off

  return {
    bitCrusher,
    distortion,
    reverb,
    feedbackDelay,
  };
};

const initialSamples = [kick, hat, rim];
const initialSamplers: Record<number, PadState> = {};
initialSamples.forEach((sample, idx) => {
  const padNumber = idx + 1;

  const { feedbackDelay, bitCrusher, reverb, distortion } =
    createFreshEffects();

  const player = new Player(sample)
    .connect(bitCrusher)
    .connect(distortion)
    .connect(reverb)
    .connect(feedbackDelay)
    .toDestination();

  initialSamplers[padNumber] = {
    padNumber: padNumber,
    baseNote: DEFAULT_BASE_NOTE,
    baseVolume: DEFAULT_BASE_VOL,
    players: [player], // Replace `samplers` with `players`,
    start: 0,
    end: 1,
    fx: {
      bitCrusher,
      distortion,
      reverb,
      feedbackDelay,
    },
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  ffmpeg.FS("writeFile", inputName, uint8data);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await ffmpeg.run("-i", inputName, outputName);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
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
    const pad = get().samplers[padNumber];
    if (pad) {
      playPadSounds(pad);
    }
  },
  playAll: async () => {
    const samplers = get().samplers;

    const keys = Object.keys(samplers);

    for (let index = 0; index < keys.length; index++) {
      const element = keys[index];
      const pad = samplers[+element];
      playPadSounds(pad);
      let sampleDuration = 0;
      const feedbackDelay = pad.fx.feedbackDelay;
      // let's decide how much should we wait (200ms or more if the pad has the feedback delay active)
      // can we get the actual sample duration (in ms) from the sample? keep in mind we might have multiple samplers per pad, so we should get the maximum value from any sampler present in the array

      // let's update the logic below to use the sampleMap

      // Calculate the maximum duration from the sampleMap
      const dur =
        Math.max(...Array.from(pad.players).map((p) => p.buffer.duration)) *
        1000; // Convert to milliseconds
      if (dur > sampleDuration) {
        sampleDuration = dur;
      }
      //const sampleDuration = samplers[+element].samplers[0].buffers[0].duration * 1000;

      if (feedbackDelay.wet.value > 0) {
        const delayTime = feedbackDelay.delayTime.value as number;
        const feedback = feedbackDelay.feedback.value as number;

        // Calculate the effective duration of the delay, considering feedback
        const effectiveDelayDuration = delayTime * (1 / (1 - feedback));

        // Wait for the calculated duration plus a small buffer
        await timer(effectiveDelayDuration * 1000 + sampleDuration);
      } else {
        await timer(sampleDuration);
      }
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
      pad.fx.feedbackDelay.connect(recorder);
    }

    void recorder.start();

    await get().playAll();
    const rec = await recorder.stop();

    const mp3 = await convertWebmToMp3(rec);

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
        players: [],
        start: fromPad.start,
        end: fromPad.end,
        baseVolume: fromPad.baseVolume,
        baseNote: fromPad.baseNote,
        padNumber: to,
        fx: createFreshEffects(),
      };

      // Copy effect parameters and wet values
      newState.fx.bitCrusher.wet.value = fromPad.fx.bitCrusher.wet.value;
      newState.fx.bitCrusher.bits.value = fromPad.fx.bitCrusher.bits.value;

      newState.fx.distortion.wet.value = fromPad.fx.distortion.wet.value;
      newState.fx.distortion.distortion = fromPad.fx.distortion.distortion;

      newState.fx.reverb.wet.value = fromPad.fx.reverb.wet.value;
      newState.fx.reverb.decay = fromPad.fx.reverb.decay;

      newState.fx.feedbackDelay.wet.value = fromPad.fx.feedbackDelay.wet.value;
      newState.fx.feedbackDelay.feedback.value =
        fromPad.fx.feedbackDelay.feedback.value;

      fromPad.players.forEach((s) => {
        const sample: ToneAudioBuffer = s.buffer;

        const newSampler = new Player(sample, () => {
          newSampler.start(0, 0, sample.duration);
        })
          .connect(newState.fx.bitCrusher)
          .connect(newState.fx.distortion)
          .connect(newState.fx.reverb)
          .connect(newState.fx.feedbackDelay);

        newSampler.volume.value = newState.baseVolume;
        newState.players.push(newSampler);
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
      set(({ samplers }) => ({
        samplers: {
          ...samplers,
          [to]: {
            ...toPad,
            players: [...toPad.players, ...fromPad.players],
          },
        },
      }));
    }
  },
  getSampleForPadNumber(padNumber) {
    if (!padNumber) {
      return undefined;
    }

    const pad = get().samplers[padNumber];
    if (pad) {
      return pad;
    }
    return undefined;
  },
  addSampler: (padNumber: string | number, sampler: Player) => {
    if (!get().hasUploadedAtLeastOnce) {
      localStorage.setItem(key, "true");
    }

    return set(({ samplers }) => {
      if (!samplers) {
        return {};
      }
      if (samplers[+padNumber]) {
        return {
          samplers: {
            ...samplers,
            [padNumber]: {
              ...samplers[+padNumber],
              players: [...samplers[+padNumber].players, sampler],
            },
          },
        };
      }
      const fx = createFreshEffects();

      sampler
        .connect(fx.bitCrusher)
        .connect(fx.distortion)
        .connect(fx.reverb)
        .connect(fx.feedbackDelay);

      return {
        samplers: {
          ...samplers,
          [padNumber]: {
            players: [sampler],
            baseNote: DEFAULT_BASE_NOTE,
            baseVolume: DEFAULT_BASE_VOL,
            padNumber,
            fx,
          },
        },
      };
    });
  },
  addPlayer: (padNumber: number, audioFile: string) => {
    const fx = createFreshEffects();

    const player = new Player(audioFile)
      .connect(fx.bitCrusher)
      .connect(fx.distortion)
      .connect(fx.reverb)
      .connect(fx.feedbackDelay)
      .toDestination();

    set(({ samplers }) => ({
      samplers: {
        ...samplers,
        [padNumber]: {
          ...samplers[padNumber],
          players: [...samplers[padNumber].players, player],
        },
      },
    }));
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
    set(({ samplers }) => ({
      samplers: {
        ...samplers,
        [padNumber]: {
          ...pad,
          baseVolume: newValue,
        },
      },
    }));
    pad.players.forEach((player) => {
      player.volume.value -= diff; // Adjust volume
    });
  },
  setPitch: (padNumber, newValue) => {
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
  setFxAmount: (padNumber, effect, amount) => {
    const pad = get().samplers[padNumber];
    if (pad) {
      pad.fx[effect].wet.value = amount;
      set(({ samplers }) => ({
        samplers: {
          ...samplers,
          [padNumber]: {
            ...pad,
            fx: {
              ...pad.fx,
              [effect]: pad.fx[effect],
            },
          },
        },
      }));
    }
  },
  setStart: (padNumber, newStart) => {
    set(({ samplers }) => ({
      samplers: {
        ...samplers,
        [padNumber]: {
          ...samplers[padNumber],
          start: newStart,
        },
      },
    }));
  },
  setEnd: (padNumber, newEnd) => {
    set(({ samplers }) => ({
      samplers: {
        ...samplers,
        [padNumber]: {
          ...samplers[padNumber],
          end: newEnd,
        },
      },
    }));
  },
}));
