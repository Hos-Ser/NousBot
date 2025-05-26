const axios = require("axios");

const API_ENDPOINT = "https://gmserver-api.aki-game2.net/gacha/record/query";
const REQUEST_TIMEOUT = 15000; // 15 seconds
const RETRY_DELAY = 300; // 300ms between requests

const defaultHeaders = {
  authority: "gmserver-api.aki-game2.net",
  accept: "application/json",
  "content-type": "application/json",
  origin: "https://wuwatracker.com",
  referer: "https://wuwatracker.com/",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
};

async function queryGachaRecords(authParams, cardPoolType, retries = 0) {
  const payload = {
    cardPoolType: cardPoolType,
    languageCode: "en", // Required, matches WUWaTracker
    playerId: authParams.player_id,
    recordId: authParams.record_id,
    serverId: authParams.svr_id,
  };

  try {
    const response = await axios.post(API_ENDPOINT, payload, {
      headers: defaultHeaders,
      timeout: REQUEST_TIMEOUT,
    });

    if (!response.data?.data) {
      throw new Error("Empty data array in response");
    }
    return response.data.data;
  } catch (error) {
    if (retries < 3) {
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY * (retries + 1))
      );
      return queryGachaRecords(authParams, cardPoolType, retries + 1);
    }
    console.error(
      `Failed after 3 retries (Pool ${cardPoolType}):`,
      error.message
    );
    return [];
  }
}

async function getAllGachaRecords(authParams) {
  const results = {};

  for (let cardPoolType = 1; cardPoolType <= 6; cardPoolType++) {
    const records = await queryGachaRecords(authParams, cardPoolType);
    if (records.length > 0) {
      results[`pool_${cardPoolType}`] = records;
    }
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
  }

  return results;
}
module.exports = getAllGachaRecords;
