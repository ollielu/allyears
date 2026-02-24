import { useDroppable } from '@dnd-kit/core';

export function DroppableDay({ dateKey, children, className, onClick }) {
  const { isOver, setNodeRef } = useDroppable({
    id: dateKey, // 這裡 ID 就是日期字串，不用變
  });

  // 當有東西拖過來時，背景變色提示
  const style = {
    backgroundColor: isOver ? 'rgba(255, 255, 0, 0.2)' : undefined,
  };

  return (
    <div 
      ref={setNodeRef} 
      // ⚠️ 關鍵：一定要加 min-h (最小高度) 和 w-full (全寬)
      // 否則空格子會縮成一條線，你根本丟不進去！
      className={`${className} min-h-[50px] w-full`} 
      style={style} 
      onClick={onClick}
    >
      {children}
    </div>
  );
}