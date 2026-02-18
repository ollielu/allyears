import { useState, useMemo } from 'react';
import { ArrowLeft, ListTodo, Copy, Trash2, Plus, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const EVENT_COLORS = [
  { value: '', label: '預設' },
  { value: 'blue', label: '藍' },
  { value: 'green', label: '綠' },
  { value: 'orange', label: '橘' },
  { value: 'red', label: '紅' },
  { value: 'purple', label: '紫' },
];

const WEEKDAY_ZH = ['日', '一', '二', '三', '四', '五', '六'];

function formatDateKey(key) {
  if (!key) return '';
  const [y, m, d] = key.split('-');
  return `${y}/${m}/${d}`;
}

/** 取得某年某月有幾天 */
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/** 產生某年某月所有 dateKey */
function getDateKeysInMonth(year, month) {
  const days = getDaysInMonth(year, month);
  const m = String(month).padStart(2, '0');
  return Array.from({ length: days }, (_, i) => {
    const d = String(i + 1).padStart(2, '0');
    return `${year}-${m}-${d}`;
  });
}

/** 產生小型月曆格線：每格為 dateKey 或 null（空白） */
function getMiniCalendarGrid(year, month) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const m = String(month).padStart(2, '0');
  const grid = [];
  let row = [];
  for (let i = 0; i < firstDay; i++) row.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const d = String(day).padStart(2, '0');
    row.push(`${year}-${m}-${d}`);
    if (row.length === 7) {
      grid.push(row);
      row = [];
    }
  }
  if (row.length) {
    while (row.length < 7) row.push(null);
    grid.push(row);
  }
  return grid;
}

