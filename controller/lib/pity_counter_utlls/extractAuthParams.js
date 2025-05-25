// utils/authExtractor.js
const extractAuthParams = (url) => {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    const requiredParams = ["record_id", "resources_id", "player_id", "svr_id"];
    const result = {};

    for (const param of requiredParams) {
      if (!params.has(param)) {
        throw new Error(`Missing required parameter: ${param}`);
      }
      result[param] = params.get(param);
    }

    return result;
  } catch (error) {
    console.error("Error extracting auth params:", error);
    return null;
  }
};

module.exports = extractAuthParams;
