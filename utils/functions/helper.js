const extractCompanyIdFromUrl = (url) => {
  const urlParts = url.split("/");
  const filteredParts = urlParts.filter((part) => part.trim() !== "");
  const companyId = filteredParts[filteredParts.length - 1];
  return companyId;
};

const iScrapperLimit = (
  value,
  defaultValue = 10,
  lowerLimit = 10,
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

    const includesTitleA = titleA.includes(title);
    const includesTitleB = titleB.includes(title);

    if (includesTitleA && !includesTitleB) {
      return -1; // Move profile A up
    } else if (!includesTitleA && includesTitleB) {
      return 1; // Move profile B up
    } else {
      return 0; // Maintain order for profiles with and without the specified title
    }
  });
};

module.exports = {
  extractCompanyIdFromUrl: extractCompanyIdFromUrl,
  iScrapperLimit: iScrapperLimit,
  iScraperOffset: iScraperOffset,
  sortByTitle: sortByTitle,
};
