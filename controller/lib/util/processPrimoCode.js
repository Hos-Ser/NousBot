const { uploadProcessedData } = require("../firebase");
const { Timestamp } = require("firebase/firestore");

const processPrimoCode = async (primoCodes, gameType) => {
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
