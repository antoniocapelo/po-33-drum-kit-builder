import { useDndContext, useDndMonitor, useDroppable } from "@dnd-kit/core";
import "./Display.css";
export const Display = () => {
  const dndContext = useDndContext();
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
    </div>
  );
};
