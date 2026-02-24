import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export function DraggableEvent({ event, children }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(event.id), // 必須是字串
    data: { 
      type: 'event', 
      event: event // 把整顆事件物件帶著跑
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1, // 拖曳時變半透明
    zIndex: isDragging ? 999 : 'auto',
    cursor: 'grab',
    touchAction: 'none', // 重要：防止手機滑動干擾
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}