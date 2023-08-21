import { DragEvent, useRef, useState } from "react";
import useKeypress from "react-use-keypress";
import { Context, Frequency, Sampler, ToneAudioBuffer } from "tone";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { useExperienceState } from "../../stores/experience-store";
import {
  DEFAULT_BASE_NOTE,
  DEFAULT_BASE_VOL,
  PadState,
  useSamplerStore,
} from "../../stores/samplers-store";
import "./Sample.css";

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
  const pad = useSamplerStore(
    (state: { samplers: Record<number, PadState> }) => state.samplers[number]
  );
  const [showFileDragStyle, setFileDragStyle] = useState(false);
  const setSampler = useSamplerStore((state) => state.addSampler);
  const playPad = useSamplerStore((state) => state.playPad);
  const setCurrentPad = useExperienceState().setCurrentPad;

  const { isOver, setNodeRef } = useDroppable({
    id: `droppable-${number}`,
    data: {
      padNumber: number,
      pad,
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
      pad,
    },
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const num = keyNumberMap[number];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  useKeypress(num, (e: KeyboardEvent) => {
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
      return;
    }
    if (pad) {
      buttonRef.current?.focus();
      buttonRef.current?.click();
    } else {
      buttonRef.current?.focus();
      inputRef.current?.click();
    }
  });

  const createSamplerFromFile = (
    audioBuffer: AudioBuffer | ToneAudioBuffer
  ) => {
    const player = new Sampler(
      {
        [DEFAULT_BASE_NOTE]: audioBuffer,
      },
      () => {
        player.triggerAttack([
          Frequency(DEFAULT_BASE_NOTE, "midi").toFrequency(),
        ]);
        setSampler(number, player);
      }
    ).toDestination();
    player.volume.value = DEFAULT_BASE_VOL;
    setCurrentPad(number);
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const fileValue = e.target.files?.[0];
    if (!fileValue) {
      return;
    }

    const file = URL.createObjectURL(fileValue);
    const audioBuffer = new ToneAudioBuffer(file);
    createSamplerFromFile(audioBuffer);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (pad) {
      playPad(pad.padNumber);
      setCurrentPad(pad.padNumber);
    } else {
      inputRef.current?.click();
    }
  };

  const handleDragEvent = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Do something
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) {
      return;
    }

    if (e.dataTransfer.files.length === 1) {
      const file = e.dataTransfer.files[0];
      void file
        .arrayBuffer()
        .then((arrayBuffer) => {
          const audioContext = new Context();
          return audioContext.decodeAudioData(arrayBuffer);
        })
        .then((file) => createSamplerFromFile(file));
    }
    setFileDragStyle(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    handleDragEvent(e);
    setFileDragStyle(true);
  };
  const hideFileDragStyle = () => {
    setFileDragStyle(false);
  };
  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDragEvent}
      onDragLeave={hideFileDragStyle}
      onDragExit={hideFileDragStyle}
      style={
        showFileDragStyle
          ? {
              opacity: 0.5,
              background: "#ddd",
            }
          : {}
      }
    >
      <div className="sample" ref={setNodeRef} style={style}>
        <div className={pad ? "led active" : "led"}></div>
        {!pad && (
          <input
            ref={inputRef}
            type="file"
            onChange={handleFileSelected}
            // value={file}
          />
        )}
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
          tabIndex={-1}
        >
          <button ref={buttonRef} onClick={handleClick}>
            {number}
          </button>
        </div>
        {isDragging && <button>{number}</button>}
      </div>
    </div>
  );
};
