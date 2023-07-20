/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Sampler, ToneAudioBuffer } from "tone";

export const playAllSamples = (sampler: Sampler) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const destinyBuffers: Map<number, ToneAudioBuffer> = sampler["_buffers"][
    "_buffers"
  ] as any;

  const notes = [];
  for (let index = 0; index < destinyBuffers.size; index++) {
    notes.push(`C${index}`);
  }
  sampler.triggerAttack(notes);
};
