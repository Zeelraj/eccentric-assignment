const express = require("express");
require("dotenv").config();
const app = express();
const cookieParser = require("cookie-parser");

// regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookies and file middleware
app.use(cookieParser());

// Resolve CORS Error
app.use(function (req, res, next) {
  let header = req.headers.origin || "http://localhost:3000";
  res.setHeader("Access-Control-Allow-Origin", header);

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,x-access-token"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

// import all routes here
const auth = require("./routes/auth");
const user = require("./routes/user");
const meeting = require("./routes/meeting");

// router middleware
app.use("/api", auth);
app.use("/api", user);
app.use("/api", meeting);

app.get("/api", async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome, to the Schedular App",
  });
});

// export app js
module.exports = app;
