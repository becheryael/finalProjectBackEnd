import { UserInterface } from "../models/user";

declare global {
  declare namespace Express {
    export interface Request {
      user?: UserInterface;
      token?: string;
    }
  }
}
