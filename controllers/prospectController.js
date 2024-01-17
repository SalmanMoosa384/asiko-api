const getProfile = require("../utils/functions/iscrapper/getProfile");
const peopleSearch = require("../utils/functions/iscrapper/peopleSearch");
const helpers = require("../utils/functions/helper");
const serpRequest = require("../utils/functions/brightdata/serpRequest");
const serpResponse = require("../utils/functions/brightdata/serpResponse");

const prospectController = async function (reqBody) {
  if (reqBody?.jobTitles && reqBody?.companylinkedinURL) {
    reqBody.companylinkedinURL = helpers.extractIdFromUrl(
      reqBody.companylinkedinURL
    );
    let limit = reqBody?.limit ? reqBody.limit : 1;

    reqBody.jobTitles = reqBody.jobTitles.filter(
      (k) => k != "" && k != null && k != ""
    );
    if (!reqBody.jobTitles.length) {
      console.log({ success: false, data: "job title is missing" });
      return { success: false, data: "job title is missing" };
    }
    reqBody.jobTitles = reqBody.jobTitles.map((element) =>
      element.toLowerCase().trim()
    );

    if (limit > 20) {
      return { success: false, data: "limit allow between 1 to 20" };
    }

    let count = 0;
    let responseDetail = { profiles: [] };
    let profileIds = [];
    let searchResult;
    let companyDetail = await getProfile(reqBody.companylinkedinURL, "company");

    if (companyDetail?.data?.profile_type) {
      responseDetail.companyDetail = companyDetail.data;
      let findDirectFromIscrapper = false;
      if (!findDirectFromIscrapper) {
        let serpQuery = `site:linkedin.com/in/ AND intitle:|${
          companyDetail.data.details.name
        } AND (intitle:"${reqBody.jobTitles.join('" OR intitle:"')}")`;

        let companyId = companyDetail.data.details.company_id;

        let brightdataResponseID = await serpRequest(serpQuery);
        if (brightdataResponseID.success) {
          await new Promise((resolve) => setTimeout(resolve, 6000));
          let brightDataResponse = await serpResponse(
            brightdataResponseID.responseId
          );
          console.log("brightdata", brightdataResponseID, brightDataResponse);
          if (brightDataResponse.success) {
            console.log("brightdata success");
            if (brightDataResponse.data?.organic?.length > 0) {
              for (const profile of brightDataResponse.data.organic) {
                if (count >= limit) {
                  break;
                }
                if (
                  reqBody.jobTitles.filter((k) =>
                    profile.title
                      .split("-")[1]
                      .trim()
                      .toLowerCase()
                      .startsWith(k)
                  ).length > 0
                ) {
                  let profileLink = helpers.extractIdFromUrl(profile.link);
                  profileLink = profileLink.split("?")[0];
                  let profileDetail = await getProfile(profileLink, "personal");

                  if (profileDetail.success) {
                    let getCurrentCompanyPosition =
                      profileDetail.data.position_groups.filter((prof) => {
                        return (
                          prof.company.id == companyId &&
                          reqBody.jobTitles.filter((k) =>
                            prof.profile_positions[0].title
                              .toLocaleLowerCase()
                              .trim()
                          )
                        );
                      });
                    if (getCurrentCompanyPosition.length > 0) {
                      profileIds.push(profileLink);

                      console.log("scrape from serp", profileLink);

                      count = count + 1;
                      responseDetail.profiles.push(profileDetail.data);
                    }
                  }
                }
              }
            }
          }
        }
        findDirectFromIscrapper = true;
      }

      if (findDirectFromIscrapper) {
        for (const jobtitle of reqBody.jobTitles) {
          if (count >= limit) {
            break;
          }

          let companyId = companyDetail.data.details.company_id;
          await new Promise((resolve) => setTimeout(resolve, 300));
          let peopleSearchData = await peopleSearch(
            companyId,
            jobtitle,
            helpers.iScrapperLimit(limit)
          );
          if (peopleSearchData.data.results.length > 0) {
            console.log("iscrapper people found");
            peopleSearchData.data.results = helpers.sortByTitle(
              peopleSearchData.data.results,
              jobtitle
            );

            for (const profile of peopleSearchData.data.results) {
              if (count >= limit) {
                break;
              }

              if (!profileIds.includes(profile.profile_id)) {
                await new Promise((resolve) => setTimeout(resolve, 300));
                let profileDetail = await getProfile(
                  profile.profile_id,
                  "personal"
                );
                console.log(
                  "scrape from iscrapper",
                  jobtitle,
                  profile.profile_id
                );

                let getCurrentCompanyPosition =
                  profileDetail.data.position_groups.filter((prof) => {
                    return (
                      prof.company.id == companyId &&
                      prof.profile_positions[0].title
                        .toLocaleLowerCase()
                        .trim() == jobtitle
                    );
                  });
                if (getCurrentCompanyPosition) {
                  count = count + 1;
                  profileIds.push(profile.profile_id);
                  responseDetail.profiles.push(profileDetail.data);
                } else {
                  break;
                }
              }
            }
          }
        }
      }
    } else {
      return { success: false, data: "company not found" };
    }

    return { success: true, data: responseDetail };
  }
};

module.exports = { prospectController };
