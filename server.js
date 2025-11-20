import express from "express";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(express.static("public")); // serve index.html if in /public

// Save measurement data
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

// Read all data
app.get("/all", (req, res) => {
  const data = JSON.parse(fs.readFileSync("data.json"));
  res.json(data);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port", port));
