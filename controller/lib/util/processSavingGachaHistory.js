const { uploadProcessedData, getSavedChatId } = require("../firebase");

const processSavingGachaHistory = async (userUid, gachas) => {
  await uploadProcessedData(
    {
      user_uid: userUid,
      gacha_data: gachas,
    },
    "gacha_history"
  );
  return;
};

module.exports = processSavingGachaHistory;
