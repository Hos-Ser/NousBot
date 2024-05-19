const { uploadProcessedData } = require("../firebase");

const processSavingHelperUser = async (messageText) => {
  const usefulThing = messageText.substring(messageText.indexOf("\n") + 1);
  const head = usefulThing.substring(0, usefulThing.indexOf("\n"));
  const [gameType, server] = head.split(" ");
  const description = usefulThing.substring(usefulThing.indexOf("\n") + 1);
  if (description.length > 63) {
    description = description.substring(0, 63);
  }
  await uploadProcessedData(
    {
      game_type: gameType,
      server,
      description,
    },
    "helper_user"
  );
  return;
};

module.exports = processSavingHelperUser;
