import { useState } from 'react';
import { YearlyCalendar } from './components/YearlyCalendar';
import { TaskManagement } from './components/TaskManagement';
import { InstallPrompt } from './components/InstallPrompt';
import { useEvents } from './hooks/useEvents';
import { useTheme } from './hooks/useTheme';
import { useFontSize } from './hooks/useFontSize';

function App() {
  const { isDark, toggleTheme } = useTheme();
  const { fontSize, setFontSize } = useFontSize();
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
  } = useEvents();

  return (
    <div className={isDark ? 'dark' : ''}>
      {view === 'calendar' ? (
        <YearlyCalendar
          isDark={isDark}
          onToggleTheme={toggleTheme}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
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
