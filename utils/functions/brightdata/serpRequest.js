const axios = require("axios");
module.exports = async function (query) {
  try {
    let SerpReq = await axios({
      method: "post",
      url: "https://api.brightdata.com/serp/req?customer=hl_f80f4b09&zone=name_to_linkedin_profile&brd_json=json",
      data: { query: { q: query, num: 20 } },
      headers: {
        Authorization: `Bearer ${process.env.BRIGHTDATA_BEARER_TOKEN}`,
      },
      maxRedirects: 0,
    });

    return { success: true, responseId: SerpReq.headers["x-response-id"] };
  } catch (ex) {
    return { success: false, ex };
  }
};
