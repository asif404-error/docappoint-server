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

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB!");

    const db = client.db("docappoint");
    const doctorsCollection = db.collection("doctors");
    const appointmentsCollection = db.collection("appointments");

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "7d" });
      console.log(token);
      res.send({ token });
    });

    app.get("/doctors", async (req, res) => {
      try {
        const doctors = await doctorsCollection.find().toArray();
        res.send(doctors);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch doctors" });
      }
    });

    app.get("/doctors/top-rated", async (req, res) => {
      try {
        const doctors = await doctorsCollection
          .find()
          .sort({ rating: -1 })
          .limit(3)
          .toArray();
        res.send(doctors);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch top rated doctors" });
      }
    });

    app.get("/doctors/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const doctor = await doctorsCollection.findOne(query);
        if (!doctor) {
          return res.status(404).send({ message: "Doctor not found" });
        }
        res.send(doctor);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch doctor" });
      }
    });

    app.get("/appointments", async (req, res) => {
      try {
        const email = req.query.email;

        const query = { userEmail: email };

        const result = await appointmentsCollection.find(query).toArray();

        res.send(result);
      } catch (error) {
        console.log(error);

        res.status(500).send({
          message: "Failed to fetch appointments",
        });
      }
    });

    app.post("/appointments", async (req, res) => {
      try {
        const appointment = req.body;
        const result = await appointmentsCollection.insertOne(appointment);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to create appointment" });
      }
    });


run();
