const { uploadProcessedData } = require("../firebase");
/**
 *
 * @param {"video"|"photo"} mediaType
 * @param {string} fileId
 * @param {string} caption
 * @param {"wuwa"|"genshin"|"honkai"} gameType
 * @returns
 */
const processSavingMedia = async (
  mediaType,
  fileId,
  caption = "",
  uniqueId,
  gameType
) => {
  await uploadProcessedData(
    {
      media_type: mediaType,
      file_id: fileId,
      caption,
      unique_id: uniqueId,
    },
    `${gameType}_gp`
  );
  return;
};

module.exports = processSavingMedia;
