const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const Startup = require("./StartupModel");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
mongoose
  .connect("mongodb://localhost:27017/startupDB", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("DB Connection Error:", err));

  app.post("/api/startups", async (req, res) => {
    try {
      console.log("Received Data:", req.body); 
  
      const newStartup = new Startup({
        ...req.body,
        owner: req.body.owner || "65f4c0e89f1234567890abcd",
      });
  
      await newStartup.save();
      res.status(201).json({ message: "Startup registered successfully", startup: newStartup });
    } catch (error) {
      console.error("Error:", error.message); 
      res.status(400).json({ error: error.message });
    }
  });
  

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
