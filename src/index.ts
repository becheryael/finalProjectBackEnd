import express from 'express'
import "./db/mongoose";
import userRouter from './routers/userRouter';
import bamRequestRouter from "./routers/requestRouter"
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/users', userRouter);
app.use("/requests", bamRequestRouter);

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log('Server is up on port ' + port);
});
