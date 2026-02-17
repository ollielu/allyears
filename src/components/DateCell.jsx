import { useCallback } from 'react';

/**
 * 單一日期的格子
 * @param {Object} props
 * @param {number} props.day - 日期數字 (1-31)，空白則為 null
 * @param {boolean} props.isToday - 是否為今日
 * @param {number} props.eventCount - 該日事件數量
 * @param {Function} props.onClick - 點擊時回調
 */
export function DateCell({ day, isToday, eventCount, onClick }) {
  const handleClick = useCallback(() => {
    if (day != null && onClick) onClick(day);
  }, [day, onClick]);

  const isEmpty = day == null;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isEmpty}
      className={`
        relative flex flex-col items-center justify-center min-h-[28px] text-sm
        rounded transition-colors
        ${isEmpty ? 'cursor-default text-transparent bg-transparent' : 'cursor-pointer'}
        ${!isEmpty && !isToday ? 'hover:bg-gray-200/60 text-gray-600' : ''}
        ${isToday ? 'bg-blue-100 text-blue-700 font-semibold ring-1 ring-blue-400' : ''}
      `}
    >
      {!isEmpty && <span>{day}</span>}
      {!isEmpty && eventCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1
            text-[10px] font-medium text-white bg-red-500 rounded-full"
        >
          {eventCount > 99 ? '99+' : eventCount}
        </span>
      )}
    </button>
  );
}
