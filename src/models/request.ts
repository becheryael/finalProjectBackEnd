import mongoose, { Document } from "mongoose";

export interface BamRequestType extends Document {
  type: string;
  text: string;
  status: string;
  message: string;
  owner: mongoose.Schema.Types.ObjectId;
}

const bamRequestSchema = new mongoose.Schema<BamRequestType>(
  {
    type: {
      type: String,
      required: true,
      trim: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      default: "Awaiting approval",
      validate(value: string) {
        if (
          value !== "Awaiting approval" &&
          value !== "Approved" &&
          value !== "Denied"
        ) {
          throw new Error("Not valid approval status");
        }
      }
    },
    message: {
      type: String,
      trim: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
  }
);

const BamRequest = mongoose.model("Request", bamRequestSchema);

export default BamRequest;
