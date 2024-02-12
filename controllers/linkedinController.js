const querySelect = require("../utils/functions/postgreSQL/querySelect");
const getProfile = require("../utils/functions/iscrapper/getProfile");
const getDomainDetail = require("../utils/functions/storeLeads/getDomainDetail");
const { sleep } = require("../utils/functions/helper");

const getLinkedinUrl = async function (domain, sleepTime) {
  await sleep(sleepTime * 1000);
  let response = "not found";
  try {
    let linkedin_url = await querySelect(
      `linkedin_companies`,
      `join tam_companies on tam_companies.linkedin_company_id = linkedin_companies.id
      where tam_companies.domain='${domain}'`
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
