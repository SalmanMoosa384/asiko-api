const { prospectController } = require("./prospectController");

const { rowsController } = require("./rowsController");

const { getLinkedinUrl } = require("./linkedinController");

const { checkUnFurnishedImage,mergedImages } = require("./imageClassification");
const { supabaseGetEmail } = require("./supabaseController");

module.exports = {
  prospectController,
  rowsController,
  getLinkedinUrl,
  checkUnFurnishedImage,
  mergedImages,
  supabaseGetEmail
};
