import { verifyToken } from '../utils/auth.js';

export function requireAuth(req, res, next) {
  const raw = req.headers.authorization;
  const token = raw?.startsWith('Bearer ') ? raw.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Manjka avtentikacijski žeton.' });
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ message: 'Neveljaven ali potekel žeton.' });
  }
}
