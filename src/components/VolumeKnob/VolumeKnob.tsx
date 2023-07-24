import { Knob } from "primereact/knob";
import { useExperienceState } from "../../stores/experience-store";
import { useSamplerStore } from "../../stores/samplers-store";

function mapValueToRange(
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
) {
  // First, normalize the input value to a value between 0 and 1 within its range.
  const normalizedValue = (value - fromMin) / (fromMax - fromMin);

  // Then, map the normalized value to the target range.
  const mappedValue = toMin + normalizedValue * (toMax - toMin);

  return mappedValue;
}

const MAX_VOL = 20;
const MIN_VOL = -40;

const MAX_UI = 50;
const MIN_UI = -50;

export const VolumeKnob = () => {
  const currentPad = useExperienceState().currentPad;
  const setVolume = useSamplerStore().setVolume;
  const currentPadState = useSamplerStore().samplers[currentPad as number];
  const val = currentPadState
    ? mapValueToRange(
        currentPadState.baseVolume,
        MIN_VOL,
        MAX_VOL,
        MIN_UI,
        MAX_UI
      )
    : 0;

  return (
    <Knob
      value={val}
      onChange={(e) => {
        if (currentPad) {
          setVolume(
            currentPad,
            mapValueToRange(e.value, MIN_UI, MAX_UI, MIN_VOL, MAX_VOL)
          );
        }
      }}
      size={54}
      valueColor="#444"
      rangeColor="#ddd"
      valueTemplate={"Vol"}
      min={MIN_UI}
      max={MAX_UI}
    />
  );
};
