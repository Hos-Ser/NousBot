const axios = require("axios");

async function fetchWishHistoryWuwa(authParams) {
  const API_URL = "https://gmserver-api.aki-game2.net/gacha/record/query";

  // Prepare payload (exactly what WUWaTracker sends)
  const payload = {
    record_id: authParams.record_id,
    resources_id: authParams.resources_id,
    player_id: authParams.player_id,
    svr_id: authParams.svr_id,
    gacha_id: authParams.gacha_id,
    gacha_type: authParams.gacha_type,
    lang: authParams.lang || "en",
    page: 1,
    size: 20,
  };

  // Critical headers from your network capture
  const headers = {
    authority: "gmserver-api.aki-game2.net",
    accept: "application/json",
    "accept-encoding": "gzip, deflate, br, zstd",
    "content-type": "application/json",
    origin: "https://wuwatracker.com",
    referer: "https://wuwatracker.com/",
    "sec-ch-ua": '"Not/A)Brand";v="99", "Opera GX";v="118", "Chromium";v="133"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 OPR/118.0.0.0",
    priority: "u=1, i",
  };

  try {
    const response = await axios.post(API_URL, payload, {
      headers,
      timeout: 10000,
    });

    // Debug log the full request/response
    console.log("Request:", {
      url: API_URL,
      headers,
      data: payload,
    });
    console.log("Response:", response.data);

    if (response.data?.code !== 0) {
      throw new Error(response.data?.message || "API error");
    }

    return response.data?.data?.list || [];
  } catch (error) {
    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    });
    throw new Error(error.response?.data?.message || error.message);
  }
}
module.exports = fetchWishHistoryWuwa;
