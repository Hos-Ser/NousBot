const { getAxiosInstance } = require("./axios");
const { getPrimoCode, getMyChatId, removeSavedChatId } = require("./firebase");
const { errorHandler } = require("./helper");
const {
  genshinKb,
  startKb,
  honkaiKb,
  wutheringKb,
  inlinekeyboardTest,
} = require("./util/keyboardOptions");
const processPrimoCode = require("./util/processPrimoCode");
const processSavingChatId = require("./util/processSavingChatId");

const MY_TOKEN = process.env.TG_BOT_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${MY_TOKEN}`;
const axiosInstance = getAxiosInstance(BASE_URL);
let waitingForUser = false;

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
/**
 *
 * @param {"genshin"|"honkai"|"wuthering"} game
 */
const handlePrimoCode = async (chatId, game) => {
  const redeemCodes = await getPrimoCode(game);
  if (redeemCodes === 0) {
    sendMessage(chatId, "همه کدا پوسیدن!");
    return;
  } else {
    let finalMessage = "کد های در دسترس";
    redeemCodes.forEach((val) => (finalMessage += `\n${val}`));
    await sendMessage(chatId, finalMessage);
    return;
  }
};

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
    .catch((error) => {
      errorHandler(error, "getFile", "axios");
    });
}

async function handleMessage(messageObj) {
  const messageText = messageObj.text || "";
  try {
    const chatId = messageObj.chat.id;
    // wanna help handling
    if (waitingForUser) {
      try {
        const myCI = await getMyChatId();
        if (myCI) {
          await sendMessage(myCI, messageText);
          waitingForUser = false;
          return;
        }
        await sendMessage(chatId, "حله");
      } catch (error) {
        await sendMessage(chatId, "یه مشکلی پیش اومده یبار دیگه امتحان کن");
      }
    }
    // command handling:
    if (messageText.charAt(0) === "/") {
      const command = messageText.substr(1);
      switch (command) {
        case "start":
          await sendKeyboard(chatId, startKb);
          return;
        case "subtonews":
          try {
            await processSavingChatId(chatId, "news");
            await sendMessage(chatId, "okie dokie!");
          } catch (error) {
            await sendMessage(chatId, "نشد که بشه یه بار دیگه امتحان کن");
          }
          return;
        case "unsubtonews":
          try {
            await removeSavedChatId(chatId);
            await sendMessage(chatId, "باشه دیگه بهت خبر نمیدیم :(");
          } catch (error) {
            await sendMessage(chatId, "نشد که بشه یه بار دیگه امتحان کن");
          }
          return;
        case "wannahelp":
          sendMessage(222, 222);
          waitingForUser = true;
          await sendMessage(
            chatId,
            "حالا برام uid، اسم بازی، رنک اکانتت و سرورت رو بنویس. یادت باشه اگه این اطلاعات رو ننویسی آیدیت تو بات ثبت نمیشه\n اگه چیز دیگه ای هست که باید بدونم بنویس"
          );
          return;
        case "about":
          await sendMessage(
            chatId,
            "نظرات و پیشنهاداتتو میتونی به این آیدی ارسال کنی\n@mentalissuesexe"
          );
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
    // primo code handling
    if (
      ["mentalissuesexe", "killgis"].includes(messageObj.from.username) &&
      messageText.toLowerCase().includes("primo")
    ) {
      try {
        await processPrimoCode(messageText);
        await sendMessage(chatId, "شد");
      } catch (error) {
        await sendMessage(chatId, error.message);
      }
    }
    // saving my chat id
    if (
      messageObj.from.username === "mentalissuesexe" &&
      messageText.toLowerCase().includes("save me")
    ) {
      try {
        await processSavingChatId(chatId, "self");
        await sendMessage(chatId, "done");
      } catch (error) {
        await sendMessage(chatId, "nashod");
      }
    }
    // text handling:
    switch (messageText) {
      case "⋆˚₊⋆Genshin Impact๑⋆˚₊⊹":
        await sendKeyboard(chatId, genshinKb);
        return;
      case "༶⋆˙⊹｡Honkai Starrail✯ ˛˚":
        await sendKeyboard(chatId, honkaiKb);
        return;
      case "˚⋆˙✧⋆Wuthering Waves˚ ⋆·˚":
        await sendKeyboard(chatId, wutheringKb);
        return;
      case "⁉ Other BS":
        await sendKeyboard(chatId, inlinekeyboardTest);
        return;
      case "⚝ Redeem Codes":
        await handlePrimoCode(chatId, "genshin");
        return;
      case "✯ Redeem Codes":
        await handlePrimoCode(chatId, "honkai");
        return;
      case "✧ Redeem Codes":
        await handlePrimoCode(chatId, "wuthering");
        return;
      case "𓇻 منوی اصلی":
        await sendKeyboard(chatId, startKb);
        return;
      default:
        return;
    }
  } catch (error) {
    errorHandler(error, "handleMessage");
  }
}
module.exports = { handleMessage };
