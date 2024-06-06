import { Express } from "express";
import bodyParser from "body-parser";
import { UserCtrl, ChatCtrl, MessageCtrl } from "../controllers";
import { loginValidation } from "../utils/validations";
import { checkAuth, updateLastSeen } from "../middlewares";
// import { Server } from "http";
import { Server } from "socket.io";

const createRoutes = (app: Express, io: Server) => {
  const UserController = new UserCtrl(io);
  const ChatController = new ChatCtrl(io);
  const MessageController = new MessageCtrl(io);

  app.use(bodyParser.json());
  app.use(updateLastSeen);
  app.use(checkAuth);

  app.get("/user/me", UserController.getMe);
  app.get("/user/:id", UserController.show);
  app.delete("/user/:id", UserController.delete);
  app.post("/user/registration", loginValidation, UserController.create);
  app.post("/user/login", loginValidation, UserController.login);

  app.get("/chats", ChatController.index);
  app.get("/chat", ChatController.show);
  app.post("/chat", ChatController.create);
  app.delete("/chats/:userId", ChatController.delete);

  app.get("/messages", MessageController.index);
  app.post("/messages", MessageController.create);
  app.delete("/messages/:id", MessageController.delete);
};

export default createRoutes;
