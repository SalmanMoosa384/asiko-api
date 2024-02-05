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

const generateUUID = () => {
  let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      let r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }
  );
  return uuid;
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

const sleep=(ms) =>{
  return new Promise(resolve => setTimeout(resolve, ms));
}

const profileDataDestructure = (obj, dataSource) => {
  if (dataSource == "iscrapper") {
    let profileObj = {};
    profileObj.id = generateUUID(); // uuid
    profileObj.url = `https://linkedin.com/in/${obj.profile_id}/`;
    profileObj.public_id = obj.profile_id;
    profileObj.linkedin_uid = obj.entity_urn;
    profileObj.full_name = `${obj.first_name} ${obj.last_name}`;
    profileObj.headline = obj.sub_title;
    profileObj.summary = obj.summary;
    profileObj.image_url = obj.profile_picture;
    profileObj.location = obj.location.default;

    let employments = [];
    obj.position_groups.map((i) => {
      let employeeObject = {};
      employeeObject.role_name = i.profile_positions[0].title;
      employeeObject.company_uid = i.company.id;
      employeeObject.company_name = i.company.name;
      employeeObject.role_end_date = i.date.end.year
        ? `${i.date.end.year}-${i.date.end.month}`
        : null;
      employeeObject.role_location = i.profile_positions[0].location;
      employeeObject.role_start_date = i.date.start.year
        ? `${i.date.start.year}-${i.date.start.month}`
        : null;
      employeeObject.activeEmployment = i.date.end.year ? false : true;
      employeeObject.role_description = i.profile_positions[0].description;
      employeeObject.role_employment_type =
        i.profile_positions[0].employment_type;
      employments.push(employeeObject);
    });

    // JSON.stringify(employments)

    profileObj.employments = employments;
    profileObj.industry = obj.industry;
    profileObj.skills = obj.skills;
    profileObj.scraped_at = currentTimeForPOSTGESQL();
    profileObj.created_at = currentTimeForPOSTGESQL();
    profileObj.updated_at = currentTimeForPOSTGESQL();
    profileObj.first_name = obj.first_name;
    profileObj.last_name = obj.last_name;
    profileObj.premium = obj.premium;
    profileObj.influencer = obj.influencer;
    profileObj.first_scraped_at = currentTimeForPOSTGESQL();
    profileObj.accessible = true;

    let languages = [];
    obj.languages.profile_languages.map((k) => {
      languages.push(k.name);
    });

    profileObj.languages = languages;

    return profileObj;
  } else if (dataSource == "cache") {
    let profileObj = {};
    profileObj.id = obj.id; // uuid
    profileObj.url = obj.url;
    profileObj.public_id = obj.public_id;
    profileObj.linkedin_uid = obj.linkedin_uid;
    profileObj.full_name = obj.full_name;
    profileObj.headline = obj.headline;
    profileObj.summary = obj.summary;
    profileObj.image_url = obj.image_url;
    profileObj.location = obj.location;
    profileObj.employments = obj.employments;
    profileObj.industry = obj.industry;
    profileObj.skills = obj.skills;
    profileObj.scraped_at = obj.scraped_at;
    profileObj.created_at = obj.created_at;
    profileObj.updated_at = obj.updated_at;
    profileObj.first_name = obj.first_name;
    profileObj.last_name = obj.last_name;
    profileObj.premium = obj.premium;
    profileObj.influencer = obj.influencer;
    profileObj.first_scraped_at = obj.first_scraped_at;
    profileObj.accessible = true;
    profileObj.languages = obj.languages;
    return profileObj;
  }
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
    companyObj.success = true;
    return companyObj;
  }

  return obj;
};

const lastCountDays = (dateString, days) => {
  const inputDate = new Date(dateString);

  const currentDate = new Date();

  const timeDifference = currentDate - inputDate;

  const daysDifference = timeDifference / (1000 * 3600 * 24);

  return daysDifference <= days;
};

const currentTimeForPOSTGESQL = () => {
  const currentDate = new Date();

  const formattedDate = `${currentDate.getUTCFullYear()}-${(
    currentDate.getUTCMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${currentDate
    .getUTCDate()
    .toString()
    .padStart(2, "0")} ${currentDate
    .getUTCHours()
    .toString()
    .padStart(2, "0")}:${currentDate
    .getUTCMinutes()
    .toString()
    .padStart(2, "0")}:${currentDate
    .getUTCSeconds()
    .toString()
    .padStart(2, "0")}`;
  return formattedDate;
};

module.exports = {
  extractIdFromUrl: extractIdFromUrl,
  iScrapperLimit: iScrapperLimit,
  iScraperOffset: iScraperOffset,
  sortByTitle: sortByTitle,
  companyDataDestructure: companyDataDestructure,
  currentTimeForPOSTGESQL: currentTimeForPOSTGESQL,
  generateUUID: generateUUID,
  profileDataDestructure: profileDataDestructure,
  lastCountDays: lastCountDays,
  sleep:sleep
};
