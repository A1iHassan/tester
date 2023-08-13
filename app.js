const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");

app.use(cors());

app.get("/", (req, res) => {
  res.send("<h1>in the server</h1>");
});

app.get("/get", (req, res) => {
  fs.readFile("data.json", "utf-8", (err, data) => {
    if (err) {
      res.status(404).send("data not found", err);
    } else {
      res.status(200).json(data);
    }
  });
});

app.listen(3000, (error) => {
  if (error) {
    console.log("servor error", error);
  } else {
    console.log("server is listening on port 5000....");
  }
});
