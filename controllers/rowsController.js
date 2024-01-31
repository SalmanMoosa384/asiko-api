const querySelect = require("../utils/functions/postgreSQL/querySelect");
const getProfile = require("../utils/functions/iscrapper/getProfile");
const getDomainDetail = require("../utils/functions/storeLeads/getDomainDetail");

const rowsController = async function (req, domain) {
  let response = { success: true };
  let responseData = {};
  try {
    if (req.includes("iscrapper")) {
      let linkedin_url = await querySelect(
        "linkedin_companies",
        `where company_url IN('https://${domain}','http://${domain}','https://www.${domain}','http://www.${domain}','${domain}','https://${domain}/','http://${domain}/','https://www.${domain}/','http://www.${domain}/','${domain}/')`
      );
      if (linkedin_url.success) {
        responseData.linkedin_url = `https://www.linkedin.com/company/${linkedin_url.data[0].public_id}`;
        let iscrapperRequest = await getProfile(
          linkedin_url.data[0].public_id,
          "company"
        );
        if (iscrapperRequest.success) {
          responseData.iscrapper = iscrapperRequest.data;
        } else {
          responseData.iscrapper = "not found";
        }

        if (req.includes("storeleads")) {
          let storeleadsRequest = await getDomainDetail(domain);
          if (storeleadsRequest.success) {
            storeleadsRequest.data.domain.instagram_followers =
              storeleadsRequest.data.domain.contact_info.filter(
                (i) => i.type == "instagram"
              )[0]?.followers / 100;
            storeleadsRequest.data.domain.twitter_followers =
              storeleadsRequest.data.domain.contact_info.filter(
                (i) => i.type == "twitter"
              )[0]?.followers / 100;
            storeleadsRequest.data.domain.facebook_followers =
              storeleadsRequest.data.domain.contact_info.filter(
                (i) => i.type == "facebook"
              )[0]?.followers / 100;

            storeleadsRequest.data.domain.estimated_sales =
              storeleadsRequest.data.domain.estimated_sales / 100;
            storeleadsRequest.data.domain.estimated_visits =
              storeleadsRequest.data.domain.estimated_visits / 100;

            responseData.storelead = storeleadsRequest.data;
          } else {
            responseData.storelead = "not found";
          }
        }
      } else {
        response.success = false;
        responseData.linkedin_url = "not found";
      }
    }
    response.data = responseData;
    console.log("response", response);
    return response;
  } catch (ex) {
    console.log("ex", ex);
    return response;
  }
};

module.exports = { rowsController };
