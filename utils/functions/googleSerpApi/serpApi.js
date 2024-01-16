const axios = require("axios");

module.exports = async function (query) {
  const resultsPerPage = 10;
  const pageNumber = 1;

  const apiUrl = `https://serpapi.com/search.json?q=${query}&num=${resultsPerPage}&start=${
    (pageNumber - 1) * resultsPerPage
  }&api_key=${process.env.GOOGLE_SERP_API}`;

  return await axios
    .get(apiUrl)
    .then((response) => {
      const searchResults = response.data;
      return searchResults;
    })
    .catch((error) => {
      return error;
    });
};
