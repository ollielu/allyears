import { useState } from 'react';
import { supabase } from './supabaseClient';
import { YearlyCalendar } from './components/YearlyCalendar';
import { TaskManagement } from './components/TaskManagement';
import { InstallPrompt } from './components/InstallPrompt';
import { useEvents } from './hooks/useEvents';
import { useTheme } from './hooks/useTheme';
import { useFontSize } from './hooks/useFontSize';

function App() {
  const { isDark, toggleTheme } = useTheme();
  const { fontSize, setFontSize, minFontSize, maxFontSize } = useFontSize();
  const [view, setView] = useState('calendar');
  const {
    getEventCountByDate,
    getPrimaryEventForDate,
    getEventsForDate,
    addEvent,
    updateEvent,
    deleteEvent,
    getAllEventsList,
    batchDeleteEvents,
    copyEventToDates,
    addEventToDates,
    isLoading,
  } = useEvents(supabase);

  if (isLoading) {
    return (
      <div className={isDark ? 'dark' : ''}>
        <div className="flex min-h-screen items-center justify-center text-lg">
          載入中...
        </div>
      </div>
    );
  }

  return (
    <div className={isDark ? 'dark' : ''}>
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
