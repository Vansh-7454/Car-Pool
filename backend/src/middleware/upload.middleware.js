import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadRoot = path.join(__dirname, '..', '..', 'uploads', 'driver-docs');
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadRoot);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const base = file.fieldname === 'licenseImage' ? 'license' : 'aadhaar';
    const id = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${id}${ext}`);
  },
});

function imageFileFilter(req, file, cb) {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'));
  }
  cb(null, true);
}

export const driverDocsUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
  },
}).fields([
  { name: 'licenseImage', maxCount: 1 },
  { name: 'aadhaarImage', maxCount: 1 },
]);