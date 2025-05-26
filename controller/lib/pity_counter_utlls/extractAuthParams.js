// utils/authExtractor.js
const extractAuthParams = (url) => {
  try {
    const urlObj = new URL(url);

    // Get the part after # and then split parameters
    const hashParts = urlObj.hash.split("?");
    if (hashParts.length < 2) {
      throw new Error("No parameters in hash fragment");
    }

    const params = new URLSearchParams(hashParts[1]);

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
