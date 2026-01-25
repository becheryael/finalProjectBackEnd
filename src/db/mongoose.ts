import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const uri = process.env.CONNECTION_STR;

mongoose.connect(uri!);