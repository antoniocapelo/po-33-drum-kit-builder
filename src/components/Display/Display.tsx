import { useDndContext, useDroppable } from "@dnd-kit/core";
import drawBuffer from 'draw-wave'
import "./Display.css";
import { useExperienceState } from "../../stores/experience-store";
import { useSamplerStore } from "../../stores/samplers-store";
import { useEffect, useRef } from "react";

export function mapValueToRange(
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number,
  round = true,
  decimalPlaces = 3,
) {
  // First, normalize the input value to a value between 0 and 1 within its range.
  const normalizedValue = (value - fromMin) / (fromMax - fromMin);

  // Then, map the normalized value to the target range.
  //
  const mappedValue = toMin + normalizedValue * (toMax - toMin);

  if (round) {
    return +mappedValue.toFixed(decimalPlaces);
  }

  return mappedValue
}



export const Display = () => {
  const stopAll = useSamplerStore().stopAll;
  const dndContext = useDndContext();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const padNumber = useExperienceState().currentPad;
  const isIdle = useExperienceState((state) => state.state === "idle");
  const currentPad = useSamplerStore().getSampleForPadNumber(padNumber)
  const isExporting = useExperienceState(
    (state) => state.state === "exporting"
  );
  const isPlaying = useExperienceState((state) => state.state === "playing");
  const { isOver, setNodeRef } = useDroppable({
    id: `droppable-display`,
    data: {
      display: true,
    },
  });

  const isDragging = !!dndContext.active;

  const style = {
    opacity: isOver ? 0.5 : 1,
    background: isOver ? "#f14141" : undefined,
    color: isOver ? "#f9f9f9" : undefined,
  };

  useEffect(() => {
    if (isPlaying || isDragging || isExporting) {
      canvasRef.current?.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    } else if (currentPad) {
      const context = canvasRef.current?.getContext('2d');
      if (context && canvasRef.current) {
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        context?.clearRect(0, 0, width, height);
        currentPad.forEach((sample) => {
          const buffer = sample.buffer
          const duration = buffer?.duration;
          if (buffer && duration) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            drawBuffer.canvas(canvasRef.current, buffer, '#fc9c1f');
            context.beginPath();
            const trimStart = mapValueToRange(0, 0, duration, 0, width)
            const trimEnd = mapValueToRange(duration, 0, duration, 0, width)
            context.strokeStyle = '#FFFFFF';
            // Start
            context.moveTo(trimStart, 0);
            context.lineTo(trimStart, height);
            context.stroke();
            context.globalAlpha = 0.8;
            context.fillStyle = "#394053";
            context.fillRect(0, 0, trimStart, height);
            // End
            context.moveTo(trimEnd, 0);
            context.lineTo(trimEnd, height);
            context.stroke();
            context.fillRect(trimEnd, 0, width - trimEnd, height);
            context.globalAlpha = 1.0;
          }
        })
      }
    }

  }, [currentPad, isPlaying, isDragging, isExporting])

  return (
    <div style={style} ref={setNodeRef} className="display" onClick={stopAll}>
      <canvas ref={canvasRef} className="canvas" />
      {isDragging ? (
        <div>
          <p>Drag here to remove the sound</p>
          <p>Drag on an empty pad to copy it</p>
          <p>Drag on a used pad to merge</p>
        </div>
      ) : null}
      {!isDragging && isIdle && !currentPad ? (
        <div className="info">
          <p>PO-33 drum kit builder</p>
          <p>
            Add samples to pads and, when you're ready, save them to a file or play
            them into your PO-33.
          </p>
        </div>
      ) : null}
      {isExporting ? (
        <div>
          <p>Exporting…</p>
        </div>
      ) : null}
      {isPlaying ? (
        <div>
          <p>Playing…</p>
        </div>
      ) : null}
    </div>
  );
};
