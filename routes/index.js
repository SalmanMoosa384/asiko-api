const express = require("express");
const routers = express.Router();
const { prospectController } = require("../controllers");



routers.post("/api/linkedin/get-profiles", async function (req, res) {
  const result = await prospectController(req.body);
  res.send(result);
});

module.exports = routers;
