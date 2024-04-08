const TeachableMachine = require("@sashido/teachablemachine-node");
const sharp = require("sharp");
const axios = require("axios");
const fs = require("fs");
const os = require("os");
const path = require("path");

const model = new TeachableMachine({
  modelUrl: "https://teachablemachine.withgoogle.com/models/7MJwqCYb5/",
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
  const webpUrl = img;
  const outputFolderName = "images"; // Specify the output folder name here
  return convertWebPtoJPG(webpUrl, outputFolderName).then((outputFilePath) => {
    if (outputFilePath) {
      console.log("Converted image path:", outputFilePath);
      return model
        .classify({
          imageUrl: "http://164.90.146.161:3002/image/converted_image.jpg",
        })
        .then((predictions) => {
          return predictions;
          console.log("predictions",predictions);
          let unFurnished=false;
          if(predictions[0]?.class=="Unfurnished" && predictions[0].score>0.7){
            unFurnished=true;
          }
          return {unFurnished:unFurnished,message:`Image is ${unFurnished?'not':''} furnished`};
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
