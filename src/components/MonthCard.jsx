import { useMemo } from 'react';
import { DateRow } from './DateRow';
import { getTodayKey } from '../types/event';

/**
 * 單一月份條列式直欄：日期 + 該日事件（可選顯示全部事件）
 * @param {Object} props
 * @param {boolean} props.showAllEvents - 為 true 時該日顯示所有事件（單月模式）
 */
export function MonthCard({ year, month, isDark, weekdayFormat = 'zh', getEventCount, getPrimaryEvent, getEventsForDate, onDateClick, showAllEvents = false }) {
  const todayKey = getTodayKey();

  const { days, monthName } = useMemo(() => {
    const last = new Date(year, month, 0);
    const totalDays = last.getDate();
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    return { days, monthName: `${month} 月` };
  }, [year, month]);

  const toDateKey = (day) => {
    const m = String(month).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  return (
    <div className={`rounded-lg border shadow-sm overflow-hidden min-w-0 w-full ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'}`}>
      <div className={`px-2 py-1.5 border-b ${isDark ? 'border-slate-600 bg-slate-700/50' : 'border-gray-100 bg-gray-50/80'}`}>
        <h3 className={`text-xs font-medium ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>{monthName}</h3>
      </div>
      <table className="w-full border-collapse text-xs">
        <tbody>
          {days.map((day) => {
            const dateKey = toDateKey(day);
            const isToday = dateKey === todayKey;
            const eventCount = getEventCount(dateKey);
            const primaryEvent = getPrimaryEvent(dateKey);
            const events = showAllEvents && getEventsForDate ? getEventsForDate(dateKey) : null;
            const weekday = new Date(year, month - 1, day).getDay();
            return (
              <DateRow
                key={day}
                day={day}
                weekday={weekday}
                weekdayFormat={weekdayFormat}
                isDark={isDark}
                isToday={isToday}
                primaryEvent={primaryEvent}
                eventCount={eventCount}
                events={events}
                showAllEvents={showAllEvents}
                onClick={() => onDateClick(dateKey)}
                isEvenRow={day % 2 === 0}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
