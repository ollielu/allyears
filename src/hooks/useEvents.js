import { useState, useEffect, useCallback } from 'react';

/** 將 Supabase 回傳的列轉成前端 state */
function rowsToState(rows) {
  if (!Array.isArray(rows)) return {};
  const byDate = {};
  for (const row of rows) {
    const dateKey = row.date_key;
    if (!dateKey) continue;
    if (!byDate[dateKey]) byDate[dateKey] = [];
    byDate[dateKey].push({
      id: row.id,
      dateKey,
      title: row.title ?? '',
      time: row.time ?? '00:00',
      isImportant: row.is_important,
      color: row.color ?? undefined,
    });
  }
  return byDate;
}

export function useEvents(supabase) {
  const [events, setEvents] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // 1. 讀取
  const fetchEvents = useCallback(async () => {
    if (!supabase) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('events').select('*');
      if (error) throw error;
      setEvents(rowsToState(data || []));
    } catch (err) {
      console.error('載入失敗:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // 2. 新增
  const addEvent = useCallback(async (dateKey, title, time, isImportant = false, color = '') => {
    if (!supabase) return;
    const newRow = {
      date_key: dateKey,
      title: title.trim(),
      time: time || '00:00',
      is_important: !!isImportant,
      color: color || null,
    };

    try {
      const { data, error } = await supabase.from('events').insert([newRow]).select();
      if (error) throw error;

      if (data && data.length > 0) {
        const savedEvent = data[0];
        setEvents((prev) => {
          const list = prev[dateKey] || [];
          const newEventState = {
            id: savedEvent.id,
            dateKey: savedEvent.date_key,
            title: savedEvent.title,
            time: savedEvent.time,
            isImportant: savedEvent.is_important,
            color: savedEvent.color
          };
          return { ...prev, [dateKey]: [...list, newEventState] };
        });
      }
    } catch (err) {
      console.error('新增失敗:', err);
    }
  }, [supabase]);

  // 3. 更新
  const updateEvent = useCallback(async (dateKey, eventId, updates) => {
    if (!supabase) return;
    const rowUpdates = {};
    if (updates.title !== undefined) rowUpdates.title = updates.title;
    if (updates.time !== undefined) rowUpdates.time = updates.time;
    if (updates.isImportant !== undefined) rowUpdates.is_important = updates.isImportant;
    if (updates.color !== undefined) rowUpdates.color = updates.color;

    try {
      const { error } = await supabase.from('events').update(rowUpdates).eq('id', eventId);
      if (error) throw error;

      setEvents((prev) => {
        const list = prev[dateKey] || [];
        const idx = list.findIndex((e) => e.id === eventId);
        if (idx < 0) return prev;
        const updatedList = [...list];
        updatedList[idx] = { ...updatedList[idx], ...updates };
        return { ...prev, [dateKey]: updatedList };
      });
    } catch (err) {
      console.error('更新失敗:', err);
    }
  }, [supabase]);

  // 4. 刪除
  const deleteEvent = useCallback(async (dateKey, eventId) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', eventId);
      if (error) throw error;

      setEvents((prev) => {
        const list = (prev[dateKey] || []).filter((e) => e.id !== eventId);
        const next = { ...prev };
        if (list.length === 0) delete next[dateKey];
        else next[dateKey] = list;
        return next;
      });
    } catch (err) {
      console.error('刪除失敗:', err);
    }
  }, [supabase]);

  // 5. 批次刪除
  const batchDeleteEvents = useCallback(async (items) => {
    if (!supabase || !items.length) return;
    const idsToDelete = items.map(item => item.id);
    try {
      const { error } = await supabase.from('events').delete().in('id', idsToDelete);
      if (error) throw error;

      setEvents((prev) => {
        const next = { ...prev };
        items.forEach(({ dateKey, id }) => {
          if (next[dateKey]) {
            next[dateKey] = next[dateKey].filter(e => e.id !== id);
            if (next[dateKey].length === 0) delete next[dateKey];
          }
        });
        return next;
      });
    } catch (err) {
      console.error('批次刪除失敗', err);
    }
  }, [supabase]);

  // 6. 批次新增
  const addEventToDates = useCallback(async (dateKeys, title, time, isImportant = false, color = '') => {
    if (!supabase || !dateKeys.length) return;
    const rows = dateKeys.map(dateKey => ({
      date_key: dateKey,
      title: title.trim(),
      time: time || '00:00',
      is_important: !!isImportant,
      color: color || null
    }));

    try {
      const { data, error } = await supabase.from('events').insert(rows).select();
      if (error) throw error;
      if (data) {
        setEvents(prev => {
          const next = { ...prev };
          data.forEach(row => {
            const dKey = row.date_key;
            if (!next[dKey]) next[dKey] = [];
            next[dKey].push({
              id: row.id,
              dateKey: row.date_key,
              title: row.title,
              time: row.time,
              isImportant: row.is_important,
              color: row.color
            });
          });
          return next;
        });
      }
    } catch (err) {
      console.error('批次新增失敗', err);
    }
  }, [supabase]);

  // 7. 複製事件
  const copyEventToDates = useCallback(async (sourceDateKey, eventId, targetDateKeys) => {
    const sourceList = events[sourceDateKey] || [];
    const sourceEvent = sourceList.find(e => e.id === eventId);
    if (!sourceEvent) return;
    await addEventToDates(
      targetDateKeys,
      sourceEvent.title,
      sourceEvent.time,
      sourceEvent.isImportant,
      sourceEvent.color
    );
  }, [events, addEventToDates]);

  // Helper Functions
  const getEventsForDate = useCallback((dateKey) => events[dateKey] || [], [events]);
  
  const getEventCountByDate = useCallback((dateKey) => (events[dateKey] || []).length, [events]);

  const getPrimaryEventForDate = useCallback((dateKey) => {
    const list = events[dateKey] || [];
    if (list.length === 0) return null;
    const important = list.filter((e) => e.isImportant);
    const candidates = important.length > 0 ? important : list;
    return [...candidates].sort((a, b) => a.time.localeCompare(b.time))[0];
  }, [events]);

  const getAllEventsList = useCallback(() => {
    return Object.entries(events).flatMap(([dateKey, list]) =>
      (list || []).map((e) => ({ ...e, dateKey }))
    ).sort((a, b) => {
      const d = a.dateKey.localeCompare(b.dateKey);
      return d !== 0 ? d : a.time.localeCompare(b.time);
    });
  }, [events]);

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