async function fetchWishHistoryWuwa(authParams) {
  console.log("[DEBUG] Starting wish history fetch", authParams); // Log input

  try {
    if (!authParams || !authParams.svr_id) {
      throw new Error("Invalid authentication parameters");
    }

    const apiUrl =
      "https://aki-gm-resources-oversea.aki-game.net/aki/gacha/api/record";

    console.log("[DEBUG] Making API request to:", apiUrl); // Track progress
    const response = await axios.get(apiUrl, {
      params: {
        ...authParams,
        page: 1,
        size: 20,
      },
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://aki-gm-resources-oversea.aki-game.net/",
      },
      timeout: 10000,
    });

    console.log("[DEBUG] API response status:", response.status); // Log response

    if (response.data?.code !== 0) {
      throw new Error(response.data?.message || "API returned error");
    }

    const wishes = response.data?.data?.list || [];
    console.log("[DEBUG] Retrieved wishes count:", wishes.length); // Log results
    return wishes;
  } catch (error) {
    console.error("[ERROR] fetchWishHistoryWuwa failed:", {
      error: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    throw new Error(`Failed to fetch wishes: ${error.message}`);
  }
}
module.exports = fetchWishHistoryWuwa;
