import express from "express";
import BamRequest from "../models/request";
import User from "../models/user";
import auth from "../middleware/auth";
import managerAuth from "../middleware/managerAuth";
import { StatusCodes } from "http-status-codes";
import sortControl from "../utils/sortControl";

const router = express.Router();

const DEFAULT_LIMIT = 10;

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

// Get user's requests
router.get("", auth, async (req, res) => {
  const query = {
    status: req.query.status as string,
    type: req.query.type as string,
    date: req.query.date as string
  };

  const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;
  const skip = (parseInt(req.query.skip as string) || 0) * limit;

  try {
    const { match, sort } = sortControl(query);
    const countMatch = { ...match, owner: req.user!._id };
    const requestCount = await BamRequest.countDocuments(countMatch);
    await req.user!.populate({
      path: "requests",
      match,
      options: {
        limit,
        skip,
        sort
      }
    });

    if (req.user!.requests.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).send("No bam requests yet.");
    }
    res.send({ requestCount, requests: req.user!.requests });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
});

// Get all requests
router.get("/allRequests", auth, managerAuth, async (req, res) => {
  const query = {
    status: req.query.status as string,
    type: req.query.type as string,
    date: req.query.date as string,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string
  };

  const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;
  const skip = (parseInt(req.query.skip as string) || 0) * limit;

  try {
    const { match, sort } = sortControl(query);
    let findMatch = { ...match };

    if (req.query.userSearch) {
      const user = await User.findOne({
        name: { $regex: req.query.userSearch as string, $options: "i" }
      });
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).send("User not found.");
      }
      findMatch.owner = user._id;
    }

    const requestCount = await BamRequest.countDocuments(findMatch);
    const allRequests = await BamRequest.find(findMatch)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("owner", "name avatar")
      .lean();
    if (allRequests.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).send("No requests in database.");
    }
    res.send({ requestCount, allRequests });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
});

// Edit request
router.patch("/:id", auth, managerAuth, async (req, res) => {
  const requestID = req.params.id;

  const updates = Object.keys(req.body);
  const allowedUpdates = ["status", "message"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(StatusCodes.BAD_REQUEST).send("invalid updates");
  }

  try {
    const bamRequest = await BamRequest.findById(requestID);
    if (!bamRequest) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send("This request does not exist in database");
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

export default router;
