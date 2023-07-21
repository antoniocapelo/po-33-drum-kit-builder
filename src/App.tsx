/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Sampler, ToneAudioBuffer } from "tone";
import { MidiNote } from "tone/build/esm/core/type/NoteUnits";
import "./App.css";
import { Sample } from "./components/Sample/Sample";
import { useSamplerStore } from "./stores/samplers-store";
import { Display } from "./components/Display/Display";
import { DragEvent } from "react";

interface SamplesMap {
  [note: string]: ToneAudioBuffer | AudioBuffer | string;
  [midi: number]: ToneAudioBuffer | AudioBuffer | string;
}

function App() {
  const setSampler = useSamplerStore((state) => state.addSampler);
  const removeSampler = useSamplerStore((state) => state.removeSampler);
  const playAll = useSamplerStore((state) => state.playAll);
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
      if (active.data.current?.sampler && !over.data.current?.sampler) {
        const originSampler = active.data.current?.sampler as Sampler;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        const sampleMap = originSampler["_buffers"]["_buffers"] as Map<
          number,
          ToneAudioBuffer
        >;
        const sampleMapNotes: SamplesMap = {};

        let counter = 0;
        sampleMap.forEach((value) => {
          sampleMapNotes[`C${counter}`] = value;
          counter++;
        });
        const newSampler = new Sampler(sampleMapNotes, () => {
          newSampler.triggerAttack(["C0"]);
          setSampler(over.data.current!.padNumber as number, newSampler);
        }).toDestination();
        // both have samples
      } else if (active.data.current?.sampler && over.data.current?.sampler) {
        const droppable = over.data.current?.sampler as Sampler;
        const dragged = active.data.current.sampler as Sampler;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const originBuffers: Map<number, ToneAudioBuffer> = dragged["_buffers"][
          "_buffers"
        ] as any;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const destinyBuffers: Map<number, ToneAudioBuffer> = dragged[
          "_buffers"
        ]["_buffers"] as any;

        // get next note in destiny
        let nextNote = destinyBuffers.size;

        // get all origin samples
        originBuffers.forEach((buff) => {
          droppable.add(`C${nextNote}` as unknown as MidiNote, buff);
          nextNote = nextNote + 1;
        });
      }
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
          {Array.from(new Array(3)).map((_, idx) => (
            <button disabled key={idx} style={{ background: "#ddd" }}></button>
          ))}
          <button
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
    </DndContext>
  );
}

export default App;
