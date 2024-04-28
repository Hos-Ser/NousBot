const { getAxiosInstance } = require("./axios");
const { errorHandler } = require("./helper");
const { genshinKb, startKb } = require("./util/keyboardOptions");
const processPrimoCode = require("./util/processPrimoCode");

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

// function sendPhoto(chatId, photoUrl, caption = "") {
//   return axiosInstance.post("sendPhoto", {
//     chat_id: chatId,
//     photo: photoUrl,
//     caption,
//   });
// }

function sendKeyboard(chatId, keyboardOptions) {
  return axiosInstance.post("sendMessage", {
    chat_id: chatId,
    ...keyboardOptions,
  });
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
  try {
    const chatId = messageObj.chat.id;
    // command handling:
    if (messageText.charAt(0) === "/") {
      const command = messageText.substr(1);
      switch (command) {
        case "start":
          await sendKeyboard(chatId, startKb);
          return;
        case "test":
          await sendMessage(chatId, "kermet khabid?");
          return;
        default:
          await sendMessage(chatId, "in che kososherie");
          return;
      }
    }
    // photo handling:
    // if (messageObj.photo && messageObj.photo.length !== 0) {
    //   const fileId = messageObj.photo[messageObj.photo.length - 1].file_id;
    //   const fileData = await getFile(fileId);
    //   if (fileData.data && fileData.data.result) {
    //     // const fileName = fileData.data.result.file_path;
    //     // const file_public_path = `https://api.telegram.org/file/bot${MY_TOKEN}/${fileName}`;
    //     await uploadProcessedData({ key1: "asssssss" });
    //     await sendMessage(chatId, "asdads");
    //     return "Success";
    //   }
    // }
    if (
      messageObj.from.username === "kodokou" &&
      messageText.toLowerCase().includes("primo")
    ) {
      await processPrimoCode(messageText);
    }
    // text handling:
    switch (messageText) {
      case "🥂 Genshin Impact":
        await sendKeyboard(chatId, genshinKb);
        return;
      case "💩 Honkai Star Rail":
        await sendMessage(chatId, "sry this section is under maintenance");
        return;
      case "🐐 Wuthering Waves":
        await sendMessage(chatId, "sry this section is under maintenance");
        return;
      case "⁉ Other BS":
        await sendMessage(chatId, "sry this section is under maintenance");
        return;
      case "🥂 از کجا شروع کنم؟":
        await sendMessage(chatId, "sry this section is under maintenance");
        return;
      case "♿ منوی اصلی":
        await sendKeyboard(chatId, startKb);
        return;
      default:
        break;
    }
  } catch (error) {
    errorHandler(error, "handleMessage");
  }
}
module.exports = { sendMessage, handleMessage };
