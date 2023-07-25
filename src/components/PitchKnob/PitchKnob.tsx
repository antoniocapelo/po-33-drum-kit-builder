import { Knob } from "primereact/knob";
import { useExperienceState } from "../../stores/experience-store";
import {
  DEFAULT_BASE_NOTE,
  useSamplerStore,
} from "../../stores/samplers-store";

export const PitchKnob = () => {
  const currentPad = useExperienceState().currentPad;
  const setPitch = useSamplerStore().setPitch;
  const currentPadState = useSamplerStore().samplers[currentPad as number];
  const val = currentPadState
    ? currentPadState.baseNote - DEFAULT_BASE_NOTE
    : 0;

  return (
    <Knob
      value={val}
      onChange={(e) => {
        if (currentPad) {
          const newValue = DEFAULT_BASE_NOTE + e.value;
          setPitch(currentPad, newValue);
        }
      }}
      size={54}
      valueColor="#444"
      rangeColor="#f9f9f9"
      valueTemplate={"Pitch"}
      min={-12}
      max={12}
    />
  );
};
