/// <reference path="../types/express.d.ts" />
import express, { Router, Request, Response } from "express";
import User from "../models/user";
import { StatusCodes } from "http-status-codes";
import auth from "../middleware/auth";

const router: Router = express.Router();
export default router;

// Create a new user
router.post("/create", async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const personalNum = req.body.personalNum;
    const userByEmail = await User.exists({ email });
    if (userByEmail) {
      throw new Error("A user with this email already exists");
    }
    const userByPersonalNum = await User.exists({ personalNum });
    if (userByPersonalNum) {
      throw new Error("A user with this personal number already exists");
    }

    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    res.status(StatusCodes.CREATED).send({ user, token });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
});

// Login user
router.post("/login", async (req: Request, res: Response) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user: user, token });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
});

// Logout user
router.post("/logout", auth, async (req: Request, res: Response) => {
  try {
    req.user!.tokens = req.user!.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user!.save();
    res.send();
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
});

// Update a user
router.patch("/:id", auth, async (req: Request, res: Response) => {
  const userID = req.params.id;
  console.log(req.body);

  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "personalNum", "avatar"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(StatusCodes.BAD_REQUEST).send("invalid updates");
  }

  try {
    const user = await User.findById(userID);
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send("This user does not exist in database");
    }
    updates.forEach((update) => {
      user.set(update, req.body[update]);
    });

    await user.save();
    res.send(user);
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
});

//Generate new user token
router.post("/newToken", auth, async (req: Request, res: Response) => {
  try {
    //remove old token
    req.user!.tokens = req.user!.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user!.save();
    // create new token
    const token = await req.user!.generateAuthToken();
    res.send({ user: req.user!, token });
  } catch (error: any) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
});
