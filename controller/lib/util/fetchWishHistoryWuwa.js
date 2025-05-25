const axios = require("axios");

async function fetchWishHistoryWuwa(authParams) {
  try {
    // Validate auth parameters
    if (!authParams || typeof authParams !== "object") {
      throw new Error("Invalid authentication parameters");
    }

    // API endpoint (this might need adjustment based on actual API)
    const baseUrl =
      "https://aki-gm-resources-oversea.aki-game.net/aki/gacha/api/record";

    // Prepare request parameters
    const params = {
      svr_id: authParams.svr_id,
      player_id: authParams.player_id,
      gacha_id: authParams.gacha_id,
      gacha_type: authParams.gacha_type,
      svr_area: authParams.svr_area,
      record_id: authParams.record_id,
      resources_id: authParams.resources_id,
      lang: authParams.lang,
      platform: authParams.platform,
      page: 1,
      size: 20, // Max items per request
    };

    // Make the API request
    const response = await axios.get(baseUrl, {
      params,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://aki-gm-resources-oversea.aki-game.net/",
        Accept: "application/json",
      },
      timeout: 10000,
    });

    // Check response status
    if (response.data.code !== 0) {
      throw new Error(`API Error: ${response.data.message || "Unknown error"}`);
    }

    // Process the wish history
    const wishHistory = response.data.data?.list || [];
    return wishHistory.map((wish) => ({
      id: wish.id,
      name: wish.name,
      type: wish.item_type,
      rarity: wish.rank_type,
      time: wish.time,
      pity: wish.pity, // If available in response
    }));
  } catch (error) {
    console.error("Fetch Error:", {
      error: error.response?.data || error.message,
      params: authParams ? { ...authParams, player_id: "REDACTED" } : null,
    });

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch wish history"
    );
  }
}

module.exports = fetchWishHistoryWuwa;
