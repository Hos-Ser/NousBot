const {
  uploadProcessedData,
  getGachaHistory,
  updateGachaHistory,
} = require("../firebase");

const processSavingGachaHistory = async (userUid, gachas) => {
  const savedGacha = await getGachaHistory(userUid);
  if (savedGacha.length > 0) {
    await uploadProcessedData(
      {
        user_uid: userUid,
        gacha_data: gachas,
      },
      "gacha_history"
    );
  } else {
    await updateGachaHistory(userUid, gachas);
  }
  return;
};

module.exports = processSavingGachaHistory;
