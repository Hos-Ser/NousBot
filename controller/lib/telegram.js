const { getAxiosInstance } = require("./axios");
const {
  getPrimoCode,
  getMyChatId,
  removeSavedChatId,
  getAdminList,
  getContentList,
  getHelperList,
  getSavedChatId,
} = require("./firebase");
const { errorHandler } = require("./helper");
const {
  startKb,
  mainPanelKb,
  gamesOptionKbFunction,
  wannaHelpKb,
  subToNewsKb,
  contentKbFunction,
  gameMenuKbFunction,
  chooseServerKbFunction,
  adminApprovalKbFunction,
  lookingForHelpKb,
  helperKbFunction,
} = require("./util/keyboardOptions");
const processPrimoCode = require("./util/processPrimoCode");
const { processSavingAdmin } = require("./util/processSavingAdmin");
const processSavingChatId = require("./util/processSavingChatId");
const processSavingContent = require("./util/processSavingContent");
const processSavingHelperUser = require("./util/processSavingHelperUser");

const MY_TOKEN = process.env.TG_BOT_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${MY_TOKEN}`;
const axiosInstance = getAxiosInstance(BASE_URL);
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
async function updateMessage(chatId, messageId, newText, inlineKb) {
  return axiosInstance
    .post("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text: newText,
      ...inlineKb,
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
const handlePrimoCode = async (chatId, gameType) => {
  const redeemCodes = await getPrimoCode(gameType);
  if (redeemCodes.length === 0) {
    await sendMessage(chatId, "همه کدا پوسیدن!");
    return;
  } else {
    let finalMessage = "کد های در دسترس";
    redeemCodes.forEach((val) => (finalMessage += `\n\`${val}\``));
    await sendMessage(chatId, finalMessage, true);
    const subedChatIdList = await getSavedChatId("news", gameType);
    if (subedChatIdList.length !== 0) {
      await Promise.all(
        subedChatIdList.map(async (subedCI) => {
          await sendMessage(
            subedCI,
            `${gameType.toUpperCase()} ریدیم کد جدید داریم`
          );
        })
      );
    }
    return;
  }
};
/**
 *
 * @param {*} chatId
 * @param {"genshin"|"wuwa"|"honkai"} gameType
 * @param {"story"|"build"|"abyss"|"guide"|"banner"} contentType
 */
