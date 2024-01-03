const axios = require("axios");
module.exports = async function (profile, type) {
  try {
    let profileData = await axios({
      method: "post",
      url: "https://api.iscraper.io/v2/profile-details",
      data: {
        profile_id: profile,
        profile_type: type,
      },
      headers: {
        "X-API-KEY": `${process.env.ISCRAPPER_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    return { data: profileData.data, success: true };
  } catch (ex) {
    return { ex, success: false };
  }
};
