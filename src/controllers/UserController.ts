import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { ChatModel, UserModel } from "../models";
import { validationResult } from "express-validator";
import createJWToken from "../utils/createJWToken";
import { customRequest } from "../types";
import { Server } from "socket.io";
import { Document } from "mongodb";
import { Types } from "mongoose";
import { UserType } from "../models/User";

class UserController {
  io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  show = async (req: customRequest, res: Response) => {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({
          message: `User ${id} not found`,
        });
      }
      res.json(user);
    } catch (err) {
      res.status(404).json({
        message: "User not found",
      });
    }
  };

  index = async (req: customRequest, res: Response) => {
    try {
      const userId = req?.user?._id;
      const { id } = req.params;
      const chats = await ChatModel.find({
        participants: userId,
        isGroup: false,
      });
      const participants: string[] = [];
      chats?.forEach((chat: any) => {
        chat?.participants?.forEach((participant: Types.ObjectId) => {
          if (participant.toString() != userId) {
            participants.push(participant.toString());
          }
        });
      });
      const users: (UserType & {
        _id: Types.ObjectId;
      })[] = await UserModel.find({ _id: { $ne: userId } });
      if (!users) {
        return res.status(404).json({
          message: `User ${id} not found`,
        });
      }

      const getUser = (users: any[]) => {
        return users.map((user) => ({
          _id: user?._id,
          name: `${user?.surname} ${user?.name} ${user?.patronymic}`,
          avatar: user?.avatar,
        }));
      };
      const privateUsers = getUser(
        users.filter((user) => {
          return !participants.includes(user?._id.toString());
        })
      );

      const groupUsers = getUser(users);

      res.json({ privateUsers, groupUsers });
    } catch (err) {
      res.status(404).json({
        message: "User not found",
      });
    }
  };

  login = async (req: customRequest, res: Response) => {
    const { email, password } = req.body;
    const postData = { email, password };
    try {
      const user = await UserModel.findOne({ email });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      if (bcrypt.compareSync(postData.password, user?.password as string)) {
        const token = createJWToken(user);
        res.json({ status: "success", token });
      } else {
        res.status(404).json({
          status: "error",
          message: "Неверный логин или пароль",
        });
      }
    } catch (error) {
      return res.status(404).json({
        message: "Неверный логин или пароль",
      });
    }
  };

  getMe = async (req: customRequest, res: Response) => {
    try {
      const id = req?.user?._id;

      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({
          message: `User ${id} not found`,
        });
      }
      res.json(user);
    } catch (err) {
      res.status(404).json({
        message: "User not found",
        user: req?.user,
      });
    }
  };

  create = async (req: customRequest, res: Response) => {
    try {
      const { email, surname, name, patronymic, password } = req.body;
      const postData = {
        email,
        surname,
        password,
        name,
        patronymic,
      };
      const user = new UserModel(postData);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const data = await user.save();
      res.json(data);
    } catch (error) {
      res.json(error);
    }
  };

  delete = async (req: customRequest, res: Response) => {
    try {
      const { id: _id } = req.params;
      const user = await UserModel.findOneAndDelete({ _id });
      if (!user) {
        return res.status(404).json({
          message: `User ${_id} not found`,
        });
      }
      res.json({
        message: `User ${user?.surname} ${user?.name} ${user?.patronymic} deleted`,
      });
    } catch (err) {
      res.json(err);
    }
  };

  uploadAvatar = async (req: customRequest, res: Response) => {
    try {
      const userId = req?.user?._id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "Файл не загружен" });
      }

      const avatarUrl = `/uploads/avatars/${file.filename}`;

      const user = await UserModel.findByIdAndUpdate(
        userId,
        { avatar: avatarUrl },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      res.json({ message: "Аватар успешно загружен", avatar: avatarUrl });
    } catch (err) {
      res.status(500).json({ err });
    }
  };
}

export default UserController;
