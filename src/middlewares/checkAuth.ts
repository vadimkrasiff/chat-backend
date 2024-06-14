import { NextFunction, Request, Response } from "express";
import { verifyJWToken } from "../utils";

const checkAuth = async (req: any, res: Response, next: NextFunction) => {
  try {
    // Пропуск аутентификации для статических файлов и некоторых маршрутов
    if (
      req.path === "/user/login" ||
      req.path === "/user/registration" ||
      req.path.startsWith("/uploads/avatars")
    ) {
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

export default checkAuth;
