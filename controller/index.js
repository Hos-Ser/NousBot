const { handleMessage, handleCallbackQuery } = require("./lib/telegram");
const { errorHandler } = require("./lib/helper");

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
    if (body && body.callback_query) {
      const cbqObj = body.callback_query;
      await handleCallbackQuery(cbqObj);
      return "Success";
    }
    // can handle edited messages this way
    // if (body && body.edited_message) {
    // }

    return "Unknown request";
  } catch (error) {
    errorHandler(error, "mainIndexHandler");
  }
}

module.exports = { handler };
