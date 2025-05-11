/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PadState } from "../../stores/samplers-store";

export const stopPad = (sampler: PadState) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  sampler.players.forEach((p) => {
    p.stop();
  });
};
