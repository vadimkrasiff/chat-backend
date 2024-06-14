import mongoose, { Schema } from "mongoose";

export interface UploadFileType extends Document {
  filename: string;
  size: number;
  ext: string;
  url: string;
  message: string;
  user: string;
}

const UploadFileSchema = new Schema({
  filename: {
    type: String,
  },
  size: {
    type: String,
  },
  ext: {
    type: String,
  },
  url: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  message: {
    type: Schema.Types.ObjectId,
    ref: "Message",
    require: true,
  },
});

const UploadFile = mongoose.model<UploadFileType>(
  "UploadFile",
  UploadFileSchema
);

export default UploadFile;
