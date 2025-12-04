import React, { useState, useEffect } from 'react';

type Settings = {
  welcomeFontSize: number;
  welcomeFontFamily: string;
  globeZoom: number;
  markerSize: number;
};

const DEFAULT_SETTINGS: Settings = {
  welcomeFontSize: 100, // Percentage
  welcomeFontFamily: 'Graphik',
  globeZoom: 1.3,
  markerSize: 40, // Pixels
};

export function AdminLite() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [message, setMessage] = useState<string>('');

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('accenture-map-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
  }, []);

  // Apply settings to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--welcome-font-scale', `${settings.welcomeFontSize / 100}`);
    root.style.setProperty('--globe-zoom', `${settings.globeZoom}`);
    root.style.setProperty('--marker-size', `${settings.markerSize}px`);
    
    // Update welcome screen font family
    const welcomeElements = document.querySelectorAll('.welcome-content, .welcome-text, .innovation-center, .touch-prompt');
    welcomeElements.forEach(el => {
      (el as HTMLElement).style.fontFamily = `${settings.welcomeFontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`;
    });
  }, [settings]);

  const handleSave = () => {
    localStorage.setItem('accenture-map-settings', JSON.stringify(settings));
    setMessage('Settings saved! Refresh the page to apply globe and marker size changes.');
    setTimeout(() => setMessage(''), 4000);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('accenture-map-settings');
    setMessage('Settings reset to defaults! Refresh the page to fully apply.');
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div>
      <button className="admin-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        Settings
      </button>
      {open && (
        <div className="admin-card settings-panel" role="region" aria-label="Settings panel">
          <h3 style={{ marginTop: 0, color: '#A100FF' }}>Display Settings</h3>
          
          <div className="settings-form">
            {/* Welcome Screen Settings */}
            <div className="settings-section">
              <h4>Welcome Screen</h4>
              
              <label>
                Font Size: {settings.welcomeFontSize}%
                <input 
                  type="range" 
                  min="50" 
                  max="150" 
                  value={settings.welcomeFontSize}
                  onChange={(e) => setSettings({ ...settings, welcomeFontSize: Number(e.target.value) })}
                  className="slider"
                />
                <span className="range-labels">
                  <span>50%</span>
                  <span>150%</span>
                </span>
              </label>

              <label>
                Font Family
                <select 
                  value={settings.welcomeFontFamily}
                  onChange={(e) => setSettings({ ...settings, welcomeFontFamily: e.target.value })}
                >
                  <option value="Graphik">Graphik</option>
                  <option value="Inter">Inter</option>
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                </select>
              </label>
            </div>

            {/* Globe Settings */}
            <div className="settings-section">
              <h4>Globe View</h4>
              
              <label>
                Initial Zoom Level: {settings.globeZoom.toFixed(1)}
                <input 
                  type="range" 
                  min="0.5" 
                  max="3" 
                  step="0.1"
                  value={settings.globeZoom}
                  onChange={(e) => setSettings({ ...settings, globeZoom: Number(e.target.value) })}
                  className="slider"
                />
                <span className="range-labels">
                  <span>Far (0.5)</span>
                  <span>Close (3.0)</span>
                </span>
              </label>
            </div>

            {/* Marker Settings */}
            <div className="settings-section">
              <h4>Office Markers</h4>
              
              <label>
                Marker Size: {settings.markerSize}px
                <input 
                  type="range" 
                  min="20" 
                  max="80" 
                  value={settings.markerSize}
                  onChange={(e) => setSettings({ ...settings, markerSize: Number(e.target.value) })}
                  className="slider"
                />
                <span className="range-labels">
                  <span>20px</span>
                  <span>80px</span>
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="settings-actions">
              <button type="button" onClick={handleSave} className="save-btn">
                Save Settings
              </button>
              <button type="button" onClick={handleReset} className="reset-btn">
                Reset to Defaults
              </button>
            </div>

            {message && (
              <div className="settings-message" aria-live="polite">
                {message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
