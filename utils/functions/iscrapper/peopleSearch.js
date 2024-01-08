const axios = require("axios");
module.exports = async function (
  companyId,
  currentJobTitle,
  limit = 10,
  offset = 0
) {
  try {
    let peoples = await axios({
      method: "post",
      url: "https://api.iscraper.io/v2/people-search",
      data: {
        per_page: limit,
        offset: offset,
        keyword: "",
        current_companies: [companyId],
        current_job_title: currentJobTitle,
      },
      headers: {
        "X-API-KEY": `${process.env.ISCRAPPER_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    return { data: peoples.data, success: true };
  } catch (ex) {
    return { ex, success: false };
  }
};
