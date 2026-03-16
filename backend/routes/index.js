const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("API backend OK ✔ (JavaScript)");
});

module.exports = router;
