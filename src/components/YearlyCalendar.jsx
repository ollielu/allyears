import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { MonthCard } from './MonthCard';
import { EventModal } from './EventModal';

/**
 * 全年度行事曆主畫面：12 個月卡片 + Modal
 */
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_RANGE = Array.from({ length: 11 }, (_, i) => CURRENT_YEAR - 5 + i);

export function YearlyCalendar({ isDark, onToggleTheme, getEventCount, getPrimaryEventForDate, getEventsForDate, addEvent, updateEvent, deleteEvent }) {
  const [selectedDateKey, setSelectedDateKey] = useState(null);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [weekdayFormat, setWeekdayFormat] = useState('zh');

  const selectedEvents = selectedDateKey ? getEventsForDate(selectedDateKey) : [];

  return (
    <>
      <div className={`min-h-screen p-6 transition-colors ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <header className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={`text-base font-medium border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${isDark ? 'border-slate-600 bg-slate-800 text-slate-200' : 'border-gray-200 bg-white text-gray-800'}`}
            >
              {YEAR_RANGE.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <span className={`text-2xl font-semibold ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>年度行事曆</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>星期顯示：</span>
            <select
              value={weekdayFormat}
              onChange={(e) => setWeekdayFormat(e.target.value)}
              className={`text-sm border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${isDark ? 'border-slate-600 bg-slate-800 text-slate-200' : 'border-gray-200 bg-white text-gray-800'}`}
            >
              <option value="zh">中文（日一二三四五六）</option>
              <option value="en">英文（S M T W T F S）</option>
            </select>
          </div>
          <button
            type="button"
            onClick={onToggleTheme}
            className={`ml-auto p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
            aria-label={isDark ? '切換為亮色' : '切換為暗色'}
            title={isDark ? '亮色模式' : '暗色模式'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <p className={`text-sm w-full ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            點擊日期可新增與管理事件
          </p>
        </header>

        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <MonthCard
              key={month}
              year={year}
              month={month}
              isDark={isDark}
              weekdayFormat={weekdayFormat}
              getEventCount={getEventCount}
              getPrimaryEvent={getPrimaryEventForDate}
              onDateClick={setSelectedDateKey}
            />
          ))}
        </div>
      </div>

      {selectedDateKey && (
        <EventModal
          dateKey={selectedDateKey}
          events={selectedEvents}
          isDark={isDark}
          onAddEvent={addEvent}
          onUpdateEvent={updateEvent}
          onDeleteEvent={deleteEvent}
          onClose={() => setSelectedDateKey(null)}
        />
      )}
    </>
  );
}
