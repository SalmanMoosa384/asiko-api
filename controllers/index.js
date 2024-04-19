const { prospectController } = require("./prospectController");

const { rowsController } = require("./rowsController");

const { getLinkedinUrl } = require("./linkedinController");

const { checkUnFurnishedImage,mergedImages } = require("./imageClassification");

module.exports = {
  prospectController,
  rowsController,
  getLinkedinUrl,
  checkUnFurnishedImage,
  mergedImages
};
