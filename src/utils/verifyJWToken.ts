import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { UserType } from "../models/User";

export default (token?: string) =>
  new Promise((resolve, reject) => {
    if (token) {
      jwt.verify(token, process.env.JWT_KEY || "", (error, decodedToken) => {
        if (error || !decodedToken) {
          return reject(error);
        }
        resolve(decodedToken);
      });
    } else reject({ message: "Invalid auth token provided" });
  });
