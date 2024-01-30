const querySelect = require("../utils/functions/postgreSQL/querySelect");

const linkedinUrlController = async function (req) {
  let response = "not found";
  try {
    let linkedin_url = await querySelect(
      "linkedin_companies",
      `where company_url IN('https://${req.domain}','http://${req.domain}','https://www.${req.domain}','http://www.${req.domain}','${req.domain}','https://${req.domain}/','http://${req.domain}/','https://www.${req.domain}/','http://www.${req.domain}/','${req.domain}/')`
    );
    if (linkedin_url.success) {
      response = linkedin_url.data[0].public_id;
      return response;
    }
    return response;
  } catch (ex) {
    return response;
  }
};

module.exports = { linkedinUrlController };
