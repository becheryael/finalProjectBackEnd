import mongoose from "mongoose";

const uri = process.env.CONNECTION_STR;

mongoose.connect(uri!);
