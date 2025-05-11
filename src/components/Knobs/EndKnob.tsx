import { Knob } from "primereact/knob";
import { useSamplerStore } from "../../stores/samplers-store";
import { useExperienceState } from "../../stores/experience-store";

export const EndKnob = () => {
    const currentPad = useExperienceState().currentPad;
    const samplers = useSamplerStore().samplers;
    const setEnd = useSamplerStore().setEnd;

    const currentPadState = samplers[currentPad as number];
    const endValue = currentPadState?.end || 1; // Default to 1 if no value
    const startValue = currentPadState?.start || 0; // Default to 0 if no value

    return (
        <Knob
            value={endValue * 100} // Convert to percentage for UI
            onChange={(e) => {
                // check if valu is greater than start
                if (currentPad) {
                    if (e.value < startValue * 100) {
                        setEnd(currentPad, startValue);
                        return;
                    }
                    const newEnd = e.value / 100; // Convert back to 0-1 range
                    setEnd(currentPad, newEnd);
                }
            }}
            size={54}
            valueColor="#444"
            rangeColor="#f9f9f9"
            valueTemplate="End"
            min={0} // Ensure end is greater than start
            max={100} // Represent 1 as 100 for UI
        />
    );
};