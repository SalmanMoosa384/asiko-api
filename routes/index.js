const express = require("express");
const routers = express.Router();
const { prospectController, linkedinUrlController } = require("../controllers");

routers.post("/api/linkedin/get-profiles", async function (req, res) {
  const result = await prospectController(req.body);
  res.send(result);
});

routers.get("/api/get-linkedin-id/:domain", async function (req, res) {
  const result = await linkedinUrlController(req.params);
  res.send(result);
});

module.exports = routers;
