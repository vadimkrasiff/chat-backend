import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { UserModel } from "../models";
import { validationResult } from "express-validator";
import createJWToken from "../utils/createJWToken";
import { customRequest } from "../types";
import { Server } from "socket.io";

class UserController {
  io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  show = async (req: customRequest, res: Response) => {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({
          message: `User ${id} not found`,
        });
      }
      res.json(user);
    } catch (err) {
      res.status(404).json({
        message: "User not found",
      });
    }
  };

  login = async (req: customRequest, res: Response) => {
    const { email, password } = req.body;
    const postData = { email, password };
    try {
      const user = await UserModel.findOne({ email });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      if (bcrypt.compareSync(postData.password, user?.password as string)) {
        const token = createJWToken(user);
        res.json({ status: "success", token });
      } else {
        res.json({
          status: "error",
          message: "Incorrect password or email",
        });
      }
      // generatePasswordHash(postData.password as string | Buffer)
      //   .then((passwordHash) => {
      //   if (!!user && user.password === passwordHash) {
      //     const token = createJWToken(postData);
      //     res.json({ status: "success", token });
      //   } else {
      //     res.json({
      //       status: "error",
      //       m: user?.password,
      //       hm: passwordHash,
      //       message: "Incorrect password or email",
      //     });
      //   }
      // }
      // )
      // .catch((error) =>
      //   res.status(404).json({
      //     message: error,
      //   })
      // );
    } catch (error) {
      return res.status(404).json({
        message: "User not found",
      });
    }
  };

  getMe = async (req: customRequest, res: Response) => {
    try {
      const id = req?.user?._id;

      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({
          message: `User ${id} not found`,
        });
      }
      res.json(user);
    } catch (err) {
      res.status(404).json({
        message: "User not found",
        user: req?.user,
      });
    }
  };

  create = async (req: customRequest, res: Response) => {
    try {
      const { email, surname, name, patronymic, password } = req.body;
      const postData = {
        email,
        surname,
        password,
        name,
        patronymic,
      };
      const user = new UserModel(postData);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const data = await user.save();
      res.json(data);
    } catch (error) {
      res.json(error);
    }
  };

  delete = async (req: customRequest, res: Response) => {
    try {
      const { id: _id } = req.params;
      const user = await UserModel.findOneAndDelete({ _id });
      if (!user) {
        return res.status(404).json({
          message: `User ${_id} not found`,
        });
      }
      res.json({
        message: `User ${user?.surname} ${user?.name} ${user?.patronymic} deleted`,
      });
    } catch (err) {
      res.json(err);
    }
  };
}

export default UserController;
