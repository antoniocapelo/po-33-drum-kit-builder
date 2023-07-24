/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { PrimeReactProvider } from "primereact/api";
//theme
import "primereact/resources/themes/lara-light-indigo/theme.css";

//core
import "primereact/resources/primereact.min.css";

import { ToneAudioBuffer } from "tone";
import "./App.css";
import { Display } from "./components/Display/Display";
import { Sample } from "./components/Sample/Sample";
import { VolumeKnob } from "./components/VolumeKnob/VolumeKnob";
import { useExperienceState } from "./stores/experience-store";
import { useSamplerStore } from "./stores/samplers-store";
import { PitchKnob } from "./components/PitchKnob/PitchKnob";

export interface SamplesMap {
  [note: string]: ToneAudioBuffer | AudioBuffer | string;
  [midi: number]: ToneAudioBuffer | AudioBuffer | string;
}

function App() {
  const copyPad = useSamplerStore((state) => state.copyPad);
  const removeSampler = useSamplerStore((state) => state.removeSampler);
  const playAll = useSamplerStore((state) => state.playAll);
  const saveAll = useSamplerStore((state) => state.saveAll);
  const mergePads = useSamplerStore((state) => state.mergePads);
  const setCurrentPad = useExperienceState().setCurrentPad;
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const sensors = useSensors(pointerSensor);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (
      over &&
      over.data.current?.padNumber !== active?.data?.current?.padNumber
    ) {
      // clearing sample
      if (over.data.current?.display) {
        removeSampler(active?.data.current?.padNumber as number);
        return;
      }
      // destiny is empty
      if (active.data.current?.pad && !over.data.current?.pad) {
        copyPad(
          active.data.current?.padNumber as number,
          over.data.current?.padNumber as number
        );
      } else if (active.data.current?.pad && over.data.current?.pad) {
        // merge samples
        mergePads(
          active.data.current!.padNumber as number,
          over.data.current!.padNumber as number
        );
        setCurrentPad(over.data.current.padNumber as number);
      }
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <PrimeReactProvider>
        <Display />
        <div className="func">
          {Array.from(new Array(5)).map((_, idx) => (
            <button key={idx} disabled style={{ background: "#ddd" }}></button>
          ))}
        </div>
        <div className="row">
          <div className="pads">
            {Array.from(new Array(16)).map((_, idx) => (
              <Sample key={idx} number={idx + 1} />
            ))}
          </div>
          <div className="func2">
            <PitchKnob />
            <VolumeKnob />
            <button
              title="Save drumkit to file"
              style={{ background: "#ddd" }}
              onClick={() => {
                void saveAll();
              }}
            >
              <svg
                version="1.1"
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                y="0px"
                viewBox="0 0 92.2 122.88"
                className="play"
                width="16px"
                height="16px"
              >
                <g>
                  <polygon points="92.2,60.97 0,122.88 0,0 92.2,60.97" />
                </g>
              </svg>
            </button>
            <button
              title="Play whole drumkit"
              style={{ background: "#ddd" }}
              onClick={() => {
                void playAll();
              }}
            >
              <svg
                version="1.1"
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                y="0px"
                viewBox="0 0 92.2 122.88"
                className="play"
                width="16px"
                height="16px"
              >
                <g>
                  <polygon points="92.2,60.97 0,122.88 0,0 92.2,60.97" />
                </g>
              </svg>
            </button>
          </div>
        </div>
      </PrimeReactProvider>
    </DndContext>
  );
}

export default App;
