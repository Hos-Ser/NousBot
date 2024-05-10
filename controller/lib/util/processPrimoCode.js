const { uploadProcessedData } = require("../firebase");
const { Timestamp } = require("firebase/firestore");

const processPrimoCode = async (messageText) => {
  let gameType = "";
  if (messageText.toLowerCase().includes("genshin")) {
    gameType = "genshin";
  } else if (messageText.toLowerCase().includes("wuthering")) {
    // change this to wuwa
    gameType = "wuthering";
  } else if (messageText.toLowerCase().includes("honkai")) {
    gameType = "honkai";
  } else {
    throw new Error("اسم گیمو اشتبا زدی");
  }
  const newlineIndex = messageText.indexOf("\n");
  const primoCodes = messageText.substring(newlineIndex + 1);
  primoCodes
    .trim()
    .split("\n")
    .forEach(async (line) => {
      const [str, days] = line.split(" ");
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + parseInt(days));

      // Check if the line follows the template
      if (str && days && !isNaN(parseInt(days))) {
        await uploadProcessedData(
          {
            game_type: gameType,
            code: str,
            expire_at: Timestamp.fromDate(currentDate),
          },
          "primo_code"
        );
      }
    });
  return;
};

module.exports = processPrimoCode;
