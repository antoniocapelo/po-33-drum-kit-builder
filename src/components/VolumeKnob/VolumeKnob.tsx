import { Knob } from "primereact/knob";
import { useExperienceState } from "../../stores/experience-store";
import { useSamplerStore } from "../../stores/samplers-store";

export const VolumeKnob = () => {
  const currentPad = useExperienceState().currentPad;
  const setVolume = useSamplerStore().setVolume;
  const currentPadState = useSamplerStore().samplers[currentPad as number];
  const val = currentPadState ? currentPadState.baseVolume : 0;

  console.log({ val });
  return (
    <Knob
      value={val}
      onChange={(e) => {
        if (currentPad) {
          setVolume(currentPad, e.value);
        }
      }}
      size={54}
      valueColor="#444"
      rangeColor="#ddd"
      valueTemplate={"Vol"}
      min={-40}
      max={20}
    />
  );
};
