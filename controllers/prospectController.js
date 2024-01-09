const getProfile = require("../utils/functions/iscrapper/getProfile");
const peopleSearch = require("../utils/functions/iscrapper/peopleSearch");
const helpers = require("../utils/functions/helper");

const prospectController = async function (reqBody) {
  if (reqBody?.jobTitles && reqBody?.companylinkedinURL) {
    reqBody.companylinkedinURL = helpers.extractCompanyIdFromUrl(
      reqBody.companylinkedinURL
    );
    let limit = reqBody?.limit ? reqBody.limit : 1;
    let count = 0;
    let responseDetail = {};
    responseDetail.profiles = [];
    let companyDetail = await getProfile(reqBody.companylinkedinURL, "company");

    if (companyDetail.data?.profile_type) {
      responseDetail.companyDetail = companyDetail.data;

      let response = await Promise.all(
        reqBody.jobTitles.map(async (jobtitle) => {
          let companyId = companyDetail.data.details.company_id;

          let peopleSearchData = await peopleSearch(
            companyId,
            jobtitle,
            helpers.iScrapperLimit(limit)
          );
          peopleSearchData.data.results = helpers.sortByTitle(
            peopleSearchData.data.results,
            jobtitle
          );
          for (const profile of peopleSearchData.data.results) {
            if (count == limit) {
              break;
            }
            else{
            let profileDetail = await getProfile(
              profile.profile_id,
              "personal"
            );
            let getCurrentCompanyPosition =
              profileDetail.data.position_groups.filter((prof) => {
                return (
                  prof.company.id == companyId &&
                  prof.profile_positions[0].title.toLocaleLowerCase().trim() ==
                    jobtitle.toLocaleLowerCase().trim()
                );
              });
            if (getCurrentCompanyPosition.length > 0) {
              count = count + 1;
              responseDetail.profiles.push(profileDetail.data);
            } else {
              break;
            }
          }
          }
        })
      );
    } else {
      return { success: false, data: "company not found" };
    }

    return { success: true, data: responseDetail };
  }
};

module.exports = { prospectController };
