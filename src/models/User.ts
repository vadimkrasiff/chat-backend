import mongoose, { Schema } from "mongoose";
import { isEmail } from "validator";
import bcrypt from "bcrypt";
import { generatePasswordHash } from "../utils/validations";

export interface UserType extends Document {
  email: string;
  surname: string;
  name: string;
  patronymic: string;
  password: string;
  avatar?: string;
  hash?: string;
  last_seen?: Date;
  role: "user" | "admin";
}

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email address is required"],
      validate: {
        validator: (email: string) => isEmail(email),
        message: `Invalid email`,
      },
      unique: true,
    },
    avatar: { type: String, default: null },
    surname: {
      type: String,
      required: "Surname is required",
    },
    name: {
      type: String,
      required: "Name is required",
    },
    patronymic: {
      type: String,
    },
    password: {
      type: String,
      required: "Password is required",
    },
    hash: String,
    last_seen: { type: Date, default: new Date() },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", function (next) {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  generatePasswordHash(user.password as string | Buffer)
    .then((hash) => {
      user.password = hash as string;
      next();
    })
    .catch((error) => next(error));
});

const User = mongoose.model<UserType>("User", UserSchema);

export default User;
