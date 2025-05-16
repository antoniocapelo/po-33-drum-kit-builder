import { Knob } from "primereact/knob";
import { useExperienceState } from "../../stores/experience-store";
import {
  DEFAULT_BASE_NOTE,
  useSamplerStore,
} from "../../stores/samplers-store";
import { mapValueToRange } from "../Display/Display";

const MAX_PITCH = 2;
const MIN_PITCH = 0.05;

const MAX_UI = 50;
const MIN_UI = 0;

export const PitchKnob = () => {
  const currentPad = useExperienceState().currentPad;
  const setPitch = useSamplerStore().setPitch;
  const currentPadState = useSamplerStore().samplers[currentPad as number];

  const val: number = currentPadState
    ? mapValueToRange(
      currentPadState.baseNote,
      MIN_PITCH,
      MAX_PITCH,
      MIN_UI,
      MAX_UI
    )
    : DEFAULT_BASE_NOTE;
  return (
    <Knob
      value={val}
      onChange={(e) => {
        if (currentPad) {
          const value = mapValueToRange(e.value, MIN_UI, MAX_UI, MIN_PITCH, MAX_PITCH)
          setPitch(
            currentPad,
            value
          );
        }
      }}
      size={54}
      valueColor="#444"
      rangeColor="#f9f9f9"
      valueTemplate={"Pitch"}
      min={MIN_UI}
      max={MAX_UI}
    />
  );
};
