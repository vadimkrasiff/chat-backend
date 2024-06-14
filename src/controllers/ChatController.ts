import { Request, Response } from "express";
import { ChatModel, MessageModel } from "../models";
import { isEmpty } from "lodash";
import { customRequest } from "../types";
import { Server } from "socket.io";

class ChatController {
  io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  index = async (req: customRequest, res: Response) => {
    try {
      const userId = req?.user?._id;
      const chats = await ChatModel.find({
        participants: userId,
      }).populate(["participants", "lastMessage"]);
      if (!chats) {
        return res.status(404).json({
          message: `Chats for ${userId} not found`,
        });
      }

      const formattedDialogs = chats.map((chat) => {
        const {
          author,
          text,
          unread,
          createdAt,
          isSystem,
          attachments,
          audio,
        } = chat?.lastMessage as any;
        const otherParticipant: any = chat.participants.find(
          (participant) => participant._id.toString() == author
        );
        const lastMessage: any = chat?.lastMessage
          ? {
              authorId: author,
              author: otherParticipant.name,
              isMe: author == userId,
              text,
              unread,
              createdAt,
              isSystem,
              attachments,
              audio,
            }
          : {};
        if (chat.isGroup) {
          return {
            _id: chat._id,
            name: chat?.groupInfo?.name,
            photo: chat?.groupInfo?.photo || null,
            type: "group",
            lastMessage: lastMessage,
          };
        } else {
          const otherParticipant: any = chat.participants.find(
            (participant) => participant._id.toString() !== userId
          );
          return {
            _id: chat._id,
            name: `${otherParticipant?.surname} ${otherParticipant?.name} ${otherParticipant?.patronymic}`,
            photo: otherParticipant.avatar || null,
            type: "private",
            last_seen: otherParticipant.last_seen,
            lastMessage: lastMessage,
          };
        }
      });
      res.json(formattedDialogs);
    } catch (error) {
      res.status(404).json({
        message: "Chats not found",
        error,
      });
    }
  };

  show = async (req: customRequest, res: Response) => {
    try {
      const { id } = req.query;
      const userId = req?.user?._id;
      const chat: any = await ChatModel.findOne({
        _id: id,
        participants: userId,
      }).populate("participants");
      if (!chat || isEmpty(chat)) {
        return res.status(404).json({
          message: `Chat ${id} not found`,
        });
      }

      const formattedDialog = () => {
        if (chat?.isGroup) {
          return {
            _id: chat?._id,
            name: chat?.groupInfo?.name,
            photo: chat?.groupInfo?.photo || null,
            type: "group",
            author: chat?.author,
            admins: chat?.admins,
            participants: chat.participants,
          };
        } else {
          const otherParticipant: any = chat?.participants.find(
            (participant: any) => participant?._id?.toString() !== userId
          );
          return {
            _id: chat._id,
            name: `${otherParticipant?.surname} ${otherParticipant?.name} ${otherParticipant?.patronymic}`,
            photo: otherParticipant?.avatar || null,
            type: "private",
            last_seen: otherParticipant?.last_seen,
            participant: otherParticipant,
          };
        }
      };

      const dialog = formattedDialog();

      res.json(dialog);
    } catch (error) {
      res.status(404).json({
        message: "Chats not found",
        error,
      });
    }
  };

  create = async (req: customRequest, res: Response) => {
    try {
      const { isGroup = false, participants, groupInfo } = req.body;
      const authorId = req?.user?._id;
      const postData = {
        isGroup,
        participants,
        author: authorId,
        groupInfo: {},
      };

      if (isGroup) {
        if (!groupInfo || !groupInfo.name) {
          return res.status(500).json({
            message: `Не указано название чата`,
          });
        }
        postData.groupInfo = groupInfo;
      }
      if (!participants) {
        return res.status(500).json({
          message: `Не указаны участники чата`,
        });
      }
      if (!isGroup && participants.length !== 2) {
        return res.status(500).json({
          message: `В приватном чате может быть только 2 участника`,
        });
      }

      const chat = new ChatModel(postData);

      const data = await chat.save();

      if (data) {
        (async () => {
          try {
            const message = new MessageModel({
              isSystem: true,
              author: authorId,
              chat: data._id,
              text: `Чат создан`,
            });
            const response = await message.save();
            if (response) {
              const chatUpdate = await ChatModel.findByIdAndUpdate(
                { _id: data._id },
                { lastMessage: response._id },
                { upsert: true }
              );
              res.json({
                dialog: data,
              });
              if (chatUpdate?.participants.includes(authorId)) {
                this.io.emit("SERVER:DIALOG_CREATED", {
                  ...postData,
                  chat: data,
                });
              }
            }
          } catch (error) {
            res.json(error);
          }
        })();
      }
    } catch (error) {
      res.json(error);
    }
  };

  delete = async (req: customRequest, res: Response) => {
    try {
      const { userId: _id } = req.params;
      const user = await ChatModel.findOneAndDelete({ _id });
      if (!user) {
        return res.status(404).json({
          message: `Chat ${_id} not found`,
        });
      }
      res.json({
        message: `Chat deleted`,
      });
    } catch (err) {
      res.json(err);
    }
  };
}

export default ChatController;
