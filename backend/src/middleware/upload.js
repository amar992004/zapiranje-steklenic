import multer from 'multer';
import path from 'node:path';

const storage = multer.diskStorage({
  destination: 'backend/uploads',
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`);
  }
});

export const pdfUpload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Dovoljene so samo PDF datoteke.'));
    }
  }
});
