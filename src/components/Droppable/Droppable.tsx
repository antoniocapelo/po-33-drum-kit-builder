import { useDroppable } from "@dnd-kit/core";
import { FC, PropsWithChildren } from "react";

export const Droppable: FC<PropsWithChildren> = ({ children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: "droppable",
  });
  const style = {
    background: isOver ? "green" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
};
