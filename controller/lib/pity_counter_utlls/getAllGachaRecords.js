// services/gachaService.js
const axios = require("axios");

const API_ENDPOINT = "https://gmserver-api.aki-game2.net/gacha/record/query";
const REQUEST_TIMEOUT = 15000; // 15 seconds
const RETRY_DELAY = 300; // 300ms between banner requests
const MAX_RETRIES = 3;

const defaultHeaders = {
  // prettier-ignore
  "authority": "gmserver-api.aki-game2.net",
  // prettier-ignore
  "accept": "application/json",
  "accept-encoding": "gzip, deflate, br, zstd",
  "content-type": "application/json",
  // prettier-ignore
  "origin": "https://wuwatracker.com",
  // prettier-ignore
  "referer": "https://wuwatracker.com/",
  "sec-ch-ua": '"Not/A)Brand";v="99", "Opera GX";v="118", "Chromium";v="133"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 OPR/118.0.0.0",
  // prettier-ignore
  "priority": "u=1, i",
};

async function queryGachaRecords(authParams, cardPoolType) {
  const payload = {
    cardPoolType: cardPoolType, // 1-6 instead of gacha_type/gacha_id
    languageCode: "en", // Required field
    playerId: authParams.player_id,
    recordId: authParams.record_id,
    serverId: authParams.svr_id,
  };

  const response = await axios.post(API_ENDPOINT, payload, {
    headers: defaultHeaders,
    timeout: REQUEST_TIMEOUT,
  });
  return response.data?.data || [];
}

async function getAllGachaRecords(authParams) {
  const results = {};

  // Query all cardPoolTypes from 1 to 6
  for (let cardPoolType = 1; cardPoolType <= 6; cardPoolType++) {
    const records = await queryGachaRecords(authParams, cardPoolType);
    if (records.length > 0) {
      results[`pool_${cardPoolType}`] = records;
    }
    await new Promise((resolve) => setTimeout(resolve, 500)); // 300ms delay
  }

  return results;
}

module.exports = getAllGachaRecords;
