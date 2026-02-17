import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEY, generateId } from '../types/event';

/**
 * 從 localStorage 讀取事件
 */
const loadEvents = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

/**
 * 儲存事件到 localStorage
 * @param {Object} events - { [dateKey]: CalendarEvent[] }
 */
const saveEvents = (events) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
};

/**
 * 事件管理的自訂 Hook
 * 使用 localStorage 持久化
 */
export function useEvents() {
  const [events, setEvents] = useState(loadEvents);

  // 同步到 localStorage
  useEffect(() => {
    saveEvents(events);
  }, [events]);

  const getEventsForDate = useCallback((dateKey) => {
    return events[dateKey] || [];
  }, [events]);

  const addEvent = useCallback((dateKey, title, time, isImportant = false, color = '') => {
    const newEvent = {
      id: generateId(),
      dateKey,
      title: title.trim(),
      time: time || '00:00',
      isImportant: !!isImportant,
      color: color || undefined,
    };
    setEvents((prev) => {
      const list = prev[dateKey] || [];
      return { ...prev, [dateKey]: [...list, newEvent] };
    });
  }, []);

  const updateEvent = useCallback((dateKey, eventId, updates) => {
    setEvents((prev) => {
      const list = prev[dateKey] || [];
      const idx = list.findIndex((e) => e.id === eventId);
      if (idx < 0) return prev;
      const updated = [...list];
      updated[idx] = { ...updated[idx], ...updates };
      return { ...prev, [dateKey]: updated };
    });
  }, []);

  const deleteEvent = useCallback((dateKey, eventId) => {
    setEvents((prev) => {
      const list = (prev[dateKey] || []).filter((e) => e.id !== eventId);
      if (list.length === 0) {
        const next = { ...prev };
        delete next[dateKey];
        return next;
      }
      return { ...prev, [dateKey]: list };
    });
  }, []);

  const getEventCountByDate = useCallback((dateKey) => {
    return (events[dateKey] || []).length;
  }, [events]);

  /** 取得該日顯示於月曆的事件：優先標記為重要者，其次以時間最早為準 */
  const getPrimaryEventForDate = useCallback((dateKey) => {
    const list = events[dateKey] || [];
    if (list.length === 0) return null;
    const important = list.filter((e) => e.isImportant);
    const candidates = important.length > 0 ? important : list;
    const sorted = [...candidates].sort((a, b) => a.time.localeCompare(b.time));
    return sorted[0];
  }, [events]);

  return {
    events,
    getEventsForDate,
    getPrimaryEventForDate,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventCountByDate,
  };
}
