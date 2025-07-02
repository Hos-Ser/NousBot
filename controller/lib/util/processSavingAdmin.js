const { uploadProcessedData } = require("../firebase");

const processSavingAdmin = async (messageText) => {
  const [meh, anotherMeh, atSign] = messageText.split(" ");
  if (atSign.includes("@")) {
    const username = atSign.substring(1);
    await uploadProcessedData(
      {
        username: username,
      },
      "admin_username"
    );
  } else {
    throw new Error("@ nadare koskhol");
  }
};

module.exports = processSavingAdmin;
