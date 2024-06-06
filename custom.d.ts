import { UserType } from "./src/models/User";

declare global {
  namespace Express {
    interface Request {
      user?: UserType;
    }
  }
}
