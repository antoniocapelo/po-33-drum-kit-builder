import { useDndContext, useDroppable } from "@dnd-kit/core";
import "./Display.css";
import { useExperienceState } from "../../stores/experience-store";
export const Display = () => {
  const dndContext = useDndContext();
  const isExporting = useExperienceState((state) => state.isExporting);
  const { isOver, setNodeRef } = useDroppable({
    id: `droppable-display`,
    data: {
      display: true,
    },
  });

  const isDragging = !!dndContext.active;

  const style = {
    opacity: isOver ? 0.5 : 1,
    background: isOver ? "red" : undefined,
  };

  return (
    <div style={style} ref={setNodeRef} className="display">
      {isDragging ? (
        <div>
          <p>Drag here to remove the sound</p>
          <p>Drag on an empty one to copy it</p>
          <p>Drag on another one to merge</p>
        </div>
      ) : null}
      {!isDragging && !isExporting ? (
        <div>
          <p>Welcome to PO-33 drum kit util</p>
          <p>
            Start adding samples and when you're ready, play them into your
            PO-33.
          </p>
        </div>
      ) : null}
      {isExporting ? (
        <div>
          <p>Exporting…</p>
        </div>
      ) : null}
    </div>
  );
};
