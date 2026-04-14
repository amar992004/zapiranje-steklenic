import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'node:fs';

export function makeId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function buildMonthlyTotals(invoices) {
  return invoices.reduce((acc, inv) => {
    const month = inv.issueDate.slice(0, 7);
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += Number(inv.amount || 0);
    return acc;
  }, {});
}

export async function generateInvoicePdf(invoice, outputPath) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  page.drawText('RAČUN - AAE gradnje', {
    x: 50,
    y: 790,
    size: 18,
    font: boldFont,
    color: rgb(0.12, 0.12, 0.12)
  });

  const lines = [
    `Številka računa: ${invoice.invoiceNumber}`,
    `Datum izdaje: ${invoice.issueDate}`,
    `Stranka: ${invoice.clientName}`,
    `Opis storitve: ${invoice.description || 'Gradbena storitev'}`,
    `Status: ${invoice.status}`,
    `Znesek: ${Number(invoice.amount).toFixed(2)} EUR`
  ];

  let y = 740;
  for (const line of lines) {
    page.drawText(line, { x: 50, y, size: 12, font });
    y -= 24;
  }

  page.drawText('AAE gradnje d.o.o. | Hvala za zaupanje.', {
    x: 50,
    y: 80,
    size: 10,
    font,
    color: rgb(0.25, 0.25, 0.25)
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
}
