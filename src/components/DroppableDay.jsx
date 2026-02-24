import { useDroppable } from '@dnd-kit/core';

export function DroppableDay({ dateKey, children, className, onClick }) {
  const { isOver, setNodeRef } = useDroppable({
    id: dateKey, // 格子的 ID 就是日期字串 (例如 "2024-01-01")
  });

  // 如果有東西拖到我頭上，變色提示
  const style = {
    backgroundColor: isOver ? 'rgba(59, 130, 246, 0.2)' : undefined, 
  };

  return (
    <div 
      ref={setNodeRef} 
      className={className} 
      style={style} 
      onClick={onClick}
    >
      {children}
    </div>
  );
}