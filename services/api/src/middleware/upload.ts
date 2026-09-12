import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Local uploads directory (ensured to exist)
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Disk storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `incident-${uniqueSuffix}${ext}`);
  },
});

// File filter: validate that file type is an image
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
  ];
  const isImageMime = file.mimetype.startsWith('image/') || allowedMimeTypes.includes(file.mimetype);
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp', '.tiff'];

  if (isImageMime && (allowedExts.includes(ext) || !ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files (JPEG, PNG, WebP, GIF, SVG) are allowed.'));
  }
};

// 5MB file size limit
const limits = {
  fileSize: 5 * 1024 * 1024,
};

export const upload = multer({
  storage,
  fileFilter,
  limits,
});
