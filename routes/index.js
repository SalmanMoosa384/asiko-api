const express = require("express");
const routers = express.Router();
const {
  prospectController,
  rowsController,
  getLinkedinUrl,
} = require("../controllers");

routers.post("/api/linkedin/get-profiles", async function (req, res) {
  const result = await prospectController(req.body);
  res.send(result);
});

routers.get("/api/rows-data/:domain", async function (req, res) {
  if (req.query.data) {
    const result = await rowsController(req.query.data, req.params.domain);
    res.send(result);
  } else {
    res.send({ success: false, data: "please provide atleast one type" });
  }
});

routers.get("/api/get-linkedin-url/:domain/:sleeptime", async function (req, res) {
  const result = await getLinkedinUrl(req.params.domain,req.params.sleeptime);
  res.send(result);
});

module.exports = routers;
