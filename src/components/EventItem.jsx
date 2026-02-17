import { useState } from 'react';
import { Pencil, Trash2, Star } from 'lucide-react';

/**
 * 單一事件列 (可編輯、刪除、設為重要)
 */
export function EventItem({ event, isDark = false, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(event.title);
  const [editTime, setEditTime] = useState(event.time);
  const [editIsImportant, setEditIsImportant] = useState(!!event.isImportant);
  const [editColor, setEditColor] = useState(event.color || '');

  const EVENT_COLORS = [
    { value: '', label: '預設' },
    { value: 'blue', label: '藍' },
    { value: 'green', label: '綠' },
    { value: 'orange', label: '橘' },
    { value: 'red', label: '紅' },
    { value: 'purple', label: '紫' },
  ];

  const handleSave = () => {
    const t = editTitle.trim();
    if (!t) return;
    onUpdate({ title: t, time: editTime, isImportant: editIsImportant, color: editColor || undefined });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('確定要刪除此事件嗎？')) {
      onDelete();
    }
  };

  const toggleImportant = () => {
    if (!isEditing) {
      onUpdate({ isImportant: !event.isImportant });
    }
  };

  const getEventColorClass = (c) => {
    const map = {
      blue: isDark ? 'text-blue-400' : 'text-blue-600',
      green: isDark ? 'text-emerald-400' : 'text-emerald-600',
      orange: isDark ? 'text-orange-400' : 'text-orange-600',
      red: isDark ? 'text-red-400' : 'text-red-600',
      purple: isDark ? 'text-violet-400' : 'text-violet-600',
    };
    return map[c] || '';
  };

  const d = isDark;
  if (isEditing) {
    return (
      <div className={`flex flex-wrap items-center gap-2 py-2 px-3 rounded-lg ${d ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
        <input
          type="time"
          value={editTime}
          onChange={(e) => setEditTime(e.target.value)}
          className={`flex-1 max-w-[100px] text-sm border rounded px-2 py-1 ${d ? 'border-slate-600 bg-slate-700 text-slate-200' : 'border-gray-200 bg-white text-gray-800'}`}
        />
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="事件標題"
          className={`flex-1 min-w-[100px] text-sm border rounded px-2 py-1 ${d ? 'border-slate-600 bg-slate-700 text-slate-200' : 'border-gray-200 bg-white text-gray-800'}`}
          autoFocus
        />
        <select
          value={editColor}
          onChange={(e) => setEditColor(e.target.value)}
          className={`text-xs border rounded px-1.5 py-0.5 ${d ? 'border-slate-600 bg-slate-700 text-slate-200' : 'border-gray-200 bg-white text-gray-800'}`}
        >
          {EVENT_COLORS.map((c) => (
            <option key={c.value || 'def'} value={c.value}>{c.label}</option>
          ))}
        </select>
        <label className={`flex items-center gap-1 text-xs cursor-pointer ${d ? 'text-slate-400' : 'text-gray-600'}`}>
          <input
            type="checkbox"
            checked={editIsImportant}
            onChange={(e) => setEditIsImportant(e.target.checked)}
            className="rounded border-gray-300 text-blue-600"
          />
          重要
        </label>
        <button
          type="button"
          onClick={handleSave}
          className={`text-xs font-medium ${d ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
        >
          儲存
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className={`text-xs ${d ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-600'}`}
        >
          取消
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between gap-2 py-2 px-3 rounded-lg group ${d ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}`}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className={`text-xs shrink-0 ${d ? 'text-slate-400' : 'text-gray-500'}`}>{event.time}</span>
        <span className={`text-sm truncate ${event.isImportant ? 'font-medium' : ''} ${getEventColorClass(event.color)}`}>{event.title}</span>
        {event.isImportant && (
          <Star size={12} className="shrink-0 fill-amber-400 text-amber-400" aria-label="重要" />
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={toggleImportant}
          className={`p-1.5 rounded ${event.isImportant ? (d ? 'text-amber-400' : 'text-amber-500') : (d ? 'text-slate-500 hover:text-amber-400' : 'text-gray-400 hover:text-amber-500')}`}
          aria-label={event.isImportant ? '取消重要' : '設為重要'}
          title={event.isImportant ? '取消重要' : '設為重要'}
        >
          <Star size={14} className={event.isImportant ? 'fill-amber-400' : ''} />
        </button>
        <button
          type="button"
          onClick={() => {
            setEditTitle(event.title);
            setEditTime(event.time);
            setEditIsImportant(!!event.isImportant);
            setEditColor(event.color || '');
            setIsEditing(true);
          }}
          className={`p-1.5 rounded ${d ? 'text-slate-400 hover:text-blue-400 hover:bg-blue-900/30' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`}
          aria-label="編輯"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className={`p-1.5 rounded ${d ? 'text-slate-400 hover:text-red-400 hover:bg-red-900/30' : 'text-gray-500 hover:text-red-600 hover:bg-red-50'}`}
          aria-label="刪除"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
