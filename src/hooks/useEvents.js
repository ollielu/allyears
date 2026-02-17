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

  /** 取得所有事件列表，每筆含 dateKey，供任務管理頁使用 */
  const getAllEventsList = useCallback(() => {
    return Object.entries(events).flatMap(([dateKey, list]) =>
      (list || []).map((e) => ({ ...e, dateKey }))
    ).sort((a, b) => {
      const d = a.dateKey.localeCompare(b.dateKey);
      return d !== 0 ? d : a.time.localeCompare(b.time);
    });
  }, [events]);

  /** 批次刪除多筆事件 */
  const batchDeleteEvents = useCallback((items) => {
    if (!items || items.length === 0) return;
    setEvents((prev) => {
      const next = { ...prev };
      for (const { dateKey, eventId } of items) {
        const list = (next[dateKey] || []).filter((e) => e.id !== eventId);
        if (list.length === 0) delete next[dateKey];
        else next[dateKey] = list;
      }
      return next;
    });
  }, []);

  /** 將某一事件複製到多個日期（依原事件的 title, time, isImportant, color） */
  const copyEventToDates = useCallback((sourceDateKey, eventId, targetDateKeys) => {
    const list = events[sourceDateKey] || [];
    const ev = list.find((e) => e.id === eventId);
    if (!ev || !targetDateKeys.length) return;
    const uniqueTargets = [...new Set(targetDateKeys)].filter((d) => d !== sourceDateKey);
    setEvents((prev) => {
      const next = { ...prev };
      for (const dateKey of uniqueTargets) {
        const newEvent = {
          id: generateId(),
          dateKey,
          title: ev.title,
          time: ev.time,
          isImportant: !!ev.isImportant,
          color: ev.color || undefined,
        };
        const arr = next[dateKey] || [];
        next[dateKey] = [...arr, newEvent];
      }
      return next;
    });
  }, [events]);

  /** 將同一任務快速大量新增到多個指定日期 */
  const addEventToDates = useCallback((dateKeys, title, time, isImportant = false, color = '') => {
    const t = title.trim();
    if (!t || !dateKeys.length) return;
    const unique = [...new Set(dateKeys)];
    setEvents((prev) => {
      const next = { ...prev };
      for (const dateKey of unique) {
        const newEvent = {
          id: generateId(),
          dateKey,
          title: t,
          time: time || '00:00',
          isImportant: !!isImportant,
          color: color || undefined,
        };
        const arr = next[dateKey] || [];
        next[dateKey] = [...arr, newEvent];
      }
      return next;
    });
  }, []);

  return {
    events,
    getEventsForDate,
    getPrimaryEventForDate,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventCountByDate,
    getAllEventsList,
    batchDeleteEvents,
    copyEventToDates,
    addEventToDates,
  };
}
