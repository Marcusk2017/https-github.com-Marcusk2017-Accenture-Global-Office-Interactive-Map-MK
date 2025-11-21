import React, { useEffect, useState } from 'react';
import { MapView } from './components/MapView';
import { OfficePanel } from './components/OfficePanel';
import { LiveFeedModal } from './components/LiveFeedModal';
import { useAppStore } from './store/useAppStore';
import { AdminLite } from './components/AdminLite';

export function App() {
  const selectedOffice = useAppStore((s) => s.selectedOffice);
  const setOffices = useAppStore((s) => s.setOffices);
  const darkMode = useAppStore((s) => s.darkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const [query, setQuery] = useState('');

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetch('/api/offices')
      .then((r) => r.json())
      .then((data) => setOffices(data))
      .catch((e) => console.error(e));
  }, [setOffices]);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = query ? `/api/offices?q=${encodeURIComponent(query)}` : '/api/offices';
    const data = await fetch(url).then((r) => r.json());
    setOffices(data);
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="brand">Accenture Global Office Map</div>
        <form className="search" onSubmit={onSearch}>
          <input
            aria-label="Search offices"
            placeholder="Search offices, cities, countries"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <div className="header-actions">
          <button 
            className="dark-mode-toggle" 
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <AdminLite />
        </div>
      </header>
      <main className="layout">
        <div className="map-area">
          <MapView />
        </div>
        {selectedOffice && (
          <aside className="panel-area">
            <OfficePanel />
          </aside>
        )}
      </main>
      <LiveFeedModal />
    </div>
  );
}


