"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var dotenv = require("dotenv");
dotenv.config();
var app = (0, express_1.default)();
var port = process.env.PORT;
app.get("/", function (req, res) {
  res.send("Express + TypeScript Server");
});
app.listen(port, function () {
  console.log("[server]: Server is running at http://localhost:".concat(port));
});
var Connection = require("tedious").Connection;
var config = {
  server: "HP.smeeting",
  authentication: {
    type: "default",
    options: {
      userName: "sa",
      password: "123", //update me
    },
  },
  options: {
    // If you are on Microsoft Azure, you need encryption:
    encrypt: true,
    database: "smeeting", //update me
  },
};
var connection = new Connection(config);
connection.on("connect", function (err) {
  // If no error, then good to proceed.
  console.log("Connected");
});
connection.connect();
