import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import Joi from 'joi';
import { db } from '../data/store.js';
import { makeId, generateInvoicePdf } from '../utils/helpers.js';
import { pdfUpload } from '../middleware/upload.js';

const router = express.Router();

const invoiceSchema = Joi.object({
  invoiceNumber: Joi.string().required(),
  issueDate: Joi.string().isoDate().required(),
  amount: Joi.number().positive().required(),
  clientName: Joi.string().required(),
  status: Joi.string().valid('draft', 'issued', 'paid', 'overdue').default('issued'),
  description: Joi.string().allow('').default('')
});

router.get('/', (req, res) => {
  const { q, clientName, from, to, page = 1, limit = 10 } = req.query;
  let invoices = db.readInvoices();

  if (q) {
    const needle = String(q).toLowerCase();
    invoices = invoices.filter((inv) =>
      [inv.invoiceNumber, inv.clientName, inv.description].some((field) =>
        String(field || '').toLowerCase().includes(needle)
      )
    );
  }

  if (clientName) {
    invoices = invoices.filter((inv) => inv.clientName.toLowerCase().includes(String(clientName).toLowerCase()));
  }

  if (from) {
    invoices = invoices.filter((inv) => inv.issueDate >= from);
  }

  if (to) {
    invoices = invoices.filter((inv) => inv.issueDate <= to);
  }

  invoices.sort((a, b) => b.issueDate.localeCompare(a.issueDate));

  const p = Number(page);
  const l = Number(limit);
  const start = (p - 1) * l;

  return res.json({
    page: p,
    limit: l,
    total: invoices.length,
    data: invoices.slice(start, start + l)
  });
});

router.post('/', async (req, res) => {
  const { error, value } = invoiceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const invoices = db.readInvoices();
  if (invoices.some((inv) => inv.invoiceNumber === value.invoiceNumber)) {
    return res.status(409).json({ message: 'Ta številka računa že obstaja.' });
  }

  const id = makeId('inv');
  const fileName = `${id}.pdf`;
  const pdfPath = path.join('backend', 'uploads', fileName);

  const invoice = {
    id,
    ...value,
    pdfPath,
    source: 'generated',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await generateInvoicePdf(invoice, pdfPath);

  invoices.push(invoice);
  db.writeInvoices(invoices);

  return res.status(201).json(invoice);
});

router.post('/upload', pdfUpload.single('pdf'), (req, res) => {
  const schema = Joi.object({
    invoiceNumber: Joi.string().required(),
    issueDate: Joi.string().isoDate().required(),
    amount: Joi.number().positive().required(),
    clientName: Joi.string().required(),
    status: Joi.string().valid('draft', 'issued', 'paid', 'overdue').default('issued'),
    description: Joi.string().allow('').default('')
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'PDF datoteka je obvezna.' });
  }

  const invoices = db.readInvoices();
  const invoice = {
    id: makeId('inv'),
    ...value,
    pdfPath: req.file.path,
    source: 'uploaded',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  invoices.push(invoice);
  db.writeInvoices(invoices);
  return res.status(201).json(invoice);
});

router.put('/:id', (req, res) => {
  const { error, value } = invoiceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const invoices = db.readInvoices();
  const index = invoices.findIndex((inv) => inv.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Račun ni najden.' });
  }

  invoices[index] = {
    ...invoices[index],
    ...value,
    updatedAt: new Date().toISOString()
  };

  db.writeInvoices(invoices);
  return res.json(invoices[index]);
});

router.delete('/:id', (req, res) => {
  const invoices = db.readInvoices();
  const invoice = invoices.find((inv) => inv.id === req.params.id);

  if (!invoice) {
    return res.status(404).json({ message: 'Račun ni najden.' });
  }

  const filtered = invoices.filter((inv) => inv.id !== req.params.id);
  db.writeInvoices(filtered);

  if (invoice.pdfPath && fs.existsSync(invoice.pdfPath)) {
    fs.unlinkSync(invoice.pdfPath);
  }

  return res.status(204).send();
});

router.get('/:id/pdf', (req, res) => {
  const invoices = db.readInvoices();
  const invoice = invoices.find((inv) => inv.id === req.params.id);

  if (!invoice || !invoice.pdfPath || !fs.existsSync(invoice.pdfPath)) {
    return res.status(404).json({ message: 'PDF dokument ni najden.' });
  }

  return res.sendFile(path.resolve(invoice.pdfPath));
});

export default router;
