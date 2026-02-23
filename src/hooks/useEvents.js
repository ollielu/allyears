import { useState, useEffect, useCallback } from 'react';
import { generateId } from '../types/event';

/** 將 Supabase 回傳的列轉成前端 state 形狀 { [dateKey]: CalendarEvent[] } */
function rowsToState(rows) {
  if (!Array.isArray(rows)) return {};
  const byDate = {};
  for (const row of rows) {
    const dateKey = row.date_key ?? row.dateKey;
    if (!dateKey) continue;
    if (!byDate[dateKey]) byDate[dateKey] = [];
    byDate[dateKey].push({
      id: row.id,
      dateKey,
      title: row.title ?? '',
      time: row.time ?? '00:00',
      isImportant: !!row.is_important || !!row.isImportant,
      color: row.color ?? undefined,
    });
  }
  return byDate;
}

/** 將單一事件轉成 Supabase 欄位（snake_case） */
function eventToRow(event) {
  return {
    id: event.id,
    date_key: event.dateKey,
    title: event.title,
    time: event.time || '00:00',
    is_important: !!event.isImportant,
    color: event.color ?? null,
  };
}

/**
 * 事件管理的自訂 Hook
 * 使用 Supabase 持久化（需傳入 supabase 客戶端）
 */
export function useEvents(supabase) {
  const [events, setEvents] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // 掛載時從 Supabase 載入
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('events').select('*');
      if (cancelled) return;
      if (!error && data) setEvents(rowsToState(data));
      setIsLoading(false);
    })();
    return () => { cancelled = true; };
  }, [supabase]);

  const getEventsForDate = useCallback((dateKey) => {
    return events[dateKey] || [];
  }, [events]);

  const addEvent = useCallback(async (dateKey, title, time, isImportant = false, color = '') => {
    const newEvent = {
      id: generateId(),
      dateKey,
      title: title.trim(),
      time: time || '00:00',
      isImportant: !!isImportant,
      color: color || undefined,
    };
    if (!supabase) return;
    const { error } = await supabase.from('events').insert([eventToRow(newEvent)]);
    if (error) return;
    setEvents((prev) => {
      const list = prev[dateKey] || [];
      return { ...prev, [dateKey]: [...list, newEvent] };
    });
  }, [supabase]);

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

  const deleteEvent = useCallback(async (dateKey, eventId) => {
    if (supabase) {
      const { error } = await supabase.from('events').delete().eq('id', eventId);
      if (error) return;
    }
    setEvents((prev) => {
      const list = (prev[dateKey] || []).filter((e) => e.id !== eventId);
      if (list.length === 0) {
        const next = { ...prev };
        delete next[dateKey];
        return next;
      }
      return { ...prev, [dateKey]: list };
    });
  }, [supabase]);

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
    isLoading,
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
