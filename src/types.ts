import { Request } from "express";

export interface customRequest extends Request {
  user?: any;
  files?: any;
  photos?: any;
  file?: any;
  audio?: any;
}
