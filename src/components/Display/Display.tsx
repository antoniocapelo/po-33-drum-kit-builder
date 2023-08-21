import { useDndContext, useDroppable } from "@dnd-kit/core";
import "./Display.css";
import { useExperienceState } from "../../stores/experience-store";
import { useSamplerStore } from "../../stores/samplers-store";
export const Display = () => {
  const stopAll = useSamplerStore().stopAll;
  const dndContext = useDndContext();
  const isIdle = useExperienceState((state) => state.state === "idle");
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

  return (
    <div style={style} ref={setNodeRef} className="display" onClick={stopAll}>
      {isDragging ? (
        <div>
          <p>Drag here to remove the sound</p>
          <p>Drag on an empty pad to copy it</p>
          <p>Drag on a used pad to merge</p>
        </div>
      ) : null}
      {!isDragging && isIdle ? (
        <div>
          <p>PO-33 drum kit builder</p>
          <p>
            Add drum samples and, when you're ready, save them to a file or play
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
