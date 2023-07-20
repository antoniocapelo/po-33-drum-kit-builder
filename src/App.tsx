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
import { Player, Sampler, ToneAudioBuffer, loaded } from "tone";
import "./App.css";
import { Droppable } from "./components/Droppable/Droppable";
import { Sample } from "./components/Sample/Sample";
import { useSamplerStore } from "./stores/samplers-store";
import { MidiNote } from "tone/build/esm/core/type/NoteUnits";

function App() {
  const setSampler = useSamplerStore((state) => state.addSampler);
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const sensors = useSensors(pointerSensor);

  const onClick = () => {
    async function play() {
      const player = new Player(
        "https://tonejs.github.io/audio/berklee/gong_1.mp3"
      ).toDestination();
      await loaded();
      player.start();
    }
    void play();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (
      over &&
      over.data.current?.padNumber !== active?.data?.current?.padNumber
    ) {
      console.log(over.data.current);
      console.log(active.data.current);
      if (active.data.current?.sampler && !over.data.current?.sampler) {
        setSampler(
          over.data.current!.padNumber as number,
          active.data.current?.sampler as Sampler
        );
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
        let nextNote = destinyBuffers.size + 1;

        // get all origin samples
        originBuffers.forEach((buff) => {
          console.log("yo", buff, nextNote);
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
          <button key={idx} style={{ background: "#ddd" }} onClick={onClick}>
            {idx + 1}
          </button>
        ))}
      </div>
      <Droppable>
        <div style={{ padding: 40 }}>yo</div>
      </Droppable>
      <div className="row">
        <div className="pads">
          {Array.from(new Array(16)).map((_, idx) => (
            <Sample key={idx} number={idx + 1} />
          ))}
        </div>
        <div className="func2">
          {Array.from(new Array(4)).map((_, idx) => (
            <button key={idx} style={{ background: "#ddd" }} onClick={onClick}>
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </DndContext>
  );
}

export default App;
