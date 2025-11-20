import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

// ES Module workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, "public")));

// POST endpoint to save data
app.post("/save", (req, res) => {
  const data = JSON.parse(fs.readFileSync("data.json"));
  data.push({
    time: new Date().toISOString(),
    height: req.body.height,
    weight: req.body.weight,
    leftArm: req.body.leftArm,
    rightArm: req.body.rightArm
  });
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
  res.json({ status: "success" });
});

// Optional: GET all data
app.get("/all", (req, res) => {
  const data = JSON.parse(fs.readFileSync("data.json"));
  res.json(data);
});

// Ensure root "/" serves index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));




