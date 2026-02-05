import { StatusCodes } from "http-status-codes";
import type { NextFunction, Request, Response } from "express";

const managerAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user!.isManager) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .send(
        "You must be a manager to complete this action. You are just pathetic :{"
      );
  }
  next();
};

export default managerAuth;
