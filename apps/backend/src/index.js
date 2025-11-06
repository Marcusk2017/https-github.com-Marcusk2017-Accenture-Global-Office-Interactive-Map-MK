import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = __filename.substring(0, __filename.lastIndexOf('/'));

const app = express();
const PORT = process.env.PORT || 5175;
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || 'http://localhost:5173';

// Configure Helmet - disable CSP in development to allow DevTools
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for development
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({ origin: ALLOW_ORIGIN }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

const dataDir = join(__dirname, '..', 'data');
const officesPath = join(dataDir, 'offices.json');
const regionsPath = join(dataDir, 'regions.json');
const clientsPath = join(dataDir, 'clients.json');
const activitiesPath = join(dataDir, 'activities.json');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
}

// Handle Chrome DevTools requests early (prevents 404 errors)
app.get('/.well-known/*', (_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.get('/api/regions', (_req, res) => {
  const regions = readJson(regionsPath);
  res.json(regions);
});

app.get('/api/offices', (req, res) => {
  const offices = readJson(officesPath);
  const { q, regionId, type } = req.query;

  let result = offices;

  if (regionId) {
    result = result.filter((o) => String(o.regionId) === String(regionId));
  }
  if (type) {
    result = result.filter((o) => o.type.toLowerCase() === String(type).toLowerCase());
  }
  if (q) {
    const s = String(q).toLowerCase();
    result = result.filter((o) =>
      [o.name, o.address?.city, o.address?.country].some((v) => String(v || '').toLowerCase().includes(s))
    );
  }

  res.json(result);
});

app.get('/api/offices/:id', (req, res) => {
  const offices = readJson(officesPath);
  const office = offices.find((o) => o.id === req.params.id);
  if (!office) return res.status(404).json({ message: 'Office not found' });
  res.json(office);
});

// Admin-lite endpoints (demo-only, file-backed storage)
app.post('/api/offices', (req, res) => {
  const offices = readJson(officesPath);
  const office = {
    id: uuidv4(),
    ...req.body,
  };
  offices.push(office);
  writeJson(officesPath, offices);
  res.status(201).json(office);
});

app.put('/api/offices/:id', (req, res) => {
  const offices = readJson(officesPath);
  const idx = offices.findIndex((o) => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Office not found' });
  offices[idx] = { ...offices[idx], ...req.body };
  writeJson(officesPath, offices);
  res.json(offices[idx]);
});

app.delete('/api/offices/:id', (req, res) => {
  const offices = readJson(officesPath);
  const idx = offices.findIndex((o) => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Office not found' });
  const removed = offices.splice(idx, 1)[0];
  writeJson(officesPath, offices);
  res.json(removed);
});

app.get('/api/clients', (_req, res) => {
  res.json(readJson(clientsPath));
});

app.get('/api/activities', (_req, res) => {
  res.json(readJson(activitiesPath));
});

// Chat placeholder
app.post('/api/chat', (_req, res) => {
  res.json({ message: 'Chatbot not implemented in MVP phase.' });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});


