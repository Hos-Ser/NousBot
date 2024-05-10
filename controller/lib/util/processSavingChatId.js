const { uploadProcessedData, getSavedChatId } = require("../firebase");

const processSavingChatId = async (chatId, reason, userFirstName) => {
  const savedBefore = await getSavedChatId(reason, true);
  if (!savedBefore.includes(chatId)) {
    await uploadProcessedData(
      {
        game_type: "",
        reason,
        chat_id: chatId,
        name: userFirstName,
      },
      "saved_chat_id"
    );
    return;
  } else {
    throw new Error("قبلا ثبت نام کردی");
  }
};

module.exports = processSavingChatId;
