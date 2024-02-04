const querySelect = require("../utils/functions/postgreSQL/querySelect");
const getProfile = require("../utils/functions/iscrapper/getProfile");
const getDomainDetail = require("../utils/functions/storeLeads/getDomainDetail");

const getLinkedinUrl = async function (domain) {
  let response = "not found";
  try {
    let linkedin_url = await querySelect(
      "linkedin_companies",
      `where company_url IN('https://${domain}','http://${domain}','https://www.${domain}','http://www.${domain}','${domain}','https://${domain}/','http://${domain}/','https://www.${domain}/','http://www.${domain}/','${domain}/')`
    );
    if (linkedin_url.success) {
      response = linkedin_url.data[0].public_id;
    }
  } catch (ex) {
    response = ex;
  }
  return response;
};

module.exports = { getLinkedinUrl };
