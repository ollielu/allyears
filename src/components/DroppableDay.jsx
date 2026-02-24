import { useDroppable } from '@dnd-kit/core';

export function DroppableDay({ dateKey, children, className, onClick }) {
  const { isOver, setNodeRef } = useDroppable({
    id: dateKey,
  });

  const style = {
    // 當拖曳物在上方時，顯示淡淡的黃色背景
    backgroundColor: isOver ? 'rgba(255, 255, 0, 0.2)' : undefined,
  };

  return (
    <div 
      ref={setNodeRef} 
      // 🔴 修改重點：
      // 1. 移除 min-h-[50px] (這就是讓格子變太大的兇手)
      // 2. 改用 min-h-[24px] (只要比日期數字稍微高一點點就好)
      // 3. 加上 h-full (確保它會填滿整個父容器的高度)
      // 4. 加上 flex-col (讓內容垂直排列)
      className={`${className} w-full h-full min-h-[24px] flex flex-col`} 
      style={style} 
      onClick={onClick}
    >
      {children}
    </div>
  );
}