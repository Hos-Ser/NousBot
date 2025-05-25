const URL = require("url").URL;
const URLSearchParams = require("url").URLSearchParams;

function extractAuthKeyWuwa(url) {
  try {
    // Validate URL structure
    if (!url.includes("aki-gm-resources-oversea.aki-game.net")) {
      throw new Error("Invalid Wuthering Waves URL format");
    }

    // Extract the token parameters from the URL
    const urlObj = new URL(url);
    const hashParams = new URLSearchParams(urlObj.hash.split("?")[1]);

    // Required parameters for API calls
    const requiredParams = [
      "svr_id",
      "player_id",
      "gacha_id",
      "gacha_type",
      "svr_area",
      "record_id",
      "resources_id",
    ];

    // Verify all required parameters exist
    const missingParams = requiredParams.filter(
      (param) => !hashParams.has(param)
    );
    if (missingParams.length > 0) {
      throw new Error(
        `Missing required parameters: ${missingParams.join(", ")}`
      );
    }

    // Return the complete authentication object
    return {
      svr_id: hashParams.get("svr_id"),
      player_id: hashParams.get("player_id"),
      gacha_id: hashParams.get("gacha_id"),
      gacha_type: hashParams.get("gacha_type"),
      svr_area: hashParams.get("svr_area"),
      record_id: hashParams.get("record_id"),
      resources_id: hashParams.get("resources_id"),
      lang: hashParams.get("lang") || "en",
      platform: hashParams.get("platform") || "PC",
    };
  } catch (error) {
    console.error("AuthKey Extraction Error:", error);
    throw new Error(
      `Failed to extract authentication parameters: ${error.message}`
    );
  }
}

module.exports = extractAuthKeyWuwa;
