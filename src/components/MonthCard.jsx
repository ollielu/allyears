import { useMemo } from 'react';
import { DateRow } from './DateRow';
import { getTodayKey } from '../types/event';

/**
 * 單一月份條列式直欄：日期 + 該日最重要的事件
 * @param {Object} props
 * @param {number} props.year - 西元年
 * @param {number} props.month - 月份 (1-12)
 * @param {Function} props.getEventCount - (dateKey) => number
 * @param {Function} props.getPrimaryEvent - (dateKey) => { title, time } | null
 * @param {Function} props.onDateClick - (dateKey) => void
 */
export function MonthCard({ year, month, isDark, weekdayFormat = 'zh', getEventCount, getPrimaryEvent, onDateClick }) {
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
