const axios = require("axios");

// 2. Enhanced fetch function with retries
async function fetchBannerWishes(authParams, bannerConfig, attempt = 1) {
  const payload = {
    ...authParams,
    gacha_type: bannerConfig.gacha_type,
    gacha_id: bannerConfig.gacha_id,
    page: 1,
    size: 20,
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
        },
      }
    );

    if (response.data?.code !== 0) {
      throw new Error(response.data?.message || "API error");
    }

    return response.data?.data?.list || [];
  } catch (error) {
    if (attempt <= 3) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      return fetchBannerWishes(authParams, bannerConfig, attempt + 1);
    }
    console.error(
      `Failed to fetch ${bannerConfig.name} banner after 3 attempts`
    );
    return [];
  }
}

module.exports = fetchBannerWishes;
