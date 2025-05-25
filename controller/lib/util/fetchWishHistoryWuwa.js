const axios = require("axios");

async function fetchWishHistoryWuwa(authParams) {
  const API_ENDPOINT = "https://gmserver-api.aki-game2.net/gacha/record/query";

  // Prepare the POST payload
  const payload = {
    record_id: authParams.record_id,
    resources_id: authParams.resources_id,
    player_id: authParams.player_id,
    svr_id: authParams.svr_id,
    gacha_id: authParams.gacha_id,
    gacha_type: authParams.gacha_type,
    lang: authParams.lang || "en",
    page: 1,
    size: 20, // Default page size
  };

  // Configure headers (critical for success)
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Origin: "https://wutheringwaves.com",
    Referer: "https://wutheringwaves.com/",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  };

  try {
    console.log("[DEBUG] Making POST request to:", API_ENDPOINT);
    const response = await axios.post(API_ENDPOINT, payload, {
      headers,
      timeout: 10000,
    });

    console.log("[DEBUG] Response status:", response.status);

    // Handle API-level errors
    if (response.data?.code !== 0) {
      throw new Error(
        response.data?.message || "API returned non-zero status code"
      );
    }

    return response.data?.data?.list || [];
  } catch (error) {
    console.error("[ERROR] fetchWishHistoryWuwa failed:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // User-friendly error messages
    if (error.response?.status === 401) {
      throw new Error("Authentication expired - generate a new import link");
    } else if (error.response?.status === 404) {
      throw new Error("API endpoint not found - service may be down");
    } else {
      throw new Error(`Failed to fetch wishes: ${error.message}`);
    }
  }
}
module.exports = fetchWishHistoryWuwa;
