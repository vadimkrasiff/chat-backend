import mongoose, { Schema } from "mongoose";
import { isEmail } from "validator";

const ChatSchema = new Schema(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    admins: [{ type: Schema.Types.ObjectId, ref: "User" }],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    isGroup: { type: Boolean, required: true },
    groupInfo: {
      name: String,
      photo: String,
    },
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", ChatSchema);

export default Chat;
