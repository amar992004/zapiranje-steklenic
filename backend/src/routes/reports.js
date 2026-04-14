import express from 'express';
import { db } from '../data/store.js';
import { buildMonthlyTotals } from '../utils/helpers.js';

const router = express.Router();

router.get('/monthly', (req, res) => {
  const invoices = db.readInvoices();
  const totals = buildMonthlyTotals(invoices);

  const rows = Object.entries(totals)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, total]) => ({ month, total: Number(total.toFixed(2)) }));

  const yearlyTotal = rows.reduce((sum, row) => sum + row.total, 0);

  return res.json({
    year: new Date().getFullYear(),
    rows,
    yearlyTotal: Number(yearlyTotal.toFixed(2)),
    invoiceCount: invoices.length
  });
});

export default router;
