const { uploadProcessedData } = require("../firebase");
/**
 *
 * @param {*} messageObj
 * @param {"story"|"build"|"abyss"|"guide"|"banner"|"build"} contentType
 */
const processSavingContent = async (messageText, gameType, contentType) => {
  const nextlineIndex = messageText.indexOf("\n");
  const title = messageText.substring(0, nextlineIndex);
  const postUrl = messageText.substring(nextlineIndex + 1);
  const urlRegex = /https:\/\/t\.me\//;
  if (urlRegex.test(postUrl)) {
    await uploadProcessedData(
      {
        title,
        post_url: postUrl,
        content_type: contentType,
      },
      gameType
    );
  } else {
    throw new Error("url nadare eshqe dadash");
  }
};

module.exports = processSavingContent;
