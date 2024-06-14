import { NextFunction, Response } from "express";
import { UserModel } from "../models";
import { customRequest } from "../types";
import checkAuth from "./checkAuth";
import { verifyJWToken } from "../utils";
export default async (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.token as any;
    const user: any = await verifyJWToken(token);
    const author = user?.data?._doc?._id;

    const updated = await UserModel.updateOne(
      { _id: author },
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
