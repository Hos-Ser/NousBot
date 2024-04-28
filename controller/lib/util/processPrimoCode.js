const { uploadProcessedData } = require("../firebase");

const processPrimoCode = async (messageText) => {
  const newlineIndex = messageText.indexOf("\n");
  const primoCodes = messageText.substring(newlineIndex + 1);
  primoCodes
    .trim()
    .split("\n")
    .forEach(async (line) => {
      const [str, num] = line.split(" ");

      // Check if the line follows the template
      if (str && num && !isNaN(parseInt(num))) {
        await uploadProcessedData(
          { code: str, day: parseInt(num) },
          "genshin_primo_code"
        );
      }
    });
};

module.exports = processPrimoCode;
