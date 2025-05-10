/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PadState } from "../../stores/samplers-store";

export const playPad = (padState: PadState, start = 0) => {
  const players = padState.players;

  players.forEach((player) => {
    const offset = padState.start || 0;
    const duration = (padState.end || player.buffer.duration || 0) - offset;

    player.start(start, offset, duration);
  });
};
