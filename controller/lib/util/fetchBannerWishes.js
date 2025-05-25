const axios = require("axios");

// 2. Enhanced fetch function with retries
async function fetchBannerWishes(authParams, config, attempt = 1) {
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
    need_avatar: true,
    need_weapon: true,
  };

  try {
    const response = await axios.post(
      "https://gmserver-api.aki-game2.net/gacha/record/query",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Origin: "https://wuwatracker.com",
          Referer: "https://wuwatracker.com/",
          "User-Agent": "Mozilla/5.0",
        },
        timeout: 10000,
      }
    );

    console.log(
      `Query ${config.gacha_type}-${config.gacha_id}:`,
      response.data?.data?.list?.length || 0,
      "items"
    );

    return response.data?.data?.list || [];
  } catch (error) {
    if (attempt <= 3) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      return queryWishHistory(authParams, config, attempt + 1);
    }
    console.error(`Query failed after 3 attempts:`, config);
    return [];
  }
}

module.exports = fetchBannerWishes;
