const axios = require("axios");
module.exports = async function (responseId) {
  let serpRes = await axios({
    method: "GET",
    url: "https://api.brightdata.com/serp/get_result",
    params: {
      customer: "hl_f80f4b09",
      zone: "name_to_linkedin_profile",
      output: "json",
      response_id: responseId,
    },
    headers: {
      Authorization: `Bearer ${process.env.BRIGHTDATA_BEARER_TOKEN}`,
    },
  });

  return serpRes.data;
};
