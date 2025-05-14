import { Knob } from "primereact/knob";
import { useSamplerStore } from "../../stores/samplers-store";
import { useExperienceState } from "../../stores/experience-store";

export const StartKnob = () => {
    const currentPad = useExperienceState().currentPad;
    const samplers = useSamplerStore().samplers;
    const setStart = useSamplerStore().setStart;

    const currentPadState = samplers[currentPad as number];
    const startValue = currentPadState?.start || 0;
    const endValue = currentPadState?.end || 1; // Default to 1 if no value

    return (
        <Knob
            value={startValue * 100} // Convert to percentage for UI
            onChange={(e) => {
                if (currentPad) {
                    if (e.value > endValue * 100) {
                        setStart(currentPad, endValue);
                        return;
                    }
                    const newStart = e.value / 100; // Convert back to 0-1 range
                    setStart(currentPad, newStart);
                }
            }}
            size={54}
            valueColor="#444"
            rangeColor="#f9f9f9"
            valueTemplate="Start"
            min={0}
            max={100} // Represent 0-1 as 0-100 for UI
        />
    );
};