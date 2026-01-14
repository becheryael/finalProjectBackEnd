import express, { Router, Request, Response } from "express";
import BamRequest from "../models/request";
import auth from "../middleware/auth";
import { StatusCodes } from "http-status-codes";

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
  try {
    // const bamRequest = await BamRequest.find({});
    // if (bamRequest.length === 0) {
    //   return res.status(StatusCodes.NOT_FOUND).send("No bam requests yet.");
    // }
    // res.send(bamRequest);
    // console.log(req)
    console.log('hey');

        await req.user!.populate({
          path: "requests"
        });
            if (req.user!.requests.length === 0) {
              return res.status(StatusCodes.NOT_FOUND).send("No bam requests yet.");
            }
        res.send(req.user!.requests);

  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
});
