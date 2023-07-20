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
import { Sampler, ToneAudioBuffer } from "tone";
import { MidiNote } from "tone/build/esm/core/type/NoteUnits";
import "./App.css";
import { Sample } from "./components/Sample/Sample";
import { useSamplerStore } from "./stores/samplers-store";

function App() {
  const setSampler = useSamplerStore((state) => state.addSampler);
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
      // destiny is empty
      if (active.data.current?.sampler && !over.data.current?.sampler) {
        setSampler(
          over.data.current!.padNumber as number,
          active.data.current?.sampler as Sampler
        );
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
        // setSampler(

        //   over.data.current!.padNumber as number,
        //   active.data.current?.sampler as Sampler
        // );
      }
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="func">
        {Array.from(new Array(5)).map((_, idx) => (
          <button key={idx} style={{ background: "#ddd" }}></button>
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
            <button key={idx} style={{ background: "#ddd" }}></button>
          ))}
          <button
            style={{ background: "#ddd" }}
            onClick={() => {
              void playAll();
            }}
          >
            &#8250;
          </button>
        </div>
      </div>
    </DndContext>
  );
}

export default App;
