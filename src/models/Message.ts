import mongoose, { Schema } from "mongoose";

export interface MessageType extends Document {
  author: {
    type: Schema.Types.ObjectId;
    ref: string;
    required: true;
  };
  chat: {
    type: Schema.Types.ObjectId;
    ref: string;
    required: true;
  };
  text: string;
  unread: boolean;
}

const MessageSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    isSystem: Boolean,
    text: String,
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: [true, "Chat is required"],
    },
    unread: { type: Boolean, default: true },
    // attachments:
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", MessageSchema);

export default Message;
