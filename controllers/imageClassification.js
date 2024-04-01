const TeachableMachine = require("@sashido/teachablemachine-node");
const sharp = require("sharp");
const axios = require("axios");
const fs = require("fs");
const os = require("os");
const path = require("path");

const model = new TeachableMachine({
  modelUrl: "https://teachablemachine.withgoogle.com/models/IiOM1HWYW/",
});

async function convertWebPtoJPG(webpUrl, outputFolderName) {
  try {
    const response = await axios.get(webpUrl, { responseType: "arraybuffer" });
    const outputFileName = "converted_image.jpg";
    const outputFolderPath = path.join(__dirname, "..", outputFolderName);
    if (!fs.existsSync(outputFolderPath)) {
      fs.mkdirSync(outputFolderPath);
    }
    const outputFilePath = path.join(outputFolderPath, outputFileName);
    await sharp(response.data).jpeg().toFile(outputFilePath);
    return outputFilePath;
  } catch (error) {
    console.error("Error converting image:", error);
    return null;
  }
}
const checkUnFurnishedImage = async (img) => {
  const webpUrl =
    "https://photos.zillowstatic.com/fp/37834c3c0a49dc00ccc2282cf0f2e3a6-cc_ft_768.webp";
  const outputFolderName = "images"; // Specify the output folder name here
  convertWebPtoJPG(webpUrl, outputFolderName).then((outputFilePath) => {
    if (outputFilePath) {
      console.log("Converted image path:", outputFilePath);
      return model
        .classify({
          imageUrl: "http://164.90.146.161:3002/image/converted_image.jpg",
        })
        .then((predictions) => {
          return predictions;
        })
        .catch((e) => {
          console.error(e);
          return e;
        });
    } else {
      console.log("Image conversion failed.");
      return "Image conversion failed";
    }
  });
};

module.exports = { checkUnFurnishedImage };
