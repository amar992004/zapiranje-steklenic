import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import fs from 'node:fs';
import authRoutes from './routes/auth.js';
import invoiceRoutes from './routes/invoices.js';
import reportRoutes from './routes/reports.js';
import { requireAuth } from './middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

if (!fs.existsSync('backend/uploads')) {
  fs.mkdirSync('backend/uploads', { recursive: true });
}

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, app: 'AAE gradnje računi' });
});

app.use('/api/auth', authRoutes);
app.use('/api/invoices', requireAuth, invoiceRoutes);
app.use('/api/reports', requireAuth, reportRoutes);

app.use(express.static('frontend'));
app.get('*', (_req, res) => {
  res.sendFile(path.resolve('frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`AAE gradnje app teče na http://localhost:${PORT}`);
});
