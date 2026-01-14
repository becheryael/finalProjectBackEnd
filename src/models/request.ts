import mongoose, { Document } from "mongoose";

export interface BamRequestType extends Document {
  type: string;
  text: string;
  approved: boolean;
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
    approved: {
      type: Boolean,
      default: false
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

// requestSchema.virtual("user", {
//   ref: "User",
//   localField: "_id",
//   foreignField: "request"
// });

const BamRequest = mongoose.model("Request", bamRequestSchema);

export default BamRequest;
