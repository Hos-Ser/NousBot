const { uploadProcessedData, getSavedChatId } = require("../firebase");

const processSavingChatId = async (chatId, reason) => {
  const savedBefore = await getSavedChatId(reason, true);
  if (!savedBefore.includes(chatId)) {
    await uploadProcessedData(
      {
        reason,
        chat_id: chatId,
      },
      "saved_chat_id"
    );
    return;
  }
  return;
};

module.exports = processSavingChatId;
