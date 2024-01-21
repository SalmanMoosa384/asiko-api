const extractIdFromUrl = (url) => {
  const urlParts = url.split("/");
  const filteredParts = urlParts.filter((part) => part.trim() !== "");
  const companyId = filteredParts[filteredParts.length - 1];
  return companyId;
};

const iScrapperLimit = (
  value,
  defaultValue = 20,
  lowerLimit = 20,
  upperLimit = 20
) => {
  if (value < lowerLimit) {
    return defaultValue;
  } else if (value > upperLimit) {
    return upperLimit;
  } else {
    return value;
  }
};

const iScraperOffset = (count, limit = 20) => {
  const defaultOffset = 0;
  if (count > limit) {
    return count - limit;
  } else {
    return defaultOffset;
  }
};

const sortByTitle = (profiles, desiredOrder) => {
  const title = desiredOrder.trim().toLowerCase();

  return profiles.sort((a, b) => {
    const titleA = a.sub_title.toLowerCase();
    const titleB = b.sub_title.toLowerCase();

    const startsWithTitleA = titleA.startsWith(title);
    const startsWithTitleB = titleB.startsWith(title);

    if (startsWithTitleA && !startsWithTitleB) {
      return -1; // Move profile A up
    } else if (!startsWithTitleA && startsWithTitleB) {
      return 1; // Move profile B up
    } else {
      return 0; // Maintain order for profiles with and without the specified title at the beginning
    }
  });
};

const companyDataDestructure = (obj, dataSource) => {
  if (dataSource == "iscrapper") {
    let companyObj = {};

    companyObj.url = obj.details.urls.li_url;
    companyObj.public_id = obj.details.universal_name;
    companyObj.linkedin_uid = obj.details.company_id;
    companyObj.company_name = obj.details.name;
    companyObj.company_type = obj.details.type;
    companyObj.company_url = obj.details.urls.company_page;
    companyObj.staff_count = obj.details.staff.total;
    companyObj.staff_count_range = obj.details.staff.range;
    companyObj.followers_count = obj.details.followers;
    companyObj.tagline = obj.details.tagline;
    companyObj.description = obj.details.description;
    companyObj.headquarter_location = obj.details.locations.headquarter;
    companyObj.locations = obj.details.locations.other;
    companyObj.industries = obj.details.industries;
    companyObj.specialities = obj.details.specialities;
    companyObj.associated_hashtags = obj.details.hashtags;
    companyObj.logo_url = obj.details.images.logo;
    companyObj.funding_data = obj.details.funding_data;
    companyObj.founded_on = obj.details.founded;
    companyObj.success=true;
    return companyObj;
  }

  return obj;
};

module.exports = {
  extractIdFromUrl: extractIdFromUrl,
  iScrapperLimit: iScrapperLimit,
  iScraperOffset: iScraperOffset,
  sortByTitle: sortByTitle,
  companyDataDestructure: companyDataDestructure,
};
