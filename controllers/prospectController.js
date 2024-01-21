const getProfile = require("../utils/functions/iscrapper/getProfile");
const peopleSearch = require("../utils/functions/iscrapper/peopleSearch");
const helpers = require("../utils/functions/helper");
const serpRequest = require("../utils/functions/brightdata/serpRequest");
const serpResponse = require("../utils/functions/brightdata/serpResponse");
const querySelect = require("../utils/functions/postgreSQL/querySelect");

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
    let companyFromCache = false;

    let companyDetail = await querySelect(
      "linkedin_companies",
      `where public_id='${reqBody.companylinkedinURL}'`
    ).then((res) => {
      if (res.success) {
        console.log("Company found from cache");
        companyFromCache = true;
        res.data[0].success = true;
        return res.data[0];
      }
    });

    if (!companyFromCache) {
      console.log("company not found");
      companyDetail = await getProfile(reqBody.companylinkedinURL, "company");
      if (companyDetail.success) {
        companyDetail = await helpers.companyDataDestructure(
          companyDetail.data,
          "iscrapper"
        );
        console.log("Company found from iscrapper");
      }
    }

    if (companyDetail.success) {
      responseDetail.companyDetail = companyDetail;
      let findDirectFromIscrapper = false;
      if (!findDirectFromIscrapper) {
        let serpQuery = `site:linkedin.com/in/ AND intitle:|${
          companyDetail.company_name
        } AND (intitle:"${reqBody.jobTitles.join('" OR intitle:"')}")`;

        let companyId = companyDetail.linkedin_uid;

        let brightdataResponseID = await serpRequest(serpQuery);
        if (brightdataResponseID.success) {
          await new Promise((resolve) => setTimeout(resolve, 7000));
          let brightDataResponse = await serpResponse(
            brightdataResponseID.responseId
          );
          console.log("brightdata", brightdataResponseID);
          if (brightDataResponse.success) {
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
                          reqBody.jobTitles.filter(
                            (k) =>
                              prof.profile_positions[0].title
                                .toLocaleLowerCase()
                                .trim()
                                .startsWith(k) &&
                              prof.date.end.month == null &&
                              prof.date.end.year == null
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

          let companyId = companyDetail.linkedin_uid;
          await new Promise((resolve) => setTimeout(resolve, 500));
          let peopleSearchData = await peopleSearch(
            companyId,
            jobtitle,
            helpers.iScrapperLimit(limit)
          );

          if (peopleSearchData.success) {
            peopleSearchData.data.results = helpers.sortByTitle(
              peopleSearchData.data.results,
              jobtitle
            );

            for (const profile of peopleSearchData.data.results) {
              if (count >= limit) {
                break;
              }

              if (!profileIds.includes(profile.profile_id)) {
                await new Promise((resolve) => setTimeout(resolve, 500));
                let profileDetail = await getProfile(
                  profile.profile_id,
                  "personal"
                );

                if (profileDetail.success) {
                  let getCurrentCompanyPosition =
                    profileDetail.data.position_groups.filter((prof) => {
                      return (
                        prof.company.id == companyId &&
                        prof.profile_positions[0].title
                          .toLocaleLowerCase()
                          .trim()
                          .startsWith(jobtitle) &&
                        prof.date.end.month == null &&
                        prof.date.end.year == null
                      );
                    });
                  if (getCurrentCompanyPosition.length > 0) {
                    console.log(
                      "scrape from iscrapper",
                      jobtitle,
                      profile.profile_id
                    );
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
      }
    } else {
      return { success: false, data: companyDetail };
    }

    return { success: true, data: responseDetail };
  }
};

module.exports = { prospectController };
