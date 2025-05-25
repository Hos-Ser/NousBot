// services/gachaService.js
const axios = require("axios");

const API_ENDPOINT = "https://gmserver-api.aki-game2.net/gacha/record/query";
const REQUEST_TIMEOUT = 15000; // 15 seconds
const RETRY_DELAY = 300; // 300ms between banner requests
const MAX_RETRIES = 3;

const defaultHeaders = {
  "Content-Type": "application/json",
  Origin: "https://wuwatracker.com",
  Referer: "https://wuwatracker.com/",
};

async function queryGachaRecords(authParams, gachaType, gachaId, retries = 0) {
  try {
    const payload = {
      ...authParams,
      gacha_type: gachaType,
      gacha_id: gachaId,
    };

    const response = await axios.post(API_ENDPOINT, payload, {
      headers: defaultHeaders,
      timeout: REQUEST_TIMEOUT,
    });

    if (!response.data || !response.data.data) {
      throw new Error("Empty response from API");
    }

    return response.data.data;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.log(
        `Retrying (${
          retries + 1
        }/${MAX_RETRIES}) for gacha_type ${gachaType}, gacha_id ${gachaId}`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000 * (retries + 1))); // Exponential backoff
      return queryGachaRecords(authParams, gachaType, gachaId, retries + 1);
    }
    console.error(
      `Failed after ${MAX_RETRIES} retries for gacha_type ${gachaType}, gacha_id ${gachaId}:`,
      error.message
    );
    return null;
  }
}

async function getAllGachaRecords(authParams) {
  // Define the banners to query
  const banners = [
    { type: 1, id: 1 }, // Character banner 1
    { type: 1, id: 2 }, // Character banner 2
    { type: 2, id: 11 }, // Weapon banner
    { type: 3, id: 1 }, // Standard banner
    { type: 4, id: 1 }, // Beginner banner
  ];

  const results = {};

  for (const banner of banners) {
    const records = await queryGachaRecords(authParams, banner.type, banner.id);
    if (records) {
      results[`${banner.type}_${banner.id}`] = records;
    }
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
  }

  return results;
}

module.exports = getAllGachaRecords;
