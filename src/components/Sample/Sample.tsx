import { useRef } from "react";
import useKeypress from "react-use-keypress";
import { Sampler, ToneAudioBuffer } from "tone";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { useSamplerStore } from "../../stores/samplers-store";
import "./Sample.css";
import { playAllSamples } from "./playAllSamples";

const keyNumberMap: Record<number, string | number> = {
  1: "1",
  2: "2",
  3: "3",
  4: "4",
  5: "q",
  6: "w",
  7: "e",
  8: "r",
  9: "a",
  10: "s",
  11: "d",
  12: "f",
  13: "z",
  14: "x",
  15: "c",
  16: "v",
};

export const Sample = ({ number }: { number: number }) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const sampler = useSamplerStore(
    (state: { samplers: Record<number, Sampler> }) => state.samplers[number]
  );
  const setSampler = useSamplerStore((state) => state.addSampler);

  const { isOver, setNodeRef } = useDroppable({
    id: `droppable-${number}`,
    data: {
      padNumber: number,
      sampler,
    },
  });
  const style = {
    opacity: isOver ? 0.5 : 1,
    background: isOver ? "#ddd" : "transparent",
  };

  const {
    attributes,
    listeners,
    setNodeRef: setNodeRefDraggable,
    isDragging,
    transform,
  } = useDraggable({
    id: `draggable-${number}`,
    data: {
      padNumber: number,
      sampler,
    },
  });

  // const [sampler, setSampler] = useState<Sampler | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const num = keyNumberMap[number];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  useKeypress(num, (e: KeyboardEvent) => {
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
      return;
    }
    // Do something when the user has pressed the Escape key
    if (sampler) {
      buttonRef.current?.focus();
      buttonRef.current?.click();
    } else {
      inputRef.current?.click();
    }
  });

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const fileValue = e.target.files?.[0];
    if (!fileValue) {
      return;
    }
    const file = URL.createObjectURL(fileValue);
    const audioBuffer = new ToneAudioBuffer(file);
    const player = new Sampler(
      {
        C0: audioBuffer,
      },
      () => {
        player.triggerAttack(["C0"]);
        setSampler(number, player);
      }
    ).toDestination();
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (sampler) {
      playAllSamples(sampler);
    } else {
      inputRef.current?.click();
    }
  };

  return (
    <div className="sample" ref={setNodeRef} style={style}>
      <div className={sampler ? "led active" : "led"}></div>
      <input ref={inputRef} type="file" onChange={handleFileSelected} />
      <div
        ref={setNodeRefDraggable}
        className="draggable"
        style={
          transform
            ? {
                transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
                position: "absolute",
                zIndex: "2",
                cursor: "move",
              }
            : { position: "static" }
        }
        {...listeners}
        {...attributes}
      >
        <button ref={buttonRef} onClick={handleClick}>
          {number}
        </button>
      </div>
      {isDragging && <button>{number}</button>}
    </div>
  );
};
