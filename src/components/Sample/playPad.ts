/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PadState } from "../../stores/samplers-store";

export const playPad = (padState: PadState, start = 0) => {
  const players = padState.players;
  const playerWithBiggestDuration = players.reduce((prev, curr) => {
    if (prev.buffer.duration > curr.buffer.duration) {
      return prev;
    } else {
      return curr;
    }
  });

  const bufferDuration = playerWithBiggestDuration.buffer.duration;

  players.forEach((player) => {
    const offset = (padState.start || 0) * bufferDuration;
    // Ensure offset is within the buffer duration
    if (offset < 0 || offset > bufferDuration) {
      console.error("Offset is out of bounds");
      return;
    }
    // Ensure end is within the buffer duration
    if (padState.end && padState.end > 1) {
      console.error("End is out of bounds");
      return;
    }
    // Ensure start is within the buffer duration
    const duration = (padState.end || 1) * bufferDuration - offset;

    player.start(start, offset, duration);
  });
};
