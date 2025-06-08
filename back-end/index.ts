import express from "express";
import dotenv from "dotenv";
const jwt = require("jsonwebtoken");
var config = require("./dbconfig");
const sql = require("mssql");
const router = express.Router();
const cors = require("cors");
var bodyParser = require("body-parser");
const userRouter = require("./routes/user/user");
const meetingRouter = require("./routes/meeting/meeting");

const app = express();
dotenv.config();
const port: any = process.env.PORT;
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
// parse application/x-www-form-urlencoded
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

app.use(cors(corsOptions));

app.use("/user", userRouter);
app.use("/meeting", meetingRouter);
