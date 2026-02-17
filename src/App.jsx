import { YearlyCalendar } from './components/YearlyCalendar';
import { useEvents } from './hooks/useEvents';
import { useTheme } from './hooks/useTheme';

function App() {
  const { isDark, toggleTheme } = useTheme();
  const {
    getEventCountByDate,
    getPrimaryEventForDate,
    getEventsForDate,
    addEvent,
    updateEvent,
    deleteEvent,
  } = useEvents();

  return (
    <div className={isDark ? 'dark' : ''}>
      <YearlyCalendar
        isDark={isDark}
        onToggleTheme={toggleTheme}
        getEventCount={getEventCountByDate}
        getPrimaryEventForDate={getPrimaryEventForDate}
        getEventsForDate={getEventsForDate}
        addEvent={addEvent}
        updateEvent={updateEvent}
        deleteEvent={deleteEvent}
      />
    </div>
  );
}

export default App;
