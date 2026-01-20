import express, { Router } from "express";
import BamRequest from "../models/request";
import auth from "../middleware/auth";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

const router: Router = express.Router();
export default router;

// Create a new request
router.post("", auth, async (req, res) => {
  const bamRequest = new BamRequest({
    ...req.body,
    owner: req.user!._id
  });

  try {
    await bamRequest.save();
    res.status(StatusCodes.CREATED).send(bamRequest);
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).send(error.message);
  }
});

router.get("", auth, async (req, res) => {
  const PAGE_LIMIT = 8;

  let match: any = {};
  let sort: any = {};

  if (req.query.status) {
    switch (req.query.status) {
      case "Approved":
        match.status = "Approved";
        break;
      case "Denied":
        match.status = "Denied";
        break;
      case "Awaiting approval":
        match.status = "Awaiting approval";
        break;
      default:
        match = {};
    }
  }

  if (req.query.type) {
    switch (req.query.type) {
      case "Blackening":
        match.type = "Blackening";
        break;
      case "Kidud":
        match.type = "Kidud";
        break;
      case "Let me in":
        match.type = "Let me in";
        break;
      case "Let me in by car or plane":
        match.type = "Let me in by car or plane";
        break;
      case "Sign for me":
        match.type = "Sign for me";
        break;
      default:
        match = {};
    }
  }

  if (req.query.date) {
    switch (req.query.date) {
      case "newist":
        sort.createdAt = -1;
        break;
      case "oldest":
        sort.createdAt = 1;
        break;
      default:
        sort = {};
    }
  }

  try {
    console.log(match)
    // const requestCount = await BamRequest.countDocuments({ owner: req.user!._id as mongoose.Types.ObjectId})
    await req.user!.populate({
      path: "requests",
      match,
      options: {
        // limit: PAGE_LIMIT,
        // skip: parseInt(req.query.skip as string) * PAGE_LIMIT,
        sort
      }
    });

    if (req.user!.requests.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).send("No bam requests yet.");
    }
    res.send(req.user!.requests);
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
});

router.get("/allRequests", auth, async (req, res) => {
  const PAGE_LIMIT = 8;

  if (!req.user!.manager) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .send(
        "You must be a manager to complete this action. You are just pathetic :{"
      );
  }

  let match: any = {};
  let sort: any = {};

  if (req.query.status) {
    switch (req.query.status) {
      case "Approved":
        match.status = "Approved";
        break;
      case "Denied":
        match.status = "Denied";
        break;
      case "Awaiting approval":
        match.status = "Awaiting approval";
        break;
      default:
        match = {};
    }
  }

  if (req.query.type) {
    switch (req.query.type) {
      case "Blackening":
        match.type = "Blackening";
        break;
      case "Kidud":
        match.type = "Kidud";
        break;
      case "Let me in":
        match.type = "Let me in";
        break;
      case "Let me in by car or plane":
        match.type = "Let me in by car or plane";
        break;
      case "Sign for me":
        match.type = "Sign for me";
        break;
      default:
        match = {};
    }
  }

  if (req.query.date) {
    switch (req.query.date) {
      case "newist":
        sort.createdAt = -1;
        break;
      case "oldest":
        sort.createdAt = 1;
        break;
      default:
        sort = {};
    }
  }

  try {
    console.log(match);

    const allRequests = await BamRequest.find(match)
      .sort(sort)
      // .skip(parseInt(req.query.skip as string) * PAGE_LIMIT)
      // .limit(PAGE_LIMIT)
      .populate({ path: "owner" });
    if (allRequests.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).send("No requests in database.");
    }
    res.send(allRequests);
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
});

router.patch("/:id", auth, async (req, res) => {
  if (!req.user!.manager) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .send(
        "You must be a manager to complete this action. You are just pathetic :{"
      );
  }
  const RequestID = req.params.id;

  const updates = Object.keys(req.body);
  const allowedUpdates = ["status", "message"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(StatusCodes.BAD_REQUEST).send("invalid updates");
  }

  try {
    const bamRequest = await BamRequest.findById(RequestID);
    if (!bamRequest) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send("This user does not exist in database");
    }
    updates.forEach((update) => {
      bamRequest.set(update, req.body[update]);
    });

    await bamRequest.save();
    res.send(bamRequest);
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).send(error.message);
  }
});
