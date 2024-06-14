import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    let uploadPath = "uploads/";

    // Ensure the directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req: any, file: any, cb: any) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // Ограничение на размер файла 10MB
  fileFilter: (req: any, file: any, cb: any) => {
    const fileTypes = /jpeg|jpg|png|gif|pdf|wav|mp3/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Только изображения, аудио и PDF-файлы разрешены!"));
    }
  },
});

const uploadFiles = upload.fields([
  { name: "photos", maxCount: 10 },
  { name: "files", maxCount: 10 },
  { name: "audio", maxCount: 1 },
]);

export default uploadFiles;
