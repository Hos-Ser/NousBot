const { getAxiosInstance } = require("./axios");
const { uploadProcessedData } = require("./firebase");
const { errorHandler } = require("./helper");

const MY_TOKEN = process.env.TG_BOT_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${MY_TOKEN}`;
const axiosInstance = getAxiosInstance(BASE_URL);

function sendMessage(chatId, messageText) {
  return axiosInstance
    .post("sendMessage", {
      chat_id: chatId || MY_GROUP_CHAT_ID,
      text: messageText,
    })
    .catch((ex) => {
      errorHandler(ex, "sendMessage", "axios");
    });
}

function sendPhoto(messageObj, photoUrl, caption = "") {
  return axiosInstance.post("sendPhoto", {
    chat_id: messageObj.chat.id,
    photo: photoUrl,
    caption,
  });
}

function sendKeyboard(chatId, text, keyboard) {
  return axiosInstance.post();
}

function getFile(fileId) {
  return axiosInstance
    .get("getFile", {
      file_id: fileId,
    })
    .catch((ex) => {
      errorHandler(ex, "getFile", "axios");
    });
}

async function handleMessage(messageObj) {
  const messageText = messageObj.text || "";
  // if (!messageText) {
  //   errorHandler("No message text", "handleMessage");
  //   // return "";
  // }
  try {
    const chatId = messageObj.chat.id;
    if (messageText.charAt(0) === "/") {
      const command = messageText.substr(1);
      switch (command) {
        case "start":
          return sendMessage(chatId, "salamp dokhtari?");
        case "test":
          return sendMessage(chatId, "kermet khabid?");
        case "gen":
          return sendPhoto(chatId, "https://source.unsplash.com/random");
        default:
          return sendMessage(chatId, "in che kososherie");
      }
    }
    if (messageObj.photo && messageObj.photo.length !== 0) {
      const fileId = messageObj.photo[messageObj.photo.length - 1].file_id;
      const fileData = await getFile(fileId);
      if (fileData.data && fileData.data.result) {
        // const fileName = fileData.data.result.file_path;
        // const file_public_path = `https://api.telegram.org/file/bot${MY_TOKEN}/${fileName}`;
        await uploadProcessedData({ key1: "asssssss" });
        sendMessage(chatId, "photo uploaded successfully");
        return "Success";
      }
    }
  } catch (error) {
    errorHandler(error, "handleMessage");
  }
}
module.exports = { sendMessage, handleMessage };
