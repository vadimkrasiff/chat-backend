import jwt from "jsonwebtoken";
import { UserType } from "../models/User";
import reduce from "lodash/reduce";

interface LoginDataType {
  email: string;
  password: string;
}

export default (user: any) => {
  const keys = "";
  const token = jwt.sign(
    {
      data: reduce(
        user,
        (result: any, value, key) => {
          if (key !== "password") {
            result[key] = value;
          }
          return result;
        },
        {}
      ),
    },
    process.env.JWT_KEY || "",
    {
      expiresIn: process.env.JWT_MAX_AGE,
      algorithm: "HS256",
    }
  );

  return token;
};
