import { Express } from "express";
import bodyParser from "body-parser";
import { UserCtrl, ChatCtrl, MessageCtrl, UploadCtrl } from "../controllers";
import { loginValidation } from "../utils/validations";
import { checkAuth, updateLastSeen } from "../middlewares";
// import { Server } from "http";
import { Server } from "socket.io";
import UploadFile from "../models/UploadedFile";
import uploadFiles from "../middlewares/upload";
import uploadAvatar from "../middlewares/avatarUpload";
import express from "express";
import mongoose from "mongoose";
import path from "path";

const createRoutes = (app: Express, io: Server) => {
  const UserController = new UserCtrl(io);
  const ChatController = new ChatCtrl(io);
  const MessageController = new MessageCtrl(io);
  const UploadController = new UploadCtrl();

  app.use(bodyParser.json());
  app.use(updateLastSeen);

  // Настройка статической директории для аватаров

  // Добавление checkAuth middleware
  app.use(checkAuth);

  app.get("/users", UserController.index);
  app.get("/user/me", UserController.getMe);
  app.post(
    "/user/avatar",
    uploadAvatar.single("avatar"),
    UserController.uploadAvatar
  );
  app.get("/user/:id", UserController.show);
  app.delete("/user/:id", UserController.delete);
  app.post("/user/registration", loginValidation, UserController.create);
  app.post("/user/login", loginValidation, UserController.login);

  app.get("/chats", ChatController.index);
  app.get("/chat", ChatController.show);
  app.post("/chat", ChatController.create);
  app.delete("/chats/:userId", ChatController.delete);

  app.get("/messages", MessageController.index);
  app.post("/messages", uploadFiles, MessageController.create);
  app.delete("/messages/:id", MessageController.delete);
};

export default createRoutes;
