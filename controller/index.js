const { handleMessage } = require("./lib/telegram");
const { errorHandler } = require("./lib/helper");
const { uploadProcessedData, getTheData } = require("./lib/firebase");

async function handler(req, method) {
  try {
    if (method === "GET") {
      return "get fucked";
    }
    const { body } = req;
    if (body && body.message) {
      const messageObj = body.message;
      await handleMessage(messageObj);
      return "Success";
    }

    return "Unknown request";
  } catch (error) {
    errorHandler(error, "mainIndexHandler");
  }
}

module.exports = { handler };
