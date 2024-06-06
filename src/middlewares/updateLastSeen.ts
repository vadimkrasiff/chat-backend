import { NextFunction, Request, Response } from "express";
import { UserModel } from "../models";
export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await UserModel.updateOne(
      { _id: "6638f68e6ae604efbfd3e759" },
      {
        $set: {
          last_seen: new Date(),
        },
      }
    );
  } catch (err) {
    console.error("Error updating user: ", err);
  }
  next();
};
