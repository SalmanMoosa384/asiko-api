const axios = require("axios");
module.exports = async function (domain) {
  try {
    let domainData = await axios({
      method: "get",
      url: `https://storeleads.app/json/api/v1/all/domain/${domain}?fields=platform,estimated_sales,estimated_visits,contact_info`,
      headers: {
        Authorization: `Bearer ${process.env.STORELEADS_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    return { data: domainData.data, success: true };
  } catch (ex) {
    return { ex, success: false };
  }
};
