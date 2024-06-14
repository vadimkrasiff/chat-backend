import { isEmail } from "validator";
import { Request, Response } from "express";
import { ChatModel, MessageModel } from "../models";
import { Server } from "socket.io";
import { customRequest } from "../types";
import { isEmpty } from "lodash";
import path from "path";
import fs from "fs";
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

      await MessageModel.updateMany(
        {
          chat,
          author: { $ne: userId },
        },
        { unread: false }
      );

      const messages: any = await MessageModel.find({
        chat,
      }).populate(["author", "chat"]);

      if (!messages) {
        return res.status(404).json({
          message: `Messages not found`,
        });
      }

      const formatedMessages = messages.map((message: any) => {
        const {
          _id,
          author,
          text,
          chat,
          unread,
          createdAt,
          attachments,
          audio,
          isSystem,
        } = message;
        const validAuthor = {
          _id: author._id,
          email: author.email,
          avatar: author.avatar,
          surname: author.surname,
          name: author.name,
          role: author.role,
        };
        const validChat = {
          _id: chat._id,
          type: chat.isGroup ? "group" : "private",
        };

        const formattedAttachments = {
          photos: attachments?.photos || [],
          files: attachments?.files || [],
        };

        return {
          _id,
          isMe: author._id == userId,
          author: validAuthor,
          chat: validChat,
          text,
          unread,
          createdAt,
          attachments: formattedAttachments,
          audio,
          isSystem,
        };
      });

      res.json(formatedMessages);
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

      const userId = req?.user?._id;
      const chats = await ChatModel.findOne({
        participants: userId,
        _id: chat,
      });
      if (!chats || isEmpty(chats)) {
        return res.status(404).json({
          message: `Chat not found`,
        });
      }

      const audioFile = req?.files?.audio?.[0];
      let audioAttachment: any = null;
      if (audioFile) {
        const tempPath = audioFile.path;
        const targetDir = path.join(__dirname, "../../uploads");
        const targetPath = path.join(targetDir, audioFile.filename);

        // Ensure the directory exists
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        // Move file to target path
        fs.renameSync(tempPath, targetPath);

        // Construct URL for audio file
        const audioUrl = `/uploads/${audioFile.filename}`;

        // Add audio attachment
        audioAttachment = {
          filename: audioFile.originalname,
          url: audioUrl,
          contentType: audioFile.mimetype,
          size: audioFile.size,
        };
      }

      const attachments = {
        photos: req?.files?.photos
          ? req.files.photos.map((file: any) => ({
              filename: file.originalname,
              url: `/uploads/${file.filename}`,
              contentType: file.mimetype,
              size: file.size,
            }))
          : [],
        files: req?.files?.files
          ? req.files.files.map((file: any) => ({
              filename: file.originalname,
              url: `/uploads/${file.filename}`,
              contentType: file.mimetype,
              size: file.size,
            }))
          : [],
      };

      const postData = {
        author: userId,
        text,
        chat,
        attachments,
        audio: audioAttachment,
      };

      const message = new MessageModel(postData);

      const data: any = await (
        await message.save()
      ).populate(["author", "chat"]);

      if (data) {
        const chatUpdate = await ChatModel.findByIdAndUpdate(
          { _id: chat },
          { lastMessage: data._id },
          { upsert: true }
        );
        if (chatUpdate?.participants.includes(userId)) {
          this.io.emit("SERVER:DIALOG_CREATED", {
            ...postData,
            chat: data,
          });
        }

        const getMessage = () => {
          const { _id, author, text, chat, unread, createdAt, isSystem } =
            data as any;
          const validAuthor = {
            _id: author._id,
            email: author.email,
            avatar: author.avatar,
            surname: author.surname,
            name: author.name,
            role: author.role,
          };
          const validChat = {
            _id: chat._id,
            participants: chat.participants,
            type: chat.isGroup ? "group" : "private",
          };

          return {
            _id,
            isMe: author._id == userId,
            author: validAuthor,
            chat: validChat,
            text,
            unread,
            createdAt,
            attachments,
            audio: audioAttachment,
            isSystem,
          };
        };

        if (data?.chat?.participants.includes(userId)) {
          this.io.emit("SERVER:MESSAGE_CREATED", getMessage());
        }
        res.json(getMessage());
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
      const userId = req?.user?._id;

      const { id: _id } = req.params;
      const message: any = await MessageModel.findOneAndDelete({
        _id,
      }).populate(["author", "chat"]);
      if (!message) {
        return res.status(404).json({
          message: `Message ${_id} not found`,
        });
      }

      const messages = await MessageModel.find({ chat: message.chat })
        .sort({
          createdAt: -1,
        })
        .populate(["author", "chat"]);

      if (messages) {
        const chatUpdate = await ChatModel.findByIdAndUpdate(
          { _id: message.chat?._id },
          { lastMessage: messages[0]._id },
          { upsert: true }
        );
        if (chatUpdate?.participants.includes(userId)) {
          this.io.emit("SERVER:DIALOG_CREATED", {
            chat: messages[0],
          });
        }
      }
      res.json({
        message: `Message deleted`,
      });

      this.io.emit("SERVER:MESSAGE_DELETED", {
        message,
      });
    } catch (err) {
      res.json(err);
    }
  };
}

export default MessageController;
