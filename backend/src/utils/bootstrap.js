import bcrypt from 'bcryptjs';
import { db } from '../data/store.js';
import { makeId } from './helpers.js';

export async function ensureDefaultAdmin() {
  const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@aae.si';
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin12345!';
  const fullName = process.env.DEFAULT_ADMIN_NAME || 'AAE Admin';

  const users = db.readUsers();
  const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());

  if (exists) {
    return { created: false, email, password };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  users.push({
    id: makeId('usr'),
    fullName,
    email,
    passwordHash,
    role: 'admin',
    createdAt: new Date().toISOString()
  });

  db.writeUsers(users);
  return { created: true, email, password };
}
