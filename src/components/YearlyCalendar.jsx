import { useState } from 'react';
import { Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import { MonthCard } from './MonthCard';
import { EventModal } from './EventModal';

/**
 * 全年度行事曆主畫面：每頁 3 個月、共 4 頁，頁數選擇在上方
 */
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_RANGE = Array.from({ length: 11 }, (_, i) => CURRENT_YEAR - 5 + i);
const MONTHS_PER_PAGE = 3;
const TOTAL_PAGES = 4;

export function YearlyCalendar({ isDark, onToggleTheme, getEventCount, getPrimaryEventForDate, getEventsForDate, addEvent, updateEvent, deleteEvent }) {
  const [selectedDateKey, setSelectedDateKey] = useState(null);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [weekdayFormat, setWeekdayFormat] = useState('zh');
  const [page, setPage] = useState(1);

  const selectedEvents = selectedDateKey ? getEventsForDate(selectedDateKey) : [];

  const monthsOnPage = Array.from(
    { length: MONTHS_PER_PAGE },
    (_, i) => (page - 1) * MONTHS_PER_PAGE + i + 1
  );

  const pageLabel = (p) => {
    const start = (p - 1) * MONTHS_PER_PAGE + 1;
    const end = Math.min(p * MONTHS_PER_PAGE, 12);
    return `${start}–${end} 月`;
  };

  return (
    <>
      <div className={`min-h-screen p-4 sm:p-6 transition-colors ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <header className="mb-4 flex flex-wrap items-center gap-3">
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
            <span className={`text-xl sm:text-2xl font-semibold ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>年度行事曆</span>
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

        {/* 頁數選擇：上方、方便手機操作 */}
        <div className={`mb-4 flex items-center justify-between gap-2 rounded-xl border p-3 ${isDark ? 'border-slate-600 bg-slate-800/50' : 'border-gray-200 bg-white'}`}>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none ${isDark ? 'text-slate-200 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}`}
            aria-label="上一頁"
          >
            <ChevronLeft size={18} /> 上一頁
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`min-w-[2.5rem] rounded-lg px-2 py-2 text-sm font-medium transition-colors ${page === p ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white') : (isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100')}`}
                aria-label={`第 ${p} 頁`}
                title={pageLabel(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(TOTAL_PAGES, p + 1))}
            disabled={page === TOTAL_PAGES}
            className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none ${isDark ? 'text-slate-200 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}`}
            aria-label="下一頁"
          >
            下一頁 <ChevronRight size={18} />
          </button>
        </div>
        <p className={`mb-3 text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          第 {page} 頁 · {pageLabel(page)}
        </p>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {monthsOnPage.map((month) => (
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
