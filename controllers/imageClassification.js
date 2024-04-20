const TeachableMachine = require("@sashido/teachablemachine-node");
const sharp = require("sharp");
const axios = require("axios");
const fs = require("fs");
const os = require("os");
const combineImage = require("combine-image");
const path = require("path");
const jimp = require("jimp");

const model = new TeachableMachine({
  modelUrl: "https://teachablemachine.withgoogle.com/models/4IT9K9w6x/",
});

const mergedImages = async (before, after) => {
  await convertWebPtoJPG(before, "images/before");
  await convertWebPtoJPG(after, "images/after");

  const response = await combineImage([
    "http://164.90.146.161:3002/images/before/converted_image.jpg",
    "http://164.90.146.161:3002/images/after/converted_image.jpg",
  ]).then(async (img) => {
    // Save image as file
    const imageName = Math.random(0, 9999) + Math.random(0, 9999);

    await jimp.loadFont(jimp.FONT_SANS_32_BLACK).then(async (font) => {
      await img.print(font, 10, img.bitmap.height - 60, "Before");
      await img.print(
        font,
        img.bitmap.width / 2 + 10,
        img.bitmap.height - 60,
        "After"
      );
    });

    img.write(`images/merged/${imageName}.png`);
    return `http://164.90.146.161:3002/images/merged/${imageName}.png`;
  });
  return response;
};
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
  const webpUrl = img;
  const outputFolderName = "images"; // Specify the output folder name here

  return model
    .classify({
      imageUrl: webpUrl,
    })
    .then((predictions) => {
      return predictions;
    })
    .catch((e) => {
      console.error(e);
      return e;
    });

  return convertWebPtoJPG(webpUrl, outputFolderName).then((outputFilePath) => {
    if (outputFilePath) {
      console.log("Converted image path:", outputFilePath);
      return model
        .classify({
          imageUrl: "http://164.90.146.161:3002/image/converted_image.jpg",
        })
        .then((predictions) => {
          return predictions;
          console.log("predictions", predictions);
          let unFurnished = false;
          if (
            predictions[0]?.class == "Unfurnished" &&
            predictions[0].score > 0.7
          ) {
            unFurnished = true;
          }
          return {
            unFurnished: unFurnished,
            message: `Image is ${unFurnished ? "not" : ""} furnished`,
          };
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

module.exports = { checkUnFurnishedImage, mergedImages };