export function TaskManagement({
  isDark,
  onBack,
  fontSize,
  onFontSizeChange,
  getAllEventsList,
  batchDeleteEvents,
  copyEventToDates,
  addEventToDates,
  deleteEvent,
}) {
  const list = useMemo(() => getAllEventsList(), [getAllEventsList]);
  const [bulkTitle, setBulkTitle] = useState('');
  const [bulkTime, setBulkTime] = useState('09:00');
  const [bulkImportant, setBulkImportant] = useState(false);
  const [bulkColor, setBulkColor] = useState('');
  const [bulkSelectedDates, setBulkSelectedDates] = useState(new Set());
  const [bulkYear, setBulkYear] = useState(() => new Date().getFullYear());
  const [bulkMonth, setBulkMonth] = useState(() => new Date().getMonth() + 1);
  const [copySource, setCopySource] = useState(null);
  const [copySelectedDates, setCopySelectedDates] = useState(new Set());
  const [copyYear, setCopyYear] = useState(() => new Date().getFullYear());
  const [copyMonth, setCopyMonth] = useState(() => new Date().getMonth() + 1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteSelectedDates, setDeleteSelectedDates] = useState(new Set());
  const [deleteYear, setDeleteYear] = useState(() => new Date().getFullYear());
  const [deleteMonth, setDeleteMonth] = useState(() => new Date().getMonth() + 1);

  const d = isDark;

  const handleBulkAdd = (e) => {
    e.preventDefault();
    const dateKeys = [...bulkSelectedDates];
    if (!bulkTitle.trim()) return;
    if (dateKeys.length === 0) {
      alert('請至少勾選一個日期');
      return;
    }
    addEventToDates(dateKeys, bulkTitle.trim(), bulkTime, bulkImportant, bulkColor);
    setBulkTitle('');
    setBulkTime('09:00');
    setBulkImportant(false);
    setBulkColor('');
    setBulkSelectedDates(new Set());
  };

  const toggleBulkDate = (dateKey) => {
    setBulkSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) next.delete(dateKey);
      else next.add(dateKey);
      return next;
    });
  };

  const bulkMonthDateKeys = useMemo(
    () => getDateKeysInMonth(bulkYear, bulkMonth),
    [bulkYear, bulkMonth]
  );

  const miniCalendarGrid = useMemo(
    () => getMiniCalendarGrid(bulkYear, bulkMonth),
    [bulkYear, bulkMonth]
  );

  const selectAllBulkMonth = () => {
    setBulkSelectedDates((prev) => new Set([...prev, ...bulkMonthDateKeys]));
  };

  const clearAllBulkMonth = () => {
    setBulkSelectedDates((prev) => {
      const next = new Set(prev);
      bulkMonthDateKeys.forEach((k) => next.delete(k));
      return next;
    });
  };

  const goPrevMonth = () => {
    if (bulkMonth === 1) {
      setBulkMonth(12);
      setBulkYear((y) => y - 1);
    } else setBulkMonth((m) => m - 1);
  };

  const goNextMonth = () => {
    if (bulkMonth === 12) {
      setBulkMonth(1);
      setBulkYear((y) => y + 1);
    } else setBulkMonth((m) => m + 1);
  };

  const handleCopyConfirm = () => {
    if (!copySource) return;
    const dateKeys = [...copySelectedDates];
    if (dateKeys.length === 0) {
      alert('請至少選取一個目標日期');
      return;
    }
    copyEventToDates(copySource.dateKey, copySource.id, dateKeys);
    setCopySource(null);
    setCopySelectedDates(new Set());
  };

  const openCopyModal = (ev) => {
    setCopySource(ev);
    setCopySelectedDates(new Set());
    const [y, m] = String(ev.dateKey || '').split('-');
    const yy = Number(y) || new Date().getFullYear();
    const mm = Number(m) || new Date().getMonth() + 1;
    setCopyYear(yy);
    setCopyMonth(mm);
  };

  const openDeleteModal = () => {
    const now = new Date();
    setDeleteModalOpen(true);
    setDeleteSelectedDates(new Set());
    setDeleteYear(now.getFullYear());
    setDeleteMonth(now.getMonth() + 1);
  };

  const handleDeleteByDates = () => {
    const dateKeys = [...deleteSelectedDates];
    if (dateKeys.length === 0) {
      alert('請至少選取一個要刪除的日期');
      return;
    }
    const items = list
      .filter((ev) => deleteSelectedDates.has(ev.dateKey))
      .map((ev) => ({ dateKey: ev.dateKey, eventId: ev.id }));
    if (items.length === 0) {
      alert('所選日期沒有任何事件可刪除');
      return;
    }
    if (!window.confirm(`確定要刪除所選日期中的 ${items.length} 筆事件嗎？`)) return;
    batchDeleteEvents(items);
    setDeleteModalOpen(false);
    setDeleteSelectedDates(new Set());
  };

  return (
    <div className={`min-h-screen p-4 sm:p-6 transition-colors ${d ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <header className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${d ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-200'}`}
        >
          <ArrowLeft size={18} /> 返回行事曆
        </button>
        <h1 className={`text-xl sm:text-2xl font-semibold flex items-center gap-2 ${d ? 'text-slate-100' : 'text-gray-800'}`}>
          <ListTodo size={24} /> 任務管理
        </h1>
        <div className="ml-auto flex items-center gap-1.5">
          <span className={`text-sm shrink-0 ${d ? 'text-slate-400' : 'text-gray-500'}`}>字體：</span>
          <select
            value={fontSize}
            onChange={(e) => onFontSizeChange(e.target.value)}
            className={`text-sm border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${d ? 'border-slate-600 bg-slate-800 text-slate-200' : 'border-gray-200 bg-white text-gray-800'}`}
            aria-label="字體大小"
          >
            <option value="small">小</option>
            <option value="medium">中</option>
            <option value="large">大</option>
          </select>
        </div>
      </header>

      {/* 快速大量新增 */}
      <section className={`mb-6 rounded-xl border p-4 ${d ? 'border-slate-600 bg-slate-800/50' : 'border-gray-200 bg-white'}`}>
        <h2 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${d ? 'text-slate-200' : 'text-gray-800'}`}>
          <Plus size={16} /> 快速大量新增到指定日期
        </h2>
        <form onSubmit={handleBulkAdd} className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={bulkTitle}
              onChange={(e) => setBulkTitle(e.target.value)}
              placeholder="事件標題"
              className={`flex-1 min-w-[140px] text-sm border rounded-lg px-3 py-2 ${d ? 'border-slate-600 bg-slate-700 text-slate-200 placeholder-slate-500' : 'border-gray-200 bg-white text-gray-800'}`}
            />
            <input
              type="time"
              value={bulkTime}
              onChange={(e) => setBulkTime(e.target.value)}
              className={`w-24 text-sm border rounded-lg px-2 py-2 ${d ? 'border-slate-600 bg-slate-700 text-slate-200' : 'border-gray-200 bg-white text-gray-800'}`}
            />
            <select
              value={bulkColor}
              onChange={(e) => setBulkColor(e.target.value)}
              className={`text-sm border rounded-lg px-2 py-2 ${d ? 'border-slate-600 bg-slate-700 text-slate-200' : 'border-gray-200 bg-white text-gray-800'}`}
            >
              {EVENT_COLORS.map((c) => (
                <option key={c.value || 'def'} value={c.value}>{c.label}</option>
              ))}
            </select>
            <label className={`flex items-center gap-1.5 text-sm cursor-pointer ${d ? 'text-slate-400' : 'text-gray-600'}`}>
              <input
                type="checkbox"
                checked={bulkImportant}
                onChange={(e) => setBulkImportant(e.target.checked)}
                className="rounded border-gray-300 text-blue-600"
              />
              <Star size={14} className="shrink-0" /> 重要
            </label>
          </div>
          <div>
            <label className={`block text-xs mb-2 ${d ? 'text-slate-400' : 'text-gray-500'}`}>
              點選小型月曆選擇日期（可切換月份）
            </label>
            <div className={`rounded-xl border overflow-hidden inline-block ${d ? 'border-slate-600 bg-slate-800/50' : 'border-gray-200 bg-white'}`}>
              <div className={`flex items-center justify-between px-2 py-2 border-b ${d ? 'border-slate-600' : 'border-gray-200'}`}>
                <button
                  type="button"
                  onClick={goPrevMonth}
                  className={`p-1.5 rounded-lg ${d ? 'text-slate-300 hover:bg-slate-600' : 'text-gray-600 hover:bg-gray-200'}`}
                  aria-label="上一月"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className={`text-sm font-medium min-w-[7rem] text-center ${d ? 'text-slate-200' : 'text-gray-800'}`}>
                  {bulkYear} 年 {bulkMonth} 月
                </span>
                <button
                  type="button"
                  onClick={goNextMonth}
                  className={`p-1.5 rounded-lg ${d ? 'text-slate-300 hover:bg-slate-600' : 'text-gray-600 hover:bg-gray-200'}`}
                  aria-label="下一月"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className={`flex gap-1 px-2 py-1.5 border-b ${d ? 'border-slate-600' : 'border-gray-200'}`}>
                <button
                  type="button"
                  onClick={selectAllBulkMonth}
                  className={`text-xs font-medium rounded px-2 py-1 ${d ? 'text-blue-400 hover:bg-slate-600' : 'text-blue-600 hover:bg-gray-200'}`}
                >
                  全選此月
                </button>
                <button
                  type="button"
                  onClick={clearAllBulkMonth}
                  className={`text-xs font-medium rounded px-2 py-1 ${d ? 'text-slate-400 hover:bg-slate-600' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                  取消此月
                </button>
                <span className={`text-xs ml-auto self-center ${d ? 'text-slate-400' : 'text-gray-500'}`}>
                  已選 {bulkSelectedDates.size} 天
                </span>
              </div>
              {/* 小型月曆格線：星期標題 */}
              <div className="grid grid-cols-7 gap-0.5 px-2 pt-2 pb-1">
                {WEEKDAY_ZH.map((w) => (
                  <div
                    key={w}
                    className={`text-center text-[10px] font-medium py-0.5 ${d ? 'text-slate-500' : 'text-gray-500'}`}
                  >
                    {w}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5 px-2 pb-2">
                {miniCalendarGrid.flat().map((dateKey, idx) =>
                  dateKey ? (
                    <button
                      key={dateKey}
                      type="button"
                      onClick={() => toggleBulkDate(dateKey)}
                      className={`min-w-[28px] w-7 h-7 text-xs rounded-md transition-colors ${
                        bulkSelectedDates.has(dateKey)
                          ? 'bg-blue-600 text-white font-medium'
                          : d
                            ? 'text-slate-200 hover:bg-slate-600'
                            : 'text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {dateKey.split('-')[2].replace(/^0/, '')}
                    </button>
                  ) : (
                    <span key={`empty-${idx}`} className="w-7 h-7" />
                  )
                )}
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={!bulkTitle.trim() || bulkSelectedDates.size === 0}
            className={`self-start px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 ${d ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            加入已選 {bulkSelectedDates.size} 個日期
          </button>
        </form>
      </section>

      {/* 全部任務列表 + 批次刪除 */}
      <section className={`mb-6 rounded-xl border overflow-hidden ${d ? 'border-slate-600 bg-slate-800/50' : 'border-gray-200 bg-white'}`}>
        <div className={`flex flex-wrap items-center justify-between gap-2 p-3 border-b ${d ? 'border-slate-600' : 'border-gray-100'}`}>
          <h2 className={`text-sm font-semibold ${d ? 'text-slate-200' : 'text-gray-800'}`}>全部任務</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openDeleteModal}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 ${d ? 'hover:bg-red-900/30' : 'hover:bg-red-50'}`}
            >
              <Trash2 size={14} /> 批次刪除（選日期）
            </button>
          </div>
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          {list.length === 0 ? (
            <p className={`p-4 text-sm ${d ? 'text-slate-400' : 'text-gray-500'}`}>尚無任何事件</p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-slate-600">
              {list.map((ev) => {
                return (
                  <li
                    key={`${ev.dateKey}:${ev.id}`}
                    className={`flex items-center gap-2 px-3 py-2 text-sm ${d ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}`}
                  >
                    <span className={`shrink-0 w-24 ${d ? 'text-slate-400' : 'text-gray-500'}`}>{formatDateKey(ev.dateKey)}</span>
                    <span className={`shrink-0 w-12 ${d ? 'text-slate-400' : 'text-gray-500'}`}>{ev.time}</span>
                    <span className={`min-w-0 truncate flex-1 ${ev.isImportant ? 'font-medium' : ''}`}>{ev.title}</span>
                    {ev.isImportant && <Star size={12} className="shrink-0 fill-amber-400 text-amber-400" />}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openCopyModal(ev)}
                        className={`p-1.5 rounded ${d ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-700' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100'}`}
                        title="複製到多個日期"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('確定要刪除此事件嗎？')) deleteEvent(ev.dateKey, ev.id);
                        }}
                        className={`p-1.5 rounded ${d ? 'text-slate-400 hover:text-red-400 hover:bg-slate-700' : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'}`}
                        title="刪除"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* 複製到多個日期的彈窗 */}
      {copySource && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${d ? 'bg-black/60' : 'bg-black/40'}`}
          onClick={() => {
            setCopySource(null);
            setCopySelectedDates(new Set());
          }}
          role="presentation"
        >
          <div
            className={`w-full max-w-md rounded-xl shadow-xl p-5 ${d ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-gray-200'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-base font-semibold mb-2 ${d ? 'text-slate-100' : 'text-gray-800'}`}>
              複製「{copySource.title}」到多個日期
            </h3>
            <p className={`text-xs mb-3 ${d ? 'text-slate-400' : 'text-gray-500'}`}>
              用小月曆點選目標日期（可切換月份，可跨月累積）
            </p>
            <MiniCalendarPicker
              isDark={isDark}
              year={copyYear}
              setYear={setCopyYear}
              month={copyMonth}
              setMonth={setCopyMonth}
              selectedDates={copySelectedDates}
              setSelectedDates={setCopySelectedDates}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCopySource(null);
                  setCopySelectedDates(new Set());
                }}
                className={`px-3 py-2 text-sm rounded-lg ${d ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleCopyConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500"
              >
                確認複製
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 依日期批次刪除的彈窗 */}
      {deleteModalOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${d ? 'bg-black/60' : 'bg-black/40'}`}
          onClick={() => {
            setDeleteModalOpen(false);
            setDeleteSelectedDates(new Set());
          }}
          role="presentation"
        >
          <div
            className={`w-full max-w-md rounded-xl shadow-xl p-5 ${d ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-gray-200'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-base font-semibold mb-2 ${d ? 'text-slate-100' : 'text-gray-800'}`}>
              批次刪除（先選日期）
            </h3>
            <p className={`text-xs mb-3 ${d ? 'text-slate-400' : 'text-gray-500'}`}>
              用小月曆點選要刪除的日期（會刪除那些日期中的全部事件）
            </p>
            <MiniCalendarPicker
              isDark={isDark}
              year={deleteYear}
              setYear={setDeleteYear}
              month={deleteMonth}
              setMonth={setDeleteMonth}
              selectedDates={deleteSelectedDates}
              setSelectedDates={setDeleteSelectedDates}
            />
            <p className={`text-xs mt-3 ${d ? 'text-slate-400' : 'text-gray-500'}`}>
              所選日期共 {deleteSelectedDates.size} 天，包含事件 {list.filter((ev) => deleteSelectedDates.has(ev.dateKey)).length} 筆
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteSelectedDates(new Set());
                }}
                className={`px-3 py-2 text-sm rounded-lg ${d ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDeleteByDates}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-500"
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniCalendarPicker({ isDark, year, setYear, month, setMonth, selectedDates, setSelectedDates }) {
  const d = isDark;
  const monthDateKeys = useMemo(() => getDateKeysInMonth(year, month), [year, month]);
  const grid = useMemo(() => getMiniCalendarGrid(year, month), [year, month]);

  const toggleDate = (dateKey) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) next.delete(dateKey);
      else next.add(dateKey);
      return next;
    });
  };

  const selectAllMonth = () => {
    setSelectedDates((prev) => new Set([...prev, ...monthDateKeys]));
  };

  const clearMonth = () => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      monthDateKeys.forEach((k) => next.delete(k));
      return next;
    });
  };

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  return (
    <div className={`rounded-xl border overflow-hidden inline-block ${d ? 'border-slate-600 bg-slate-800/50' : 'border-gray-200 bg-white'}`}>
      <div className={`flex items-center justify-between px-2 py-2 border-b ${d ? 'border-slate-600' : 'border-gray-200'}`}>
        <button
          type="button"
          onClick={prevMonth}
          className={`p-1.5 rounded-lg ${d ? 'text-slate-300 hover:bg-slate-600' : 'text-gray-600 hover:bg-gray-200'}`}
          aria-label="上一月"
        >
          <ChevronLeft size={18} />
        </button>
        <span className={`text-sm font-medium min-w-[7rem] text-center ${d ? 'text-slate-200' : 'text-gray-800'}`}>
          {year} 年 {month} 月
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className={`p-1.5 rounded-lg ${d ? 'text-slate-300 hover:bg-slate-600' : 'text-gray-600 hover:bg-gray-200'}`}
          aria-label="下一月"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className={`flex gap-1 px-2 py-1.5 border-b ${d ? 'border-slate-600' : 'border-gray-200'}`}>
        <button
          type="button"
          onClick={selectAllMonth}
          className={`text-xs font-medium rounded px-2 py-1 ${d ? 'text-blue-400 hover:bg-slate-600' : 'text-blue-600 hover:bg-gray-200'}`}
        >
          全選此月
        </button>
        <button
          type="button"
          onClick={clearMonth}
          className={`text-xs font-medium rounded px-2 py-1 ${d ? 'text-slate-400 hover:bg-slate-600' : 'text-gray-500 hover:bg-gray-200'}`}
        >
          取消此月
        </button>
        <span className={`text-xs ml-auto self-center ${d ? 'text-slate-400' : 'text-gray-500'}`}>
          已選 {selectedDates.size} 天
        </span>
      </div>
      <div className="grid grid-cols-7 gap-0.5 px-2 pt-2 pb-1">
        {WEEKDAY_ZH.map((w) => (
          <div
            key={w}
            className={`text-center text-[10px] font-medium py-0.5 ${d ? 'text-slate-500' : 'text-gray-500'}`}
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5 px-2 pb-2">
        {grid.flat().map((dateKey, idx) =>
          dateKey ? (
            <button
              key={dateKey}
              type="button"
              onClick={() => toggleDate(dateKey)}
              className={`min-w-[28px] w-7 h-7 text-xs rounded-md transition-colors ${
                selectedDates.has(dateKey)
                  ? 'bg-blue-600 text-white font-medium'
                  : d
                    ? 'text-slate-200 hover:bg-slate-600'
                    : 'text-gray-800 hover:bg-gray-200'
              }`}
            >
              {dateKey.split('-')[2].replace(/^0/, '')}
            </button>
          ) : (
            <span key={`empty-${idx}`} className="w-7 h-7" />
          )
        )}
      </div>
    </div>
  );
}
