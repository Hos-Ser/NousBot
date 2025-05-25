const axios = require("axios");

async function fetchWishHistoryWuwa(authParams) {
  try {
    // Validate required parameters
    if (!authParams?.record_id || !authParams?.resources_id) {
      throw new Error("Missing required authentication parameters");
    }

    // Current working API endpoint (as of July 2024)
    const apiUrl =
      "https://api-aki-gm-records.wutheringwaves.com/aki/gacha/api/records";

    const response = await axios.get(apiUrl, {
      params: {
        record_id: authParams.record_id,
        resources_id: authParams.resources_id,
        player_id: authParams.player_id,
        svr_id: authParams.svr_id,
        gacha_id: authParams.gacha_id,
        gacha_type: authParams.gacha_type,
        lang: authParams.lang || "en",
        page: 1,
        size: 20,
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://wutheringwaves.com/",
        Origin: "https://wutheringwaves.com",
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 10000,
    });

    if (response.data?.code !== 0) {
      throw new Error(response.data?.message || "API returned error status");
    }

    return response.data?.data?.list || [];
  } catch (error) {
    console.error("Fetch Error:", {
      message: error.message,
      response: error.response?.data,
      config: {
        url: error.config?.url,
        params: error.config?.params,
      },
    });
    throw new Error(`Failed to fetch wishes: ${error.message}`);
  }
}
module.exports = fetchWishHistoryWuwa;
