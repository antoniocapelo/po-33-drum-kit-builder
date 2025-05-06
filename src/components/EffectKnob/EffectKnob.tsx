import { Knob } from "primereact/knob";
import { useExperienceState } from "../../stores/experience-store";
import { useSamplerStore } from "../../stores/samplers-store";
import { Distortion, Reverb, FeedbackDelay, BitCrusher } from "tone";

interface EffectKnobProps {
  effect: "bitCrusher" | "distortion" | "reverb" | "feedbackDelay";
  label: string;
  min: number;
  max: number;
}

export const EffectKnob = ({ effect, label, min, max }: EffectKnobProps) => {
  const currentPad = useExperienceState().currentPad;
  const samplers = useSamplerStore().samplers;
  const setFxAmount = useSamplerStore().setFxAmount;

  const currentPadState = samplers[currentPad as number];
  const effectNode = currentPadState?.fx[effect] as BitCrusher | Distortion | Reverb | FeedbackDelay | null;
  const wetValue = effectNode ? effectNode.wet.value : 0;

  return (
    <Knob
      value={wetValue * 100} // Convert to percentage for UI
      onChange={(e) => {
        if (currentPad && effectNode) {
          const intensity = e.value / 100; // Convert back to 0-1 range
          setFxAmount(currentPad, effect, intensity);

          // Adjust the intensity parameter of the effect node
          switch (effect) {
            case "bitCrusher":
              (effectNode as BitCrusher).bits.value = Math.round(intensity * 8) + 1; // Map to 1-8 bits
              break;
            case "distortion":
              (effectNode as Distortion).distortion = intensity * 1; // Map to 0-1 distortion
              break;
            case "reverb":
              (effectNode as Reverb).decay = intensity * 10; // Map to 0-10 seconds decay
              break;
            case "feedbackDelay":
              (effectNode as FeedbackDelay).delayTime.value = intensity * 0.5; // Map to 0-1 seconds delay
              (effectNode as FeedbackDelay).feedback.value = intensity * 0.5; // Map to 0-1 seconds delay
              break;
          }
        }
      }}
      size={54}
      valueColor="#444"
      rangeColor="#f9f9f9"
      valueTemplate={label}
      min={min}
      max={max}
    />
  );
};