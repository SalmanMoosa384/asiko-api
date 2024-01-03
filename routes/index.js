const express = require("express");
const routers = express.Router();
const { brightDataSerpApi } = require("../controllers");

routers.get("/", async function (req, res) {
  const result = await brightDataSerpApi();
  console.log("result", result);
  res.send("ok");
});

routers.post("/api/linkedin/get-profiles", async function (req, res) {
  const result = await brightDataSerpApi(req.body);
  res.send(result);
});

module.exports = routers;
