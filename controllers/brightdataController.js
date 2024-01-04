const serpRequestFunction = require("../utils/functions/brightdata/serpRequest");
const serpResponseFunction = require("../utils/functions/brightdata/serpResponse");
const getProfile = require("../utils/functions/iscrapper/getProfile");

const brightDataSerpApi = async function (reqBody) {
  if (
    reqBody?.titleKeywords &&
    reqBody?.titleExclusion &&
    reqBody?.companylinkedinURL &&
    reqBody?.companyName &&
    reqBody?.seniority &&
    reqBody?.linkedinIDsExclusion
  ) {
    let searchQuery = `intitle:" - ${reqBody.companyName}"`;

    searchQuery +=
      reqBody.titleKeywords.length > 0
        ? " (" +
          reqBody.titleKeywords.map((str) => `intitle:"${str}"`).join(" OR ") +
          ")"
        : "";
    searchQuery +=
      reqBody.titleExclusion.length > 0
        ? " " +
          reqBody.titleExclusion.map((str) => `-intitle:"${str}"`).join(" ")
        : "";
    searchQuery +=
      reqBody.seniority.length > 0
        ? " (" +
          reqBody.seniority.map((str) => `intitle:"${str}"`).join(" OR ") +
          ")"
        : "";
    searchQuery +=
      reqBody.linkedinIDsExclusion.length > 0
        ? " " +
          reqBody.linkedinIDsExclusion.map((str) => `-inurl:"${str}"`).join(" ")
        : "";
    searchQuery += " site:linkedin.com/in/";

    let serpReq = await serpRequestFunction(searchQuery);
    await new Promise((resolve) => setTimeout(resolve, 4000));
    let serpRes = await serpResponseFunction(serpReq);

    if (serpRes?.organic?.length > 0) {
      let companyData = await getProfile(
        reqBody.companylinkedinURL.split("/").pop(),
        "company"
      );
      let responseData = [];
      if (companyData.success) {
        await Promise.all(
          serpRes?.organic?.map(async (element, k) => {
            if (
              element.extensions[
                element?.extensions?.length - 1
              ].text.toLowerCase() == reqBody.companyName.toLowerCase() &&
              companyData.data.profile_type
            ) {
              let profileData = await getProfile(
                element.link.split("/").pop(),
                "personal"
              );

              if (profileData.success) {
                if (
                  companyData.data.details.company_id ==
                  profileData?.data?.position_groups[0]?.company.id
                )
                  responseData.push(profileData.data);
              }
            }
          })
        );

        return {
          personData: responseData,
          companyData: companyData.data,
          success: true,
        };
      } else {
        return { message: "linkedin url not found", success: false };
      }
    } else {
      return { message: "profiles not found", success: false };
    }
  } else {
    return { message: "missing parameters", success: false };
  }
};
module.exports = { brightDataSerpApi };
