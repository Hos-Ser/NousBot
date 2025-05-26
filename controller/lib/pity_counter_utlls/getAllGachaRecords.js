const axios = require("axios");

const API_ENDPOINT = "https://gmserver-api.aki-game2.net/gacha/record/query";
const REQUEST_TIMEOUT = 15000;
const RETRY_DELAY = 300;

const defaultHeaders = {
  //prettier-ignore
  "authority": "gmserver-api.aki-game2.net", // ← Often required
  //prettier-ignore
  "accept": "application/json",
  "accept-encoding": "gzip, deflate, br", // ← Missing in your code
  "content-type": "application/json",
  //prettier-ignore
  "origin": "https://wuwatracker.com",
  //prettier-ignore
  "referer": "https://wuwatracker.com/",
  "sec-fetch-site": "cross-site", // ← Critical for CORS
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", // ← Must match
};

async function queryGachaRecords(authParams, cardPoolType) {
  const payload = {
    cardPoolType: cardPoolType,
    languageCode: "en",
    playerId: authParams.player_id,
    recordId: authParams.record_id,
    serverId: authParams.server_id,
  };

  try {
    const response = await axios.post(API_ENDPOINT, payload, {
      headers: defaultHeaders,
      timeout: REQUEST_TIMEOUT,
    });
    return response.data?.data || [];
  } catch (error) {
    console.error(`Error querying pool ${cardPoolType}:`, error.message);
    return [];
  }
}

async function getAllGachaRecords(authParams) {
  const results = {};

  // Query pools 1 through 6 (adjust based on your needs)
  for (let poolType = 1; poolType <= 7; poolType++) {
    results[`pool_${poolType}`] = await queryGachaRecords(authParams, poolType);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
  }

  return results;
}

module.exports = getAllGachaRecords;
