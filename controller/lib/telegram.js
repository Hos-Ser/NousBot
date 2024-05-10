const { getAxiosInstance } = require("./axios");
const {
  getPrimoCode,
  getMyChatId,
  removeSavedChatId,
  getAdminList,
} = require("./firebase");
const { errorHandler } = require("./helper");
const {
  genshinKb,
  startKb,
  honkaiKb,
  wutheringKb,
  mainPanelKb,
  gamesOptionKbFunction,
} = require("./util/keyboardOptions");
const processPrimoCode = require("./util/processPrimoCode");
const { processSavingAdmin } = require("./util/processSavingAdmin");
const processSavingChatId = require("./util/processSavingChatId");
const processSavingContent = require("./util/processSavingContent");

const MY_TOKEN = process.env.TG_BOT_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${MY_TOKEN}`;
const axiosInstance = getAxiosInstance(BASE_URL);
let waitingForAdmin = "";
const sessions = {};

//sesson management
const addSession = (chatId, valueString) => {
  sessions[chatId] = valueString;
};
const deleteSession = (chatId) => {
  delete sessions[chatId];
};
const mustWaitForUser = (chatId) => {
  return sessions.hasOwnProperty(chatId);
};

// axios things
async function sendMessage(chatId, messageText, isParseMode = false) {
  return axiosInstance
    .post("sendMessage", {
      chat_id: chatId || MY_GROUP_CHAT_ID,
      text: messageText,
      ...(isParseMode && { parse_mode: "Markdown" }),
    })
    .catch((ex) => {
      errorHandler(ex, "sendMessage", "axios");
    });
}
async function updateMessage(chatId, messageId, newText) {
  return axiosInstance
    .post("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text: newText,
    })
    .catch((ex) => {
      errorHandler(ex, "updateMessage", "axios");
    });
}
async function deleteMessage(chatId, messageId) {
  return axiosInstance
    .post("deleteMessage", {
      chat_id: chatId,
      message_id: messageId,
    })
    .catch((ex) => {
      errorHandler(ex, "deleteMessage", "axios");
    });
}
async function sendKeyboard(chatId, keyboardOptions) {
  return axiosInstance
    .post("sendMessage", {
      chat_id: chatId,
      ...keyboardOptions,
    })
    .catch((ex) => {
      errorHandler(ex, "sendKeyboard", "axios");
    });
}
async function updateInlineKeyboard(chatId, messageId, newKeyboard) {
  return axiosInstance
    .post("editMessageReplyMarkup", {
      chat_id: chatId,
      message_id: messageId,
      ...newKeyboard,
    })
    .catch((ex) => {
      errorHandler(ex, "updateInlineKeyboard", "axios");
    });
}
/**
 *
 * @param {"genshin"|"honkai"|"wuthering"} game
 */
const handlePrimoCode = async (chatId, game) => {
  const redeemCodes = await getPrimoCode(game);
  if (redeemCodes === 0) {
    await sendMessage(chatId, "همه کدا پوسیدن!");
    return;
  } else {
    let finalMessage = "کد های در دسترس";
    redeemCodes.forEach((val) => (finalMessage += `\n\`${val}\``));
    await sendMessage(chatId, finalMessage, true);
    return;
  }
};
const handleSendingPhoto = async (chatId, photoUrl, caption = "") => {
  return axiosInstance
    .post("sendPhoto", {
      chat_id: chatId,
      photo: photoUrl,
      caption,
    })
    .catch((ex) => {
      errorHandler(ex, "sendingPhoto", "axios");
    });
};

