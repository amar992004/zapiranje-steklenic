import fs from 'node:fs';
import path from 'node:path';
import { db } from '../backend/src/data/store.js';
import { makeId } from '../backend/src/utils/helpers.js';

const sourceDir = process.argv[2] || 'existing-pdf';

if (!fs.existsSync(sourceDir)) {
  console.error(`Mapa '${sourceDir}' ne obstaja. Ustvari jo in vanjo daj PDF račune.`);
  process.exit(1);
}

const files = fs.readdirSync(sourceDir).filter((f) => f.toLowerCase().endsWith('.pdf'));
const invoices = db.readInvoices();
let imported = 0;

for (const file of files) {
  const basename = path.basename(file, '.pdf');
  const parts = basename.split('_');

  const invoiceNumber = parts[0] || `IMP-${Date.now()}`;
  const issueDate = parts[1] && /^\d{4}-\d{2}-\d{2}$/.test(parts[1]) ? parts[1] : new Date().toISOString().slice(0, 10);
  const amount = Number(parts[2]) || 0;
  const clientName = parts.slice(3).join(' ') || 'Neznana stranka';

  if (invoices.some((inv) => inv.invoiceNumber === invoiceNumber)) {
    continue;
  }

  const id = makeId('inv');
  const destinationName = `${id}_${file}`;
  const destinationPath = path.join('backend', 'uploads', destinationName);
  fs.copyFileSync(path.join(sourceDir, file), destinationPath);

  invoices.push({
    id,
    invoiceNumber,
    issueDate,
    amount,
    clientName,
    status: 'issued',
    description: 'Uvožen obstoječi račun (PDF)',
    pdfPath: destinationPath,
    source: 'imported',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  imported += 1;
}

db.writeInvoices(invoices);
console.log(`Uvoz zaključen. Uvoženih računov: ${imported}/${files.length}`);
