import { useState, useEffect, useCallback } from 'react';

// ------------------------------------------------------------------
// 輔助函式
// ------------------------------------------------------------------

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

// ------------------------------------------------------------------
// 主 Hook
// ------------------------------------------------------------------

export function useEvents(supabase) {
  const [events, setEvents] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // 1. 讀取 (Load)
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

  // 2. 新增 (Add)
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

  // 3. 更新 (Update)
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

  // 4. 刪除 (Delete)
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

  // 5. 批次刪除 (Batch Delete) - 萬能修正版
  const batchDeleteEvents = useCallback(async (items) => {
    if (!supabase || !items || items.length === 0) return;

    // 除錯日誌：讓你知道前端到底傳了什麼進來
    console.log('準備批次刪除，收到的資料:', items);

    // 萬能 ID 提取器：不管傳物件還是純數字，都抓得出來
    const idsToDelete = items
      .map(item => {
        // 情況 A: item 本身就是 ID (數字或字串)
        if (typeof item === 'number' || typeof item === 'string') return item;
        // 情況 B: item 是物件，嘗試讀取常見的 ID 欄位
        return item?.id || item?.eventId || item?._id;
      })
      .filter(id => id !== undefined && id !== null);

    if (idsToDelete.length === 0) {
      console.warn('批次刪除取消：解析後找不到任何有效的 ID');
      return;
    }

    try {
      const { error } = await supabase.from('events').delete().in('id', idsToDelete);
      if (error) throw error;

      // 前端狀態更新 (需要重新 fetch 或手動過濾)
      // 最簡單且安全的方法：重新整理資料 (雖然慢一點點但保證正確)
      fetchEvents(); 
      
    } catch (err) {
      console.error('批次刪除 API 失敗:', err);
      alert('刪除失敗，請看 Console');
    }
  }, [supabase, fetchEvents]);

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
      if (data) fetchEvents(); // 直接重抓最保險
    } catch (err) {
      console.error('批次新增失敗', err);
    }
  }, [supabase, fetchEvents]);

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

  // Getter Functions
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