const axios = require("axios");
module.exports = async function (query) {
  let SerpReq = await axios({
    method: "post",
    url: "https://api.brightdata.com/serp/req?customer=hl_f80f4b09&zone=name_to_linkedin_profile",
    data: { query: { q: query } },
    headers: { Authorization: `Bearer ${process.env.BRIGHTDATA_BEARER_TOKEN}` },
    maxRedirects: 0,
  });

  return SerpReq.headers["x-response-id"];
};
