import { UserType } from "./../models/User";
import { NextFunction, Request, Response } from "express";
import { UserModel } from "../models";
import { verifyJWToken } from "../utils";

export default async (req: any, res: Response, next: NextFunction) => {
  try {
    if (req.path === "/user/login" || req.path === "/user/registration") {
      return next();
    }
    const token = req.headers.token;
    const user: any = await verifyJWToken(token);
    req.user = user?.data?._doc;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid auth token provided" });
  }
};
