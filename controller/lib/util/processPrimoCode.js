const { uploadProcessedData } = require("../firebase");
const { Timestamp } = require("firebase/firestore");

const processPrimoCode = async (messageText) => {
  if (messageText.toLowerCase().includes("genshin")) {
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
              game: "genshin",
              code: str,
              expire_at: Timestamp.fromDate(currentDate),
            },
            "primo_code"
          );
        }
      });
  } else if (messageText.toLowerCase().includes("wuthering")) {
    const newlineIndex = messageText.indexOf("\n");
    const primoCodes = messageText.substring(newlineIndex + 1);
    primoCodes
      .trim()
      .split("\n")
      .forEach(async (line) => {
        const [str, days] = line.split(" ");
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + parseInt(days));

        if (str && days && !isNaN(parseInt(days))) {
          await uploadProcessedData(
            {
              game: "wuthering",
              code: str,
              expire_at: Timestamp.fromDate(currentDate),
            },
            "primo_code"
          );
        }
      });
  } else if (messageText.toLowerCase().includes("honkai")) {
    const newlineIndex = messageText.indexOf("\n");
    const primoCodes = messageText.substring(newlineIndex + 1);
    primoCodes
      .trim()
      .split("\n")
      .forEach(async (line) => {
        const [str, days] = line.split(" ");
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + parseInt(days));

        if (str && days && !isNaN(parseInt(days))) {
          await uploadProcessedData(
            {
              game: "honkai",
              code: str,
              expire_at: Timestamp.fromDate(currentDate),
            },
            "primo_code"
          );
        }
      });
  } else {
    throw new Error("ندانم نشد");
  }
};

module.exports = processPrimoCode;
