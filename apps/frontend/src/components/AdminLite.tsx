import React, { useState } from 'react';

type FormState = {
  name: string;
  type: 'Primary' | 'Secondary';
  regionId: string;
  lat: string;
  lng: string;
  line1: string;
  city: string;
  country: string;
};

export function AdminLite() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: '',
    type: 'Primary',
    regionId: 'north-america',
    lat: '',
    lng: '',
    line1: '',
    city: '',
    country: ''
  });
  const [message, setMessage] = useState<string>('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const payload = {
      name: form.name,
      type: form.type,
      regionId: form.regionId,
      coordinates: { lat: Number(form.lat), lng: Number(form.lng) },
      address: { line1: form.line1, city: form.city, country: form.country }
    };
    const res = await fetch('/api/offices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) {
      setMessage('Office created. Refresh to load into map.');
      setForm({ ...form, name: '', lat: '', lng: '', line1: '', city: '', country: '' });
    } else {
      setMessage('Failed to create office.');
    }
  };

  return (
    <div>
      <button className="admin-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        Admin
      </button>
      {open && (
        <div className="admin-card" role="region" aria-label="Admin panel">
          <h3 style={{ marginTop: 0 }}>Add Office (Demo)</h3>
          <form className="admin-form" onSubmit={onSubmit}>
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Type
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })}>
                <option>Primary</option>
                <option>Secondary</option>
              </select>
            </label>
            <label>
              Region
              <select value={form.regionId} onChange={(e) => setForm({ ...form, regionId: e.target.value })}>
                <option value="north-america">North America</option>
                <option value="europe">Europe</option>
                <option value="asia-pacific">Asia Pacific</option>
              </select>
            </label>
            <div className="row2">
              <label>
                Latitude
                <input value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} required />
              </label>
              <label>
                Longitude
                <input value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} required />
              </label>
            </div>
            <label>
              Address line 1
              <input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
            </label>
            <div className="row2">
              <label>
                City
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </label>
              <label>
                Country
                <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </label>
            </div>
            <div className="row2">
              <button type="submit">Create</button>
              {message && <div aria-live="polite">{message}</div>}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}


