import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { YearlyCalendar } from './components/YearlyCalendar';
import { TaskManagement } from './components/TaskManagement';
import { InstallPrompt } from './components/InstallPrompt';
import { Login } from './components/Login'; // 引入登入頁
import { useEvents } from './hooks/useEvents';
import { useTheme } from './hooks/useTheme';
import { useFontSize } from './hooks/useFontSize';
import { UserMenu } from './components/UserMenu';

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // 檢查登入狀態中
  
  const { isDark, toggleTheme } = useTheme();
  const { fontSize, setFontSize, minFontSize, maxFontSize } = useFontSize();
  const [view, setView] = useState('calendar');
  
  // 初始化登入狀態
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 只有當 session 存在時，才去呼叫 useEvents
  // 這樣能確保 useEvents 裡的 fetchEvents 會帶上正確的 user token
  const {
    getEventCountByDate,
    getPrimaryEventForDate,
    getEventsForDate,
    addEvent,
    updateEvent,
    deleteEvent,
    moveEvent,
    getAllEventsList,
    batchDeleteEvents,
    copyEventToDates,
    addEventToDates,
    isLoading: eventsLoading,
  } = useEvents(session ? supabase : null); // 沒登入就不傳 supabase，避免錯誤

  // 處理登出
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // 登出後會自動觸發 onAuthStateChange，session 變 null，畫面切回 Login
  };

  // 1. 如果還在檢查登入狀態，顯示全白或載入動畫
  if (authLoading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${isDark ? 'dark bg-gray-900 text-white' : 'bg-gray-100'}`}>
        載入中...
      </div>
    );
  }

  // 2. 如果沒登入，顯示登入頁
  if (!session) {
    return (
      <div className={isDark ? 'dark' : ''}>
         <Login supabase={supabase} />
      </div>
    );
  }

  // 3. 如果登入了，顯示主程式 (年曆)
  if (eventsLoading) {
    return (
      <div className={isDark ? 'dark' : ''}>
        <div className="flex min-h-screen items-center justify-center text-lg dark:bg-gray-900 dark:text-white">
          同步行程中...
        </div>
      </div>
    );
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      {/* 可以在這裡加一個頂部導覽列，顯示 User Email 和登出按鈕 */}
      <div className="absolute top-4 right-4 z-50">
      <UserMenu session={session} onLogout={handleLogout} />
         {/* 這裡偷放一個登出按鈕，你可以之後再美化它 */}
        
      </div>

      {view === 'calendar' ? (
        <YearlyCalendar
          isDark={isDark}
          onToggleTheme={toggleTheme}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          minFontSize={minFontSize}
          maxFontSize={maxFontSize}
          onOpenTaskManagement={() => setView('tasks')}
          getEventCount={getEventCountByDate}
          getPrimaryEventForDate={getPrimaryEventForDate}
          getEventsForDate={getEventsForDate}
          addEvent={addEvent}
          updateEvent={updateEvent}
          deleteEvent={deleteEvent}
          moveEvent={moveEvent}
        />
      ) : (
        <TaskManagement
          isDark={isDark}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          minFontSize={minFontSize}
          maxFontSize={maxFontSize}
          onBack={() => setView('calendar')}
          getAllEventsList={getAllEventsList}
          batchDeleteEvents={batchDeleteEvents}
          copyEventToDates={copyEventToDates}
          addEventToDates={addEventToDates}
          deleteEvent={deleteEvent}
        />
      )}
      <InstallPrompt />
    </div>
  );
}

export default App;