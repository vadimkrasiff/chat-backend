import mongoose, { Schema, Document } from "mongoose";

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
  attachments?: {
    photos: {
      filename?: string;
      url?: string;
      contentType?: string;
      size?: number;
    }[];
    files: {
      filename?: string;
      url?: string;
      contentType?: string;
      size?: number;
    }[];
  }[];
  audio: {
    filename?: string;
    url?: string;
    contentType?: string;
    size?: number;
  };
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
    audio: {
      filename: { type: String },
      url: { type: String },
      contentType: { type: String },
      size: { type: Number },
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: [true, "Chat is required"],
    },
    unread: { type: Boolean, default: true },
    attachments: {
      photos: [
        {
          filename: { type: String },
          url: { type: String },
          contentType: { type: String },
          size: { type: Number },
        },
      ],
      files: [
        {
          filename: { type: String },
          url: { type: String },
          contentType: { type: String },
          size: { type: Number },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model<MessageType>("Message", MessageSchema);

export default Message;
