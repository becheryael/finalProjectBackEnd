import jwt from "jsonwebtoken";
import User from "../models/user";
import { StatusCodes } from "http-status-codes";
import type { NextFunction, Request, Response } from "express";

interface JwtPayload {
  _id: string;
}

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")!;
    const decoded = jwt.verify(token, process.env.SECRET!) as JwtPayload;
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token
    });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).send({ error: "please authenticate" });
  }
};

export default auth;
