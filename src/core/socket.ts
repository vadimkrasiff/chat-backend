import { Server } from "socket.io";
import http from "node:http";

enum socketComand {}
export default (http: http.Server) => {
  const io = new Server(http, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {});

  return io;
};
