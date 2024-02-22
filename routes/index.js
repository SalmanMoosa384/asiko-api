const express = require("express");
const routers = express.Router();
const {
  prospectController,
  rowsController,
  getLinkedinUrl,
} = require("../controllers");

const overwriteCell = require("../utils/functions/rows/overwriteCell");

const cron = require("node-cron");

const rowsItem = [];

const rowsTask = async () => {
  console.log("Cron job is runnings!");
 
  for (let index = 0; index < 60; index++) {
    try {
      await new Promise((resolve)=>setTimeout(resolve,900))
      const rowsResponse = await overwriteCell(rowsItem[index], "success");
      if(rowsResponse.success){
        console.log(rowsResponse,rowsItem[index]);
        rowsItem.splice(index, 1);
      }
      else{
        console.log("error",rowsResponse);
      }
    } catch (error) {
      console.error(`Error in API call: ${error.message}`);
    }
  }
};

cron.schedule("*/1 * * * *", rowsTask);

routers.get(
  "/api/rows/rate-limit/:spreadsheet/:table/:column/:row",
  function (req, res) {
    const rowsUrl = `spreadsheets/${req.params.spreadsheet}/tables/${req.params.table}/cells/${req.params.column}${req.params.row}:${req.params.column}${req.params.row}`;
    rowsItem.push(rowsUrl);
    res.send("pending");
  }
);

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

routers.get(
  "/api/get-linkedin-url/:domain/:sleeptime",
  async function (req, res) {
    const result = await getLinkedinUrl(
      req.params.domain,
      req.params.sleeptime
    );
    res.send(result);
  }
);

module.exports = routers;
