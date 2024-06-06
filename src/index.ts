import mongoose from "mongoose";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { createServer } from "node:http";
import { checkAuth, updateLastSeen } from "./middlewares";
import { loginValidation } from "./utils/validations";
import "./core/db";
import createRoutes from "./core/routes";
import createSocket from "./core/socket";

const app = express();
const http = createServer(app);
const io = createSocket(http);
dotenv.config();

createRoutes(app, io);

http.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
