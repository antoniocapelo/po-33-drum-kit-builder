/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Frequency } from "tone";
import { PadState } from "../../stores/samplers-store";

export const playPad = (sampler: PadState) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  console.log(sampler.samplers)
  sampler.samplers.forEach((s) => {
    s.triggerAttack([Frequency(sampler.baseNote, "midi").toFrequency()]);
  });
};
