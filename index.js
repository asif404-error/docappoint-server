const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  }),
);
app.use(express.json());

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);
  console.log(authHeader);
  if (!token) {
    return res
      .status(401)
      .send({ message: "Unauthorized - No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden - Invalid token" });
    }
    req.user = decoded;
    next();
  });
};

run();
