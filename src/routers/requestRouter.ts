import express, { Router } from "express";
import BamRequest from "../models/request";
import User from "../models/user";
import auth from "../middleware/auth";
import { StatusCodes } from "http-status-codes";

const router: Router = express.Router();
export default router;

const sortControl = (query: { status: string; type: string; date: string }) => {
  let match: any = {};
  let sort: any = {};

  const allowedStatuses = ["Approved", "Denied", "Awaiting approval"];
  if (query.status && allowedStatuses.includes(query.status)) {
    match.status = query.status;
  }

  const allowedTypes = ["Blackening", "Kidud", "Let me in", "Let me in by car or plane", "Sign for me"];
  if (query.type && allowedTypes.includes(query.type)) {
    match.type = query.type;
  }

  if (query.date === "newest") sort.createdAt = -1;
  if (query.date === "oldest") sort.createdAt = 1;

  return { match, sort };
};

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
  const { match, sort } = sortControl(query);
  const countMatch = { ...match, owner: req.user!._id };
  try {
    const requestCount = await BamRequest.countDocuments(countMatch);
    await req.user!.populate({
      path: "requests",
      match,
      options: {
        limit: parseInt(req.query.limit as string),
        skip:
          parseInt(req.query.skip as string) *
          parseInt(req.query.limit as string),
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
router.get("/allRequests", auth, async (req, res) => {
  if (!req.user!.manager) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .send(
        "You must be a manager to complete this action. You are just pathetic :{"
      );
  }

  const query = {
    status: req.query.status as string,
    type: req.query.type as string,
    date: req.query.date as string
  };

  const { match, sort } = sortControl(query);

  let findMatch = { ...match };

  const isValidDate = (dateString: string) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  if (req.query.startDate && req.query.endDate) {
    if (
      !isValidDate(req.query.startDate as string) ||
      !isValidDate(req.query.endDate as string)
    ) {
      return res.status(StatusCodes.BAD_REQUEST).send("Not a valid date.");
    }
    const start = new Date(req.query.startDate as string);
    const end = new Date(req.query.endDate as string);
    if (start > end) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send("Start date must be before end date.");
    }
    findMatch.createdAt = {
      $gte: start,
      $lte: end
    };
  }

  try {
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
      .skip(
        parseInt(req.query.skip as string) * parseInt(req.query.limit as string)
      )
      .limit(parseInt(req.query.limit as string))
      .populate({ path: "owner" });
    if (allRequests.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).send("No requests in database.");
    }
    res.send({ requestCount, allRequests });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
});

// edit request
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
        .send("This request does not exist in database");
    }
    updates.forEach((update) => {
      bamRequest.set(update, req.body[update]);
    });

    const editedRequest = await bamRequest.save();
    console.log(editedRequest);
    res.send(editedRequest);
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).send(error.message);
  }
});
