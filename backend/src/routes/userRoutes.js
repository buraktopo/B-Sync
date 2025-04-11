const express = require("express");
const router = express.Router();
const { exec } = require("child_process");

router.get("/", (req, res) => {
  res.send("User API Working");
});

module.exports = router;

router.get("/dro/manual-fetch", (req, res) => {
  exec("node src/scripts/fetchDROData.js", (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.status(500).json({ message: "Failed to update maps" });
    }
    console.log(stdout);
    res.json({ message: "Map successfully updated!" });
  });
});

module.exports = router;