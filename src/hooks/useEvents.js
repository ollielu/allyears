import { useState, useEffect, useCallback } from 'react';

// 移除 generateId，因為我們要用資料庫產生的 ID

/** 將 Supabase 回傳的列轉成前端 state 形狀 { [dateKey]: CalendarEvent[] } */
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
      isImportant: row.is_important, // Supabase boolean
      color: row.color ?? undefined,
    });
  }
  return byDate;
}

/** 將單一事件轉成 Supabase 欄位（snake_case） */
function eventToRow(event) {
  return {
    // id 由資料庫自動生成，這裡不傳
    date_key: event.dateKey,
    title: event.title,
    time: event.time || '00:00',
    is_important: !!event.isImportant,
    color: event.color ?? null,
  };
}

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

  // 初始化載入
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // 2. 新增 (Create)
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
      // 寫入並回傳最新的資料 (包含 ID)
      const { data, error } = await supabase
        .from('events')
        .insert([newRow])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        const savedEvent = data[0];
        // 更新前端 State
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
      alert('新增失敗，請檢查 Console');
    }
  }, [supabase]);

  // 3. 更新 (Update)
  const updateEvent = useCallback(async (dateKey, eventId, updates) => {
    if (!supabase) return;

    // 準備要更新的欄位
    const rowUpdates = {};
    if (updates.title !== undefined) rowUpdates.title = updates.title;