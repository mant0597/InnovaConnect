import connectDB from "./connectDB.js";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { getStartup, askQuestion } from "./sendReq.js";
import Startup from "./models/startupModel.js";

dotenv.config();
connectDB();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Set up EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
// Home route
app.get("/", async (req, res) => {
  try {
    const allStartups = await Startup.find();
    res.render("explore", { allStartups });
  } catch (error) {
    console.error("Error fetching startups:", error);
    res.status(500).send("Error loading startups");
  }
});
app.get("/chat/:startupId", async (req, res) => {
  try {
    const startupId = req.params.startupId;
    const startup = await getStartup(startupId);
    console.log("stat", startup);
    res.render("chat", { startup });
  } catch (err) {
    console.log("errrrrrr");
  }
});
app.get("/loader.gif", (req, res) => {
  res.sendFile("img/loader.gif");
});
app.post("/askQuestion", async (req, res) => {
  try {
    // console.dir(req.body);
    const userInput = req.body.userInput;
    const startupId = req.body.id;
    // console.log("incoming /chat req", userInput);
    if (!userInput || !startupId) {
      return res.status(400).json({ error: "Invalid request body" });
    }
    var startup = await getStartup(startupId);
    const response = await askQuestion(userInput, startup);
    // console.log("response from gemini : ",  response);
    res.json({ response });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
``;
