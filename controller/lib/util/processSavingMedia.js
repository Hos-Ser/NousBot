const { uploadProcessedData } = require("../firebase");
/**
 *
 * @param {"video"|"photo"|"text"} mediaType
 * @param {string} fileId
 * @param {string} caption
 * @param {"wuwa_gp"|"genshin_gp"|"honkai_gp"} gpName
 * @returns
 */
const processSavingMedia = async (
  mediaType,
  fileId,
  caption = "",
  uniqueId,
  uniqueAlt,
  gpName
) => {
  await uploadProcessedData(
    {
      media_type: mediaType,
      file_id: fileId,
      caption,
      unique_alt: uniqueAlt,
      unique_id: uniqueId,
    },
    gpName
  );

  return;
};

module.exports = processSavingMedia;
