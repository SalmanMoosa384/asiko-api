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
  const orderArray = [desiredOrder.trim().toLowerCase()];

  return profiles.sort((a, b) => {
    let indexA = orderArray.indexOf(a.sub_title.toLowerCase());
    let indexB = orderArray.indexOf(b.sub_title.toLowerCase());

    if (indexA === -1) {
      indexA = Number.MAX_SAFE_INTEGER; // Move unmatched titles to the end
    }

    if (indexB === -1) {
      indexB = Number.MAX_SAFE_INTEGER; // Move unmatched titles to the end
    }

    return indexA - indexB;
  });
};

module.exports = {
  extractCompanyIdFromUrl: extractCompanyIdFromUrl,
  iScrapperLimit: iScrapperLimit,
  iScraperOffset: iScraperOffset,
  sortByTitle: sortByTitle,
};
