import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//used for middlewares and for setting configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"));
app.use(cookieParser()) // now we can access cookies in req.body as well as res.body


//routes import 
import userRouter from "./routes/user.routes.js";



//router declaration
app.use("/api/v1/users", userRouter);

//http://localhost:8000/api/v1/users/register

export { app }