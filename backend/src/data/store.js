import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = __dirname;

const defaults = {
  users: [],
  invoices: []
};

function ensureFile(fileName, defaultValue) {
  const fullPath = path.join(dataDir, fileName);
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, JSON.stringify(defaultValue, null, 2));
  }
  return fullPath;
}

const usersPath = ensureFile('users.json', defaults.users);
const invoicesPath = ensureFile('invoices.json', defaults.invoices);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, payload) {
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
}

export const db = {
  readUsers() {
    return readJson(usersPath);
  },
  writeUsers(users) {
    writeJson(usersPath, users);
  },
  readInvoices() {
    return readJson(invoicesPath);
  },
  writeInvoices(invoices) {
    writeJson(invoicesPath, invoices);
  }
};
