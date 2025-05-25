const axios = require("axios");
const { CancelToken } = axios;

async function fetchWishHistory(authParams, config) {
  const source = CancelToken.source();

  // Set timeout (15 seconds max)
  const timeout = setTimeout(() => {
    source.cancel("Request timed out after 15 seconds");
  }, 15000);

  try {
    const payload = {
      record_id: authParams.record_id,
      resources_id: authParams.resources_id,
      player_id: authParams.player_id,
      svr_id: authParams.svr_id,
      gacha_type: config.gacha_type,
      gacha_id: config.gacha_id,
      lang: authParams.lang || "en",
      page: 1,
      size: 20,
    };

    const response = await axios.post(
      "https://gmserver-api.aki-game2.net/gacha/record/query",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Origin: "https://wuwatracker.com",
          Referer: "https://wuwatracker.com/",
        },
        cancelToken: source.token,
        timeout: 10000, // Individual request timeout
      }
    );

    clearTimeout(timeout);

    if (response.data?.code !== 0) {
      throw new Error(response.data?.message || "API returned error status");
    }

    return response.data?.data?.list || [];
  } catch (error) {
    clearTimeout(timeout);
    if (axios.isCancel(error)) {
      console.log("Request canceled:", error.message);
    } else {
      console.error("Fetch error:", error.message);
    }
    return [];
  }
}

module.exports = fetchWishHistory;
