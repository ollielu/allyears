import { useState } from 'react';
import { X } from 'lucide-react';
import { EventItem } from './EventItem';

/**
 * 點擊日期後彈出的 Modal：顯示該日事件、新增、編輯、刪除
 */
export function EventModal({ dateKey, events, isDark = false, onAddEvent, onUpdateEvent, onDeleteEvent, onClose }) {
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newIsImportant, setNewIsImportant] = useState(false);
  const [newColor, setNewColor] = useState('');

  const EVENT_COLORS = [
    { value: '', label: '預設' },
    { value: 'blue', label: '藍' },
    { value: 'green', label: '綠' },
    { value: 'orange', label: '橘' },
    { value: 'red', label: '紅' },
    { value: 'purple', label: '紫' },
  ];

  const formatDisplayDate = (key) => {
    if (!key) return '';
    const [y, m, d] = key.split('-');
    return `${y} 年 ${parseInt(m, 10)} 月 ${parseInt(d, 10)} 日`;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const t = newTitle.trim();
    if (!t) return;
    onAddEvent(dateKey, t, newTime, newIsImportant, newColor);
    setNewTitle('');
    setNewTime('09:00');
    setNewIsImportant(false);
    setNewColor('');
  };

  const d = isDark;
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${d ? 'bg-black/60' : 'bg-black/40'}`}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`w-full max-w-md rounded-xl shadow-xl max-h-[85vh] flex flex-col ${d ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'} border`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between px-5 py-4 border-b ${d ? 'border-slate-600' : 'border-gray-100'}`}>
          <h2 className={`text-lg font-semibold ${d ? 'text-slate-100' : 'text-gray-800'}`}>
            {formatDisplayDate(dateKey)}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${d ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            aria-label="關閉"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {events.length === 0 ? (
            <p className={`text-sm py-4 ${d ? 'text-slate-400' : 'text-gray-500'}`}>尚無事件，請在下方新增。</p>
          ) : (
            <ul className="space-y-1">
              {[...events]
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((ev) => (
                <li key={ev.id}>
                  <EventItem
                    event={ev}
                    isDark={isDark}
                    onUpdate={(updates) => onUpdateEvent(dateKey, ev.id, updates)}
                    onDelete={() => onDeleteEvent(dateKey, ev.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={handleAdd} className={`px-5 py-4 border-t ${d ? 'border-slate-600' : 'border-gray-100'}`}>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className={`flex-shrink-0 w-24 text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${d ? 'border-slate-600 bg-slate-700 text-slate-200' : 'border-gray-200 bg-white text-gray-800'}`}
            />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="新增事件..."
              className={`flex-1 min-w-[120px] text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${d ? 'border-slate-600 bg-slate-700 text-slate-200 placeholder-slate-500' : 'border-gray-200 bg-white text-gray-800 placeholder-gray-400'}`}
            />
            <select
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className={`text-sm border rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${d ? 'border-slate-600 bg-slate-700 text-slate-200' : 'border-gray-200 bg-white text-gray-800'}`}
              title="事件顏色"
            >
              {EVENT_COLORS.map((c) => (
                <option key={c.value || 'def'} value={c.value}>{c.label}</option>
              ))}
            </select>
            <label className={`flex items-center gap-1.5 text-sm cursor-pointer shrink-0 ${d ? 'text-slate-400' : 'text-gray-600'}`}>
              <input
                type="checkbox"
                checked={newIsImportant}
                onChange={(e) => setNewIsImportant(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-400"
              />
              重要（顯示於月曆）
            </label>
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${d ? 'bg-slate-600 hover:bg-slate-500' : 'bg-gray-700 hover:bg-gray-800'}`}
            >
              新增
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