const handleContents = async (chatId, gameType, contentType) => {
  const contentKbList = await getContentList(gameType, contentType);
  if (contentKbList.length !== 0) {
    await sendKeyboard(chatId, contentKbFunction("contents:", contentKbList));
  } else {
    throw new Error("محتوایی برای این بخش وجود نداره :'(");
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
      if (sessions[chatId].includes("user")) {
        const [user, gameType, server] = sessions[chatId].split(" ");
        deleteSession(chatId);
        try {
          const myChatId = await getMyChatId();
          await sendKeyboard(
            myChatId,
            adminApprovalKbFunction(
              `@${messageObj.chat.username} wants to help:\n${gameType} ${server}\n${messageText}`
            )
          );
          await sendMessage(chatId, "یوزرت بعد از تایید ادمین اضافه میشه");
        } catch (error) {
          await sendMessage(chatId, "یه مشکلی پیش اومده یبار دیگه امتحان کن");
        }
        return;
      } else {
        const [gameType, contentType] = sessions[chatId].split(" ");
        deleteSession(chatId);
        try {
          if (contentType === "primo") {
            await processPrimoCode(messageText, gameType);
            await sendMessage(chatId, "done");
            return;
          }
          await processSavingContent(messageText, gameType, contentType);
          await sendMessage(chatId, "done");

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
          await sendKeyboard(chatId, subToNewsKb);
          return;
        case "unsubtonews":
          try {
            const err = await removeSavedChatId(chatId);
            if (err) throw new Error(err);
            await sendMessage(chatId, "باشه دیگه بهت خبر نمیدیم :(");
          } catch (error) {
            await sendMessage(chatId, error.message);
          }
          return;
        case "wannahelp":
          await sendKeyboard(chatId, wannaHelpKb);
          return;
        case "about":
          await sendMessage(
            chatId,
            "❜❜ این ربات هر اطلاعاتی درباره گیم‌های\n⌗ Genshin Impact - ⌗ Honkai Starrail - ⌗ Wuthering Waves\nرو لازم داشته باشید در اختیارتون میزاره~ ❛❛\n❨ @IRImpactTeam ❩\n\nنظرات و پیشنهاداتت رو میتونی به این آیدی بفرستی @mentalissuesexe"
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
    // hadnling my commands
    if (messageObj.from.username === "mentalissuesexe") {
      if (messageText === "admin" || messageText === "ادمین") {
        await sendKeyboard(chatId, mainPanelKb);
      }
      if (messageText === "save me") {
        try {
          await processSavingChatId(
            chatId,
            "self",
            messageObj.from.first_name,
            "me king"
          );
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
        await sendKeyboard(chatId, gameMenuKbFunction("⚝"));
        return;
      case "༶⋆˙⊹｡Honkai Starrail✯ ˛˚":
        await sendKeyboard(chatId, gameMenuKbFunction("✯"));
        return;
      case "˚⋆˙✧⋆Wuthering Waves˚ ⋆·˚":
        await sendKeyboard(chatId, gameMenuKbFunction("✧"));
        return;
      case "دنبال یکی میگردی که تو بازیت بهت کمک کنه؟":
        await sendKeyboard(chatId, lookingForHelpKb);
        return;
      case "⚝ ریدیم کد":
        await handlePrimoCode(chatId, "genshin");
        return;
      case "✯ ریدیم کد":
        await handlePrimoCode(chatId, "honkai");
        return;
      case "✧ ریدیم کد":
        await handlePrimoCode(chatId, "wuwa");
        return;
      case "⚝ آموزش":
        try {
          await handleContents(chatId, "genshin", "guide");
        } catch (error) {
          await sendMessage(chatId, error.message);
        }
        return;
      case "✯ آموزش":
        try {
          await handleContents(chatId, "honkai", "guide");
        } catch (error) {
          await sendMessage(chatId, error.message);
        }
        return;
      case "✧ آموزش":
        try {
          await handleContents(chatId, "wuwa", "guide");
        } catch (error) {
          await sendMessage(chatId, error.message);
        }
        return;
      case "⚝ داستان":
        try {
          await handleContents(chatId, "genshin", "story");
        } catch (error) {
          await sendMessage(chatId, error.message);
        }
        return;
      case "✯ داستان":
        try {
          await handleContents(chatId, "honkai", "story");
        } catch (error) {
          await sendMessage(chatId, error.message);
        }
        return;
      case "✧ داستان":
        try {
          await handleContents(chatId, "wuwa", "story");
        } catch (error) {
          await sendMessage(chatId, error.message);
        }
        return;
      case "⚝ بنر":
        try {
          await handleContents(chatId, "genshin", "banner");
        } catch (error) {
          await sendMessage(chatId, error.message);
        }
        return;
      case "✯ بنر":
        try {
          await handleContents(chatId, "honkai", "banner");
        } catch (error) {
          await sendMessage(chatId, error.message);
        }
        return;
      case "✧ بنر":
        try {
          await handleContents(chatId, "wuwa", "banner");
        } catch (error) {
          await sendMessage(chatId, error.message);
        }
        return;
      case "⚝ ابیس و متا":
        try {
          await handleContents(chatId, "genshin", "abyss");
        } catch (error) {
          await sendMessage(chatId, error.message);
        }
        return;
      case "✯ ابیس و متا":
        try {
          await handleContents(chatId, "honkai", "abyss");
        } catch (error) {
          await sendMessage(chatId, error.message);
        }
        return;
      case "✧ ابیس و متا":
        try {
          await handleContents(chatId, "wuwa", "abyss");
        } catch (error) {
          await sendMessage(chatId, error.message);
        }
        return;
      case "⚝ بیلد کرکتر":
        try {
          await handleContents(chatId, "genshin", "build");
        } catch (error) {
          await sendMessage(chatId, error.message);
        }
        return;
      case "✯ بیلد کرکتر":
        try {
          await handleContents(chatId, "honkai", "build");
        } catch (error) {
          await sendMessage(chatId, error.message);
        }
        return;
      case "✧ بیلد کرکتر":
        try {
          await handleContents(chatId, "wuwa", "build");
        } catch (error) {
          await sendMessage(chatId, error.message);
        }
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
    if (cbqData === "close") {
      await deleteMessage(chatId, messageId);
      return;
    }
    if (cbqData === "yes") {
      try {
        await processSavingHelperUser(messageText);
        await updateMessage(chatId, messageId, `${messageText}\nAPPROVED`);
      } catch (error) {
        await sendMessage(chatId, "نشد کینگ");
      }
      return;
    }
    if (cbqData === "no") {
      await updateMessage(chatId, messageId, `${messageText}\nREJECTED`);
      return;
    }
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
    if (messageText === "اسم بازی و سرور اکانتت رو انتخاب کن") {
      switch (cbqData) {
        case "genshin":
          await updateInlineKeyboard(
            chatId,
            messageId,
            chooseServerKbFunction(cbqData)
          );
          return;
        case "honkai":
          await updateInlineKeyboard(
            chatId,
            messageId,
            chooseServerKbFunction(cbqData)
          );
          return;
        case "wuwa":
          await updateInlineKeyboard(
            chatId,
            messageId,
            chooseServerKbFunction(cbqData)
          );
          return;
        case "back":
          await updateInlineKeyboard(chatId, messageId, wannaHelpKb);
          return;
        default:
          await updateMessage(
            chatId,
            messageId,
            "حالا برام UID و هر اطلاعات اضافه ای مثل رنکت یا چه ساعت های معمولا تو گیمی یا ... که میخوای رو بفرست"
          );
          addSession(chatId, `user ${cbqData}`);
          return;
      }
    }
    if (messageText.includes("/wannahelp")) {
      switch (cbqData) {
        case "genshin":
          await updateInlineKeyboard(
            chatId,
            messageId,
            chooseServerKbFunction(cbqData)
          );
          return;
        case "honkai":
          await updateInlineKeyboard(
            chatId,
            messageId,
            chooseServerKbFunction(cbqData)
          );
          return;
        case "wuwa":
          await updateInlineKeyboard(
            chatId,
            messageId,
            chooseServerKbFunction(cbqData)
          );
          return;
        case "back":
          await updateInlineKeyboard(chatId, messageId, lookingForHelpKb);
          return;
        default:
          const [gameType, server] = cbqData.split(" ");
          try {
            const helpersList = await getHelperList(gameType, server);
            if (helpersList.length !== 0) {
              await updateMessage(
                chatId,
                messageId,
                `لیست پلیر های بازی ${gameType} سرور ${server.toUpperCase()}`,
                helperKbFunction(helpersList)
              );
            } else {
              throw new Error("هنوز کسی واس این سرور نداریم :(");
            }
          } catch (error) {
            await sendMessage(chatId, error.message);
          }
          return;
      }
    }
    if (messageText.includes("لیست پلیر های بازی")) {
      await sendMessage(chatId, cbqData);
    }
    if (cbqData.includes("news")) {
      const [news, gameType] = cbqData.split(" ");
      try {
        await processSavingChatId(
          chatId,
          "news",
          cbqObj.from.first_name,
          gameType
        );
        await updateMessage(chatId, messageId, "okie dokie!");
        return;
      } catch (error) {
        await sendMessage(chatId, error.message);
      }
    }
    return;
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
          `${title}\nhttps://t.me/${postObj.chat.username}/${postObj.message_id}`
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
