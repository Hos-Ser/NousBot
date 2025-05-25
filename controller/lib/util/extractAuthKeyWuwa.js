function extractAuthKeyWuwa(url) {
  console.log("[DEBUG] Starting URL processing:", url); // Log input

  try {
    // Basic validation
    if (!url || typeof url !== "string") {
      throw new Error("No URL provided");
    }

    console.log("[DEBUG] Creating URL object"); // Track progress
    const urlObj = new URL(url);

    // Verify it's a WuWa URL
    if (!urlObj.hostname.includes("aki-game.net")) {
      throw new Error("Invalid Wuthering Waves URL");
    }

    console.log("[DEBUG] Processing hash parameters"); // Track progress
    const hashPart = urlObj.hash.split("?")[1];
    if (!hashPart) {
      throw new Error("URL missing hash parameters");
    }

    const params = new URLSearchParams(hashPart);
    const requiredParams = [
      "svr_id",
      "player_id",
      "gacha_id",
      "record_id",
      "resources_id",
    ];

    // Validate required parameters
    const missingParams = requiredParams.filter((p) => !params.has(p));
    if (missingParams.length > 0) {
      throw new Error(`Missing parameters: ${missingParams.join(", ")}`);
    }

    const authData = {
      svr_id: params.get("svr_id"),
      player_id: params.get("player_id"),
      gacha_id: params.get("gacha_id"),
      gacha_type: params.get("gacha_type") || "1",
      record_id: params.get("record_id"),
      resources_id: params.get("resources_id"),
      lang: params.get("lang") || "en",
      platform: params.get("platform") || "PC",
    };

    console.log("[DEBUG] Extracted auth data:", authData); // Log output
    return authData;
  } catch (error) {
    console.error("[ERROR] extractAuthKeyWuwa failed:", error);
    throw new Error(`URL processing failed: ${error.message}`);
  }
}
module.exports = extractAuthKeyWuwa;
