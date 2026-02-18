import { useCallback } from 'react';

const WEEKDAY_ZH = ['日', '一', '二', '三', '四', '五', '六'];
const WEEKDAY_EN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** 依 event.color 回傳文字顏色 class */
function getEventColorClass(color, isDark) {
  const map = {
    blue: isDark ? 'text-blue-400' : 'text-blue-600',
    green: isDark ? 'text-emerald-400' : 'text-emerald-600',
    orange: isDark ? 'text-orange-400' : 'text-orange-600',
    red: isDark ? 'text-red-400' : 'text-red-600',
    purple: isDark ? 'text-violet-400' : 'text-violet-600',
  };
  return map[color] || (isDark ? 'text-slate-300' : 'text-slate-700');
}

export function DateRow({ day, weekday, weekdayFormat = 'zh', isDark = false, isToday, primaryEvent, eventCount, events, showAllEvents, onClick, isEvenRow }) {
  const handleClick = useCallback(() => {
    if (onClick) onClick();
  }, [onClick]);

  const baseRowBg = isEvenRow ? (isDark ? 'bg-slate-700/30' : 'bg-slate-50/50') : (isDark ? 'bg-slate-800' : 'bg-white');
  let rowBg = isToday ? (isDark ? 'bg-amber-900/50' : 'bg-amber-50') : baseRowBg;
  if (!isToday && weekday === 0) rowBg = isDark ? 'bg-red-900/30' : 'bg-red-50/60';
  if (!isToday && weekday === 6) rowBg = isDark ? 'bg-blue-900/20' : 'bg-blue-50/40';

  const weekdayLabel = weekdayFormat === 'en' ? WEEKDAY_EN[weekday ?? 0] : WEEKDAY_ZH[weekday ?? 0];
  const isSunday = weekday === 0;
  const isSaturday = weekday === 6;

  const weekdayColor = isSunday ? (isDark ? 'text-red-400' : 'text-red-600') : isSaturday ? (isDark ? 'text-blue-400' : 'text-blue-600') : (isDark ? 'text-slate-400' : 'text-slate-600');

  const sortedEvents = showAllEvents && Array.isArray(events) && events.length > 0
    ? [...events].sort((a, b) => (a.time || '').localeCompare(b.time || ''))
    : null;

  const eventColorClass = primaryEvent?.color
    ? getEventColorClass(primaryEvent.color, isDark)
    : primaryEvent ? (isDark ? 'text-slate-300' : 'text-slate-700') : (isDark ? 'text-slate-500' : 'text-slate-400');

  return (
    <tr
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className={`
        border-b cursor-pointer transition-colors
        ${isDark ? 'border-slate-600/50 hover:bg-slate-600/40' : 'border-slate-100 hover:bg-slate-100/80'}
        ${rowBg}
      `}
    >
      <td className={`px-1.5 py-0.5 w-8 tabular-nums align-top ${isToday ? (isDark ? 'text-amber-300 font-medium' : 'text-amber-800 font-medium') : (isDark ? 'text-slate-300' : 'text-slate-700')}`}>
        {day}
      </td>
      <td className={`px-1 py-0.5 w-6 text-[10px] font-medium align-top ${weekdayColor}`}>
        {weekdayLabel}
      </td>
      <td className={`px-1.5 py-0.5 align-top ${eventColorClass}`}>
        {sortedEvents ? (
          <ul className="min-w-0 space-y-0.5">
            {sortedEvents.map((ev) => (
              <li key={ev.id} className={`text-[11px] flex items-center gap-1.5 ${ev.color ? getEventColorClass(ev.color, isDark) : ''}`}>
                <span className="shrink-0 text-[10px] opacity-80">{ev.time || '–'}</span>
                <span className="truncate">{ev.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="flex items-center gap-1 min-w-0">
            <span className="truncate text-[11px]">
              {primaryEvent ? primaryEvent.title : ''}
            </span>
            {eventCount > 1 && (
              <span className="shrink-0 flex items-center justify-center min-w-[14px] h-[14px] text-[9px] font-medium text-white bg-red-500 rounded-full">
                {eventCount}
              </span>
            )}
          </span>
        )}
      </td>
    </tr>
  );
}
