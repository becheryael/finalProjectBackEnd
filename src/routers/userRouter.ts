/// <reference path="../types/express.d.ts" />
import nodemailer from "nodemailer";
import emailTemplate from "../templates/emailTemplate";
import express, { Router, Request, Response } from "express";
import User from "../models/user";
import { StatusCodes } from "http-status-codes";
import auth from "../middleware/auth";
import dotenv from "dotenv";

dotenv.config();

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
    res.send({ user, token });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({error: error.message});
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

// User forgot password
router.post("/forgot-password", async (req: Request, res: Response) => {
  if (!req.body.email) {
    res.status(StatusCodes.BAD_REQUEST).send("An email is required");
  }
  try {
    const user = await User.findOne({
      email: req.body.email
    });
    if (!user) {
      res.status(StatusCodes.BAD_REQUEST).send("User not found");
    }
    // Generate a reset token
    const token = await user!.generateAuthToken();
    const resetPasswordHTML = emailTemplate(
      `http://localhost:3000/reset-password/${token}`
    );
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
      }
    });
    const mailOptions = {
      from: "BAM APP",
      to: req.body.email,
      subject: "Password Reset For Bam App",
      html: resetPasswordHTML
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send("Error sending email");
      }
    });

    res.send({ token });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
});

// Update user password
router.patch("/reset-password", auth, async (req, res) => {
  req.user!.tokens = req.user!.tokens.filter((token) => {
    return token.token !== req.token;
  });
  const updates = Object.keys(req.body);

  const allowedUpdates = ["password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(StatusCodes.BAD_REQUEST).send("invalid updates");
  }

  try {
    updates.forEach((update) => {
      req.user!.set(update, req.body[update]);
    });

    await req.user!.save();
    const token = await req.user!.generateAuthToken();
    res.send({ user: req.user!, token });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
});

// Update a user
router.patch("/:id", auth, async (req: Request, res: Response) => {
  const userID = req.params.id;

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
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
});
