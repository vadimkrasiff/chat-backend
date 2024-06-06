import { Request, Response } from "express";
import { ChatModel, MessageModel } from "../models";
import { Server } from "socket.io";
import { customRequest } from "../types";
import { isEmpty } from "lodash";

class MessageController {
  io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  index = async (req: customRequest, res: Response) => {
    try {
      const { chat } = req.query;
      const userId = req?.user?._id;

      const currentChat = await ChatModel.findOne({
        _id: chat,
        participants: userId,
      });

      if (!currentChat || isEmpty(currentChat)) {
        return res.status(404).json({
          message: `Chat not found`,
        });
      }

      const messages = await MessageModel.find({
        chat,
      }).populate(["author"]);
      if (!messages) {
        return res.status(404).json({
          message: `Messages not found`,
        });
      }
      res.json(messages);
    } catch (err) {
      res.json(err);
    }
  };

  show = async (req: customRequest, res: Response) => {
    try {
      const { id } = req.params;
      const user = await MessageModel.findById(id);
      if (!user) {
        return res.status(404).json({
          message: `Message ${id} not found`,
        });
      }
      res.json(user);
    } catch (err) {
      res.status(404).json({
        message: "Message not found",
      });
    }
  };

  create = async (req: customRequest, res: Response) => {
    try {
      const { text, chat_id: chat } = req.body;

      const author = req?.user?._id;
      const chats = await ChatModel.findOne({
        participants: author,
        _id: chat,
      });
      if (!chats || isEmpty(chats)) {
        return res.status(404).json({
          message: `Chat not found`,
        });
      }

      const postData = {
        author,
        text,
        chat,
      };

      const message = new MessageModel(postData);

      const data = await (await message.save()).populate("chat");

      if (data) {
        this.io.emit("SERVER:NEW_MESSAGE", data);
        res.json(data);
      } else {
        res.status(500).json({
          message: `Error sending the message`,
        });
      }
    } catch (error) {
      res.json(error);
    }
  };

  delete = async (req: customRequest, res: Response) => {
    try {
      const { id: _id } = req.params;
      const message = await MessageModel.findOneAndDelete({ _id });
      if (!message) {
        return res.status(404).json({
          message: `Message ${_id} not found`,
        });
      }
      res.json({
        message: `Message deleted`,
      });
    } catch (err) {
      res.json(err);
    }
  };
}

export default MessageController;
