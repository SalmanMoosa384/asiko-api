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
    const titleA = a.position_groups[0].profile_positions[0].title.toLowerCase();
    const titleB = b.position_groups[0].profile_positions[0].title.toLowerCase();

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

module.exports = {
  extractIdFromUrl: extractIdFromUrl,
  iScrapperLimit: iScrapperLimit,
  iScraperOffset: iScraperOffset,
  sortByTitle: sortByTitle,
};
