const {
  handleMessage,
  handleCallbackQuery,
  handleChannelPost,
} = require("./lib/telegram");
const { errorHandler } = require("./lib/helper");

async function handler(req, method) {
  try {
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
    if (body && body.channel_post) {
      const postObj = body.channel_post;
      await handleChannelPost(postObj);
      return "Success";
    }

    return "Unknown request";
  } catch (error) {
    errorHandler(error, "mainIndexHandler");
  }
}

module.exports = { handler };
