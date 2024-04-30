const express = require("express");
const path = require("path");
const routers = express.Router();
const {
  prospectController,
  rowsController,
  getLinkedinUrl,
  checkUnFurnishedImage,
  mergedImages,
} = require("../controllers");

const overwriteCell = require("../utils/functions/rows/overwriteCell");

const cron = require("node-cron");

const rowsItem = [];
const { createClient } = require("@supabase/supabase-js");

const processRow = async (index) => {
  try {
    if (rowsItem[index]) {
      await new Promise((resolve) => setTimeout(resolve, 750));
      const rowsResponse = await overwriteCell(rowsItem[index], "success");
      if (rowsResponse.success) {
        console.log(
          rowsResponse,
          `remaining items is ${rowsItem.length - 1} index ${index}`
        );
        rowsItem.splice(index, 1);
      } else {
        console.log("error", rowsResponse);
      }
    }
  } catch (error) {
    console.error(`Error in API call: ${error.message}`);
  }
};

const rowsTask = async () => {
  console.log("Cron job is running!");
  for (let index = 0; index < 10; index++) {
    await processRow(index);
  }
};

routers.post("/api/supabase", async function (req, res) {
  const supabase = createClient(process.env.SUPABASE_URL,process.env.SUPABASE_KEY);

  let { agentName, agentPhone, officeName, license, state } = req.body;
  agentPhone = agentPhone ? agentPhone : "11111111111212sa";
  license = license ? license : "11111111111212sa";
  agentName = agentName ? agentName : "11111111111212sa";
  officeName = officeName ? officeName : "11111111111212sa";
  state = state ? state : "11111111111212sa";

  let { data, error } = await supabase
    .from("state_homes")
    .select('"emails"')
    .or(
      `or("lisence_number".ilike."%${license}%","agent_lisence".ilike."%${license}%"),and("agent_phone_number".ilike."${agentPhone}","agent_full_name".ilike."${agentName}"),and("agency_name".ilike."${officeName}","agent_full_name".ilike."${agentName}"),and("state".ilike."${state}","agent_full_name".ilike."${agentName}")`
    )
    .limit(1);

  if (data?.length > 0) {
    res.send({
      data: data ? { email: data[0]?.emails } : [],
      message: "success",
    });
  } else {
    let { data, error } = await supabase
      .from("state_realtor")
      .select('"Email"')
      .or(
        `and(or("Office".ilike."${agentPhone}","Mobile".ilike."${agentPhone}"),"Full Name".ilike."${agentName}"),and("Office Name".ilike."${officeName}","Full Name".ilike."${agentName}"),and("State".ilike."${state}","Full Name".ilike."${agentName}")`
      )
      .limit(1);

    if (data?.length > 0) {
      res.send({
        data: data ? { email: data[0]?.Email } : [],
        message: "success",
      });
    } else {
      let { data, error } = await supabase
        .from("state_remax")
        .select('"Email 1","Email 2"')
        .or(
          `"License Number".ilike."%${license}%",and("Phone Number".ilike."${agentPhone}","Full Name".ilike."${agentName}"),and("Office Name".ilike."${officeName}","Full Name".ilike."${agentName}"),and("Office State".ilike."${state}","Full Name".ilike."${agentName}")`
        )
        .limit(1);

      if (data?.length > 0) {
        res.send({
          data: data
            ? { email: data[0]?.["Email 1"], email2: data[0]?.["Email 2"] }
            : [],
          message: "success",
        });
      } else {
        let { data, error } = await supabase
          .from("state_scraper_1")
          .select('"Email"')
          .or(
            `and(or("Office Phone".ilike."${agentPhone}","Cell Phone".ilike."${agentPhone}"),"Full Name".ilike."${agentName}"),and("Office Name".ilike."${officeName}","Full Name".ilike."${agentName}"),and("Office State".ilike."${state}","Full Name".ilike."${agentName}")`
          )
          .limit(1);

        if (data?.length > 0) {
          res.send({
            data: data ? { email: data[0]?.Email } : [],
            message: "success",
          });
        } else {
          let { data, error } = await supabase
            .from("state_scraper_2")
            .select('"email_address"')
            .or(
              `and(or("Phone_Number".ilike."${agentPhone}","Fax_Number".ilike."${agentPhone}"),"Full_Name".ilike."${agentName}"),and("State".ilike."${state}","Full_Name".ilike."${agentName}")`
            )
            .limit(1);

          if (data?.length > 0) {
            res.send({
              data: data ? { email: data[0]?.email_address } : [],
              message: "success",
            });
          } else {
            res.send({ message: "failed" });
          }
        }
      }
    }
  }
});

cron.schedule("*/10 * * * * *", rowsTask);

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

// routers.post("/api/check-unfurnished-image", async function (req, res) {
//   const result = await checkUnFurnishedImage(req.body?.imgpath);

//   res.send([...result,{img:req.body?.imgpath}]);
// });

routers.post("/api/merged-images", async function (req, res) {
  const result = await mergedImages(req.body.beforeimage, req.body.afterimage);
  res.send(result);
});

routers.post("/api/check-unfurnished-image/:rand", async function (req, res) {
  try {
    const data = [];
    for (const imgpath of req.body) {
      console.log("imgpath", imgpath);
      const dt = await checkUnFurnishedImage(imgpath);
      data.push([[...dt, { img: imgpath }]]);
      //await delay(0); // Wait for 1 second before starting the next iteration
    }
    res.send(data);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const imagesFolder = path.join(__dirname, "../images");
routers.use("/images", express.static(imagesFolder));

routers.get("/image/:imageName", (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(imagesFolder, imageName);
  res.sendFile(imagePath);
});

routers.get("/image/:folder/:imageName", (req, res) => {
  const imageName = req.params.imageName;
  const folder = req.params.folder;
  const imagePath = path.join(folder, imageName);
  res.sendFile(imagePath);
});

module.exports = routers;
