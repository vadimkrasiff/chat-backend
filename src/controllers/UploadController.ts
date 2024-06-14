// controllers/UploadController.ts
import { Response } from "express";
import { customRequest } from "../types";
import { UploadedFileModel } from "../models";
import path from "path";

class UploadController {
  create = async (req: customRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Файл не был загружен" });
      }

      const { originalname, size, filename } = req.file;
      const ext = path.extname(originalname);
      const url = `/uploads/${filename}`;

      const uploadedFile = new UploadedFileModel({
        filename: originalname,
        size,
        ext,
        url,
        user: req.user._id, // предполагается, что user добавлен в req через middleware
        message: req.body.messageId, // предполагается, что messageId передан в теле запроса
      });

      await uploadedFile.save();

      res.status(201).json(uploadedFile);
    } catch (error) {
      res.status(500).json({ error });
    }
  };
}

export default UploadController;