// handling bot PM
async function handleMessage(messageObj) {
  const messageText = messageObj.text || "";
  const chatId = messageObj.chat.id;
  try {
    // waiting for session handling
    if (mustWaitForUser(chatId)) {
      if (sessions[chatId] === "user") {
        deleteSession(chatId);
        try {
          const myChatId = await getMyChatId();
          await sendMessage(myChatId, messageText);
          await sendMessage(chatId, "تامام");
          return;
        } catch (error) {
          await sendMessage(chatId, "یه مشکلی پیش اومده یبار دیگه امتحان کن");
        }
      } else {
        const [gameType, contentType] = sessions[chatId].split(" ");
        deleteSession(chatId);
        try {
          await processSavingContent(messageText, gameType, contentType);
          return;
        } catch (error) {
          sendMessage(chatId, error.message);
        }
      }
      return;
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
            await processSavingChatId(
              chatId,
              "news",
              messageObj.from.first_name
            );
            await sendMessage(chatId, "okie dokie!");
          } catch (error) {
            await sendMessage(chatId, error.message);
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
          addSession(chatId, "user");
          await sendMessage(
            chatId,
            "حالا برام uid، اسم بازی، رنک اکانتت و سرورت رو بنویس. یادت باشه اگه این اطلاعات رو کامل ننویسی آیدیت تو بات ثبت نمیشه\n اگه چیز دیگه ای هست که باید بدونم بنویس"
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
    // if (
    //   !messageObj.media_group_id &&
    //   messageObj.caption &&
    //   messageObj.photo &&
    //   messageObj.photo.length
    // ) {
    //   try {
    //     await processSavingPhoto(messageObj);
    //     await sendMessage(chatId, "شد");
    //   } catch (error) {
    //     await sendMessage(chatId, "نشد دابش");
    //   }
    // }
    // admin tasks handling
    // if (messageText === "admin" || messageText === "ادمین") {
    //   try {
    //     const adminArray = await getAdminList();
    //     console.log(adminArray);
    //     if (adminArray.includes(messageObj.from.username)) {
    //       await sendKeyboard(chatId, mainPanelKb);
    //     }
    //     return;
    //   } catch (error) {
    //     errorHandler(error, "error occured in admin task");
    //   }
    // }
    // if (
    //   ["mentalissuesexe", "killgis"].includes(messageObj.from.username) &&
    //   messageText.toLowerCase().includes("primo")
    // ) {
    //   try {
    //     await processPrimoCode(messageText);
    //     await sendMessage(chatId, "شد");
    //     return;
    //   } catch (error) {
    //     await sendMessage(chatId, error.message);
    //   }
    // }
    // hadnling my commands
    if (messageObj.from.username === "mentalissuesexe") {
      if (messageText === "admin" || messageText === "ادمین") {
        await sendKeyboard(chatId, mainPanelKb);
      }
      if (messageText === "save me") {
        try {
          await processSavingChatId(chatId, "self", messageObj.from.first_name);
          await sendMessage(chatId, "done");
          return;
        } catch (error) {
          await sendMessage(chatId, error.message);
        }
      } else if (
        messageText.toLowerCase().includes("add admin") ||
        messageText.toLowerCase().includes("set admin")
      ) {
        try {
          await processSavingAdmin(messageText);
          await sendMessage(chatId, "done");
          return;
        } catch (error) {
          await sendMessage(chatId, error.message);
        }
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
// handling bot inline keyboards
async function handleCallbackQuery(cbqObj) {
  const messageText = cbqObj.message.text;
  const chatId = cbqObj.message.chat.id;
  const messageId = cbqObj.message.message_id;
  const cbqData = cbqObj.data;
  try {
    if (messageText === "پنل ادمین") {
      switch (cbqData) {
        case "wuwa":
          await updateInlineKeyboard(
            chatId,
            messageId,
            gamesOptionKbFunction(cbqData)
          );
          return;
        case "genshin":
          await updateInlineKeyboard(
            chatId,
            messageId,
            gamesOptionKbFunction(cbqData)
          );
          return;
        case "honkai":
          await updateInlineKeyboard(
            chatId,
            messageId,
            gamesOptionKbFunction(cbqData)
          );
          return;
        case "menu":
          await updateInlineKeyboard(chatId, messageId, mainPanelKb);
          return;
        case "other":
          await sendMessage(chatId, "هیچ");
          return;

        default:
          if (cbqData.includes("primo")) {
            await updateMessage(
              chatId,
              messageId,
              `send ${cbqData} codes in this format:\nCode DaysTillExpiration\ne.g.:\ncodeX 7\ncodeZ 12`
            );
          } else {
            await updateMessage(
              chatId,
              messageId,
              `send ${cbqData} in this format:\nTitle Of Content You're Sending\nPost's Link`
            );
          }
          addSession(chatId, cbqData);
          return;
      }
    }

    if (cbqData === "close") await deleteMessage(chatId, messageId);
  } catch (error) {
    errorHandler(error, "handleCallbackQuery");
  }
}
// handling channel messages
async function handleChannelPost(postObj) {
  const messageText = postObj.text;
  const archiveChannelChatId = -1002011760206;
  try {
    if (
      [
        "noonegonnafindthischannel",
        "IRWutheringWaves",
        "IRStarRail",
        "IRImpact",
      ].includes(postObj.chat.username)
    ) {
      const head = messageText.substring(0, messageText.indexOf("\n"));
      const meh = messageText.substring(messageText.indexOf("\n") + 1).trim();
      const title = meh.substring(0, meh.indexOf("\n"));
      let gameType = "";
      switch (postObj.chat.username) {
        case "IRWutheringWaves":
          gameType = "👆 wuthering";
          break;
        case "IRStarRail":
          gameType = "👆 honkai";
          break;
        case "IRImpact":
          gameType = "👆 genshin";
          break;
        default:
          gameType = "👆 sup channel";
          break;
      }
      if (head.includes("#𝐆𝐔𝐈𝐃𝐄") || head.includes("#𝐒𝐓𝐎𝐑𝐘")) {
        await sendMessage(
          archiveChannelChatId,
          `${title}\nhttps://t.me/${postObj.chat.username}/${postObj.message_id}`,
          true
        );
        await sendMessage(archiveChannelChatId, gameType);
      }
    }
    return;
  } catch (error) {
    errorHandler(error, "handleChannelPost");
  }
}
module.exports = { handleMessage, handleCallbackQuery, handleChannelPost };
