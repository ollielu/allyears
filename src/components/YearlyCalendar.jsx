import { useState, useEffect } from 'react';
import { Sun, Moon, ChevronLeft, ChevronRight, ListTodo } from 'lucide-react';
import { MonthCard } from './MonthCard';
import { EventModal } from './EventModal';

/**
 * 全年度行事曆：滑桿調整顯示 1～6 個月，單月時顯示每日所有事件
 */
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_RANGE = Array.from({ length: 11 }, (_, i) => CURRENT_YEAR - 5 + i);
const MIN_MONTHS = 1;
const MAX_MONTHS = 6;

export function YearlyCalendar({ isDark, onToggleTheme, onOpenTaskManagement, fontSize, onFontSizeChange, minFontSize = 10, maxFontSize = 28, getEventCount, getPrimaryEventForDate, getEventsForDate, addEvent, updateEvent, deleteEvent }) {
  const [selectedDateKey, setSelectedDateKey] = useState(null);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [weekdayFormat, setWeekdayFormat] = useState('zh');
  const [page, setPage] = useState(1);
  const [monthsPerView, setMonthsPerView] = useState(3);

  const totalPages = Math.ceil(12 / monthsPerView);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const monthsOnPage = Array.from(
    { length: monthsPerView },
    (_, i) => (safePage - 1) * monthsPerView + i + 1
  ).filter((m) => m <= 12);

  const selectedEvents = selectedDateKey ? getEventsForDate(selectedDateKey) : [];

  const pageLabel = (p) => {
    const start = (p - 1) * monthsPerView + 1;
    const end = Math.min(p * monthsPerView, 12);
    return `${start}–${end} 月`;
  };

  const handleMonthsPerViewChange = (v) => {
    const n = Number(v);
    setMonthsPerView(n);
    setPage((p) => Math.min(p, Math.ceil(12 / n)));
  };

  useEffect(() => {
    const maxPage = Math.ceil(12 / monthsPerView);
    if (page > maxPage) setPage(maxPage);
  }, [monthsPerView, page]);

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
          <div className="flex items-center gap-2">
            <span className={`text-sm shrink-0 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>日曆字體：</span>
            <input
              type="number"
              min={minFontSize}
              max={maxFontSize}
              value={fontSize}
              onChange={(e) => onFontSizeChange(e.target.value)}
              className={`w-12 text-center text-sm border rounded-lg px-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isDark ? 'border-slate-600 bg-slate-800 text-slate-200' : 'border-gray-200 bg-white text-gray-800'}`}
              aria-label="日曆字體大小（px）"
            />
            <span className={`text-xs shrink-0 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>px</span>
          </div>
          <button
            type="button"
            onClick={onOpenTaskManagement}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'text-slate-200 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-200'}`}
            aria-label="任務管理"
            title="任務管理"
          >
            <ListTodo size={18} /> 任務管理
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
            aria-label={isDark ? '切換為亮色' : '切換為暗色'}
            title={isDark ? '亮色模式' : '暗色模式'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <p className={`text-sm w-full ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            點擊日期可新增與管理事件
          </p>
        </header>

        {/* 顯示月份數滑桿 + 頁數選擇（字體縮小） */}
        <div className={`calendar-controls-compact mb-4 rounded-xl border p-3 space-y-3 ${isDark ? 'border-slate-600 bg-slate-800/50' : 'border-gray-200 bg-white'}`}>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`text-sm font-medium shrink-0 ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
              顯示月份數：
            </span>
            <input
              type="range"
              min={MIN_MONTHS}
              max={MAX_MONTHS}
              value={monthsPerView}
              onChange={(e) => handleMonthsPerViewChange(e.target.value)}
              className="months-slider flex-1 min-w-[120px] cursor-pointer"
              aria-label="顯示月份數"
            />
            <span className={`text-sm tabular-nums shrink-0 min-w-[4rem] ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              {monthsPerView} 個月
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none ${isDark ? 'text-slate-200 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}`}
              aria-label="上一頁"
            >
              <ChevronLeft size={18} /> 上一頁
            </button>
            <div className="flex items-center gap-1 flex-wrap justify-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`min-w-[2.5rem] rounded-lg px-2 py-2 text-sm font-medium transition-colors ${safePage === p ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white') : (isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100')}`}
                  aria-label={`第 ${p} 頁`}
                  title={pageLabel(p)}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none ${isDark ? 'text-slate-200 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}`}
              aria-label="下一頁"
            >
              下一頁 <ChevronRight size={18} />
            </button>
          </div>
          <p className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            第 {safePage} 頁 · {pageLabel(safePage)}
            {monthsPerView === 1 && ' · 顯示每日所有事件'}
          </p>
        </div>

        <div
          className="grid gap-2 sm:gap-4 calendar-font-scale"
          style={{
            gridTemplateColumns: `repeat(${Math.min(monthsPerView, 3)}, minmax(0, 1fr))`,
            fontSize: `${fontSize}px`,
          }}
        >
          {monthsOnPage.map((month) => (
            <MonthCard
              key={month}
              year={year}
              month={month}
              isDark={isDark}
              weekdayFormat={weekdayFormat}
              getEventCount={getEventCount}
              getPrimaryEvent={getPrimaryEventForDate}
              getEventsForDate={getEventsForDate}
              onDateClick={setSelectedDateKey}
              showAllEvents={monthsPerView === 1}
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
