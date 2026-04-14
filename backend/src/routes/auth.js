import express from 'express';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import { db } from '../data/store.js';
import { makeId } from '../utils/helpers.js';
import { signToken } from '../utils/auth.js';

const router = express.Router();

const registerSchema = Joi.object({
  fullName: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

router.post('/register', async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const users = db.readUsers();
  if (users.some((u) => u.email.toLowerCase() === value.email.toLowerCase())) {
    return res.status(409).json({ message: 'Uporabnik s tem e-naslovom že obstaja.' });
  }

  const passwordHash = await bcrypt.hash(value.password, 10);
  const user = {
    id: makeId('usr'),
    fullName: value.fullName,
    email: value.email,
    passwordHash,
    role: 'admin',
    createdAt: new Date().toISOString()
  };

  users.push(user);
  db.writeUsers(users);

  return res.status(201).json({
    token: signToken(user),
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }
  });
});

router.post('/login', async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const users = db.readUsers();
  const user = users.find((u) => u.email.toLowerCase() === value.email.toLowerCase());

  if (!user) {
    return res.status(401).json({ message: 'Napačen e-naslov ali geslo.' });
  }

  const matches = await bcrypt.compare(value.password, user.passwordHash);
  if (!matches) {
    return res.status(401).json({ message: 'Napačen e-naslov ali geslo.' });
  }

  return res.json({
    token: signToken(user),
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }
  });
});

export default router;
