/**
 * 事件資料結構
 * @typedef {Object} CalendarEvent
 * @property {string} id - 唯一識別碼
 * @property {string} dateKey - 日期鍵值，格式 YYYY-MM-DD
 * @property {string} title - 事件標題
 * @property {string} time - 時間，格式 HH:mm
 */

export const STORAGE_KEY = 'yearly-planner-events';

/**
 * 產生唯一 ID
 */
export const generateId = () => `event_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

/**
 * 取得今日的 dateKey (YYYY-MM-DD)
 */
export const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
