const NodeCache = require("node-cache");
const { getAxiosInstance } = require("./axios");
const {
  getPrimoCode,
  getMyChatId,
  deleteSavedChatId,
  getAdminList,
  getContentList,
  getHelperList,
  getSavedChatId,
  deleteContent,
  getAllMedia,
  getEventList,
  getEvent,
  deleteMedia,
  getGachaHistory,
  checkAndResetExpiredEvents,
  createContest,
  getContests,
  getContestOptions,
  addOption,
  deleteOption,
  voteOption,
  getQuizSubject,
  handleQuizStart,
  handleQuizAnswer,
  sendQuizDetails,
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
  deleteSelectionKbFunction,
  pityCounterkb,
  gachaHistorySaveKb,
  joinChannelsKb,
  savedGachaSwitchKb,
  contestsKbFunction,
  contestOptionKbFunction,
  optionDeleteKbFunction,
  voterContestKbFunction,
  voterOptionKbFunction,
  questionKb,
  quizApprovalKbFunction,
} = require("./util/keyboardOptions");
const processPrimoCode = require("./util/processPrimoCode");
const processSavingAdmin = require("./util/processSavingAdmin");
const processSavingChatId = require("./util/processSavingChatId");
const processSavingContent = require("./util/processSavingContent");
const processSavingHelperUser = require("./util/processSavingHelperUser");
const processSavingMedia = require("./util/processSavingMedia");
const processSavingEvent = require("./util/processSavingEvent");
const processSavingPeriodicEvent = require("./util/processSavingPeriodicEvent");
const extractAuthParams = require("./pity_counter_utlls/extractAuthParams");
const getAllGachaRecords = require("./pity_counter_utlls/getAllGachaRecords");
const generateSummary = require("./pity_counter_utlls/generateSummary");
const processSavingGachaHistory = require("./util/processSavingGachaHistory");
const STRINGS = require("./util/StringLiterals");
const processSavingQuestion = require("./quiz_utils/processSavingQuestion");

const MY_TOKEN = process.env.TG_BOT_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${MY_TOKEN}`;
const axiosInstance = getAxiosInstance(BASE_URL);

// caches
const sessions = {};
const wuwaCache = new NodeCache();
const genshinCache = new NodeCache();
const honkaiCache = new NodeCache();
const gachaHistoryCache = new NodeCache();
const quizSubjectCache = new NodeCache();

function isEnglish(input) {
  const englishRegex = /^[A-Za-z\s]+$/;
  return englishRegex.test(input);
}

function splitTextByDiceToObject(text) {
  // Split the text into lines
  const lines = text.split("\n");

  // Remove the first line (summary line)
  if (lines.length > 0) {
    lines.shift();
  }

  // Join the remaining lines back into a single string
  const filteredText = lines.join("\n");

  // Split the text by the dice emoji "🎲"
  const parts = filteredText.split(/(?=🎲)/g);

  // Create the result object
  const result = {};

  parts.forEach((part) => {
    if (part.trim() === "") return;

    // Extract the first line (title line)
    const firstNewLine = part.indexOf("\n");
    const firstLine =
      firstNewLine === -1
        ? part.trim()
        : part.substring(0, firstNewLine).trim();

    // Remove the dice emoji from the key
    const key = firstLine.replace("🎲", "").trim();

    // The value is the entire part
    result[key] = part.trim();
  });

  return result;
}
async function createPityResult(userUid) {
  if (!gachaHistoryCache.has(userUid)) {
    try {
      const gachaHistory = await getGachaHistory(userUid);
      if (gachaHistory.length === 0) return [];

      gachaHistoryCache.set(
        gachaHistory[0].user_uid,
        gachaHistory[0].gacha_data
      );
    } catch (error) {
      errorHandler(error);
    }
  }

  const cacheData = gachaHistoryCache.get(userUid);
  return Object.entries(cacheData).map(([key, value], index) => ({
    type: "article",
    id: `${userUid}_${index}`,
    title: key,
    input_message_content: {
      message_text: String(value),
    },
  }));
}
async function createQuizResult() {
  if (quizSubjectCache.keys().length === 0) {
    const subjects = await getQuizSubject();
    if (subjects.length === 0) return [];
    subjects.forEach((value, index) => {
      quizSubjectCache.set(value, index);
    });
  }
  return quizSubjectCache.keys().map((subj, idx) => ({
    type: "article",
    id: `${idx}`,
    title: subj,
    input_message_content: {
      message_text: `📚 کوییز *${subj}*!\nهروقت آماده بودین روی شروع بزن`,
      parse_mode: "Markdown",
    },
    reply_markup: {
      inline_keyboard: [[{ text: "شروع", callback_data: `start:${subj}` }]],
    },
  }));
}

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
const renewCache = async (cache, gpName) => {
  cache.flushAll();
  const allMediaArray = await getAllMedia(gpName);
  allMediaArray.forEach((obj) => {
    cache.set(obj.unique_alt, {
      file_id: obj.file_id,
      caption: obj.caption,
      media_type: obj.media_type,
    });
    cache.set(obj.unique_id, {
      file_id: obj.file_id,
      caption: obj.caption,
      media_type: obj.media_type,
    });
  });
  return;
};

async function sendLongMessage(chatId, messageText, isParseMode = false) {
  const MAX_MESSAGE_LENGTH = 4096;
  if (messageText.length <= MAX_MESSAGE_LENGTH) {
    await sendMessage(chatId, messageText, isParseMode);
  } else {
    const chunks = [];
    let offset = 0;

    while (offset < messageText.length) {
      let chunkEnd = offset + MAX_MESSAGE_LENGTH;

      if (chunkEnd < messageText.length && messageText[chunkEnd] !== "\n") {
        const lastNewline = messageText.lastIndexOf("\n", chunkEnd - 1);
        if (lastNewline > offset) {
          chunkEnd = lastNewline;
        }
      }

      chunks.push(messageText.slice(offset, chunkEnd));
      offset = chunkEnd;
    }

    for (const chunk of chunks) {
      await sendMessage(chatId, chunk, isParseMode);
    }
  }
}

// axios things
async function sendMessage(chatId, messageText, isParseMode = false) {
  return axiosInstance
    .post("sendMessage", {
      chat_id: chatId,
      text: messageText,
      ...(isParseMode && { parse_mode: "Markdown" }),
    })
    .catch((ex) => {
      errorHandler(ex, "sendMessage", "axios");
    });
}
async function sendReply(
  chatId,
  replyToMessageId,
  messageText,
  isParseMode = false
) {
  return axiosInstance
    .post("sendMessage", {
      chat_id: chatId,
      text: messageText,
      reply_to_message_id: replyToMessageId,
      ...(isParseMode && { parse_mode: "Markdown" }),
    })
    .catch((ex) => {
      errorHandler(ex, "sendMessage", "axios");
    });
}
async function sendPhoto(chatId, photoUrl, caption = "", replyToMessageId) {
  return axiosInstance
    .post("sendPhoto", {
      chat_id: chatId,
      photo: photoUrl,
      caption,
      reply_to_message_id: replyToMessageId,
    })
    .catch((ex) => {
      errorHandler(ex, "sendPhoto", "axios");
    });
}
async function sendVideo(chatId, videoUrl, caption = "", replyToMessageId) {
  return axiosInstance
    .post("sendVideo", {
      chat_id: chatId,
      video: videoUrl,
      caption,
      reply_to_message_id: replyToMessageId,
    })
    .catch((ex) => {
      errorHandler(ex, "sendVideo", "axios");
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
async function answerCallbackQuery(cbqId, text) {
  const payload = {
    callback_query_id: cbqId,
  };
  if (text) payload.text = text;

  return axiosInstance.post("answerCallbackQuery", payload).catch((ex) => {
    errorHandler(ex, "sendKeyboard", "axios");
  });
}
async function sendKeyboardMarkdown(chatId, keyboardOptions) {
  return axiosInstance
    .post("sendMessage", {
      chat_id: chatId,
      parse_mode: "Markdown",
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
async function answerInlineQuery(inlineQueryId, results) {
  if (!results) {
    return axiosInstance
      .post("answerInlineQuery", {
        inline_query_id: inlineQueryId,
        results: [],
        cache_time: 0,
        switch_pm_text: "📝 ارسال سوال به بات",
        switch_pm_parameter: "x",
      })
      .catch((ex) => {
        errorHandler(ex, "answerInlineQuery", "axios");
      });
  }
  return axiosInstance
    .post("answerInlineQuery", {
      inline_query_id: inlineQueryId,
      results: JSON.stringify(results),
      cache_time: 0,
      switch_pm_text: "📝 ارسال سوال به بات",
      switch_pm_parameter: "x",
    })
    .catch((ex) => {
      errorHandler(ex, "answerInlineQuery", "axios");
    });
}
async function isUserInChannel(userId, channelUsername) {
  try {
    const res = await axiosInstance.get("getChatMember", {
      chat_id: channelUsername,
      user_id: userId,
    });

    const status = res.data.result.status;
    return ["creator", "administrator", "member"].includes(status);
  } catch (error) {
    errorHandler(error, "getMembership", "axios");
  }
}
// const handleGpMessages = async (gpName, cache) => {

// };
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
    return;
  }
};
/**
 *
 * @param {*} chatId
 * @param {"genshin"|"wuwa"|"honkai"} gameType
 * @param {"story"|"build"|"abyss"|"guide"|"banner"} contentType
 */
const handleContents = async (chatId, gameType, contentType, enteredText) => {
  const contentKbList = await getContentList(gameType, contentType);
  if (contentKbList.length !== 0) {
    const emotesArray = [
      "(⌒▽⌒)☆",
      "(＠＾◡＾)",
      "(─‿‿─)",
      "<(￣︶￣)>",
      "ヽ(*⌒▽⌒*)ﾉ",
      "(╯✧▽✧)╯",
    ];
    await sendKeyboard(
      chatId,
      contentKbFunction(
        `${enteredText.substring(1)} ها ${
          emotesArray[Math.floor(Math.random() * emotesArray.length)]
        }`,
        contentKbList
      )
    );
  } else {
    throw new Error("محتوایی برای این بخش وجود نداره :'(");
  }
};
const handleEvents = async (gpName) => {
  await checkAndResetExpiredEvents(gpName);
  const eventList = await getEventList(gpName);
  if (eventList.length === 0) {
    throw new Error("Timeline Is Empty!");
  }
  let finalMessage = "تایم لاین ایونت ها ⏳\n";
  eventList.forEach((val) => {
    const currentDate = new Date();
    const days = parseInt(
      (val.expire_at.toDate().getTime() - currentDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const hours = parseInt(
      (val.expire_at.toDate().getTime() - currentDate.getTime()) /
        (1000 * 60 * 60)
    );
    if (val.explanation) {
      finalMessage += `\n 📌 [${
        val.event_name
      }](https://t.me/NousTheBot?start=${val.link_param}) --- D:${days} H:${
        hours - days * 24
      }`;
    } else {
      finalMessage += `\n 📌 ${val.event_name} --- D:${days} H:${
        hours - days * 24
      }`;
    }
  });
  throw new Error(finalMessage);
};
const handleGpMessages = async (
  gpCache,
  gpName,
  messageText,
  messageObj,
  messageId,
  chatId
) => {
  if (gpCache.keys().length === 0) {
    await renewCache(gpCache, gpName);
  }
  if (
    messageObj.from.username === "emoedgy" ||
    messageObj.from.username === "Mahdi_official"
  ) {
    if (messageText.toLowerCase().startsWith("event")) {
      try {
        await processSavingEvent(messageText, gpName);
        await sendReply(chatId, messageId, "ok");
        return;
      } catch (error) {
        await sendReply(chatId, messageId, error.message);
      }
    }
    if (messageText.toLowerCase().startsWith("prd")) {
      try {
        await processSavingPeriodicEvent(messageText, gpName);
        await sendReply(chatId, messageId, "ok");
        return;
      } catch (error) {
        await sendReply(chatId, messageId, error.message);
      }
    }
    if (messageText.toLowerCase() === "recache") {
      await renewCache(gpCache, gpName);
      await sendReply(chatId, messageId, "ok");
      return;
    }
    if (messageText.toLowerCase() === "content list") {
      let finalMessage = "";
      let i = 1;
      gpCache.keys().forEach((val) => (finalMessage += `${i++}. \`${val}\`\n`));
      await sendLongMessage(chatId, finalMessage, true);
      return;
    }
    if (messageText.toLowerCase().startsWith("add")) {
      if (!messageObj.reply_to_message) {
        await sendReply(chatId, messageId, "No Reply");
        return;
      }
      const uniqText = messageText.toLowerCase().substring(3).trim();
      if (uniqText === "") return;
      let uniqEng = "";
      let uniqPer = "";
      if (uniqText.includes("\n")) {
        uniqEng = uniqText.substring(0, uniqText.indexOf("\n")).trim();
        uniqPer = uniqText.substring(uniqText.indexOf("\n") + 1).trim();
      } else {
        uniqEng = uniqText;
      }

      if (gpCache.has(uniqEng) || (uniqPer && gpCache.has(uniqPer))) {
        await sendReply(chatId, messageId, "تکراریه");
      } else {
        let mediaType = "";
        let fileId = "";
        let caption = "";
        if (messageObj.reply_to_message.text) {
          mediaType = "text";
          fileId = messageObj.reply_to_message.text;
        } else if (messageObj.reply_to_message.photo) {
          mediaType = "photo";
          fileId =
            messageObj.reply_to_message.photo[
              messageObj.reply_to_message.photo.length - 1
            ].file_id;
          caption = messageObj.reply_to_message.caption
            ? messageObj.reply_to_message.caption
            : "";
        } else if (messageObj.reply_to_message.video) {
          mediaType = "video";
          fileId = messageObj.reply_to_message.video.file_id;
          caption = messageObj.reply_to_message.caption
            ? messageObj.reply_to_message.caption
            : "";
        } else return;
        await processSavingMedia(
          mediaType,
          fileId,
          caption,
          uniqEng,
          uniqPer,
          gpName
        );
        gpCache.set(uniqEng, {
          file_id: fileId,
          caption: caption,
          media_type: mediaType,
        });
        gpCache.set(uniqPer, {
          file_id: fileId,
          caption: caption,
          media_type: mediaType,
        });
        await sendReply(chatId, messageId, "Okie Dokie!");
      }
      return;
    }
    if (messageText.toLowerCase().startsWith("delete")) {
      const uniqueId = messageText.toLowerCase().substring(6).trim();
      if (!isEnglish(uniqueId)) {
        await sendReply(chatId, messageId, "Input is not in English");
        return;
      }
      if (gpCache.has(uniqueId)) {
        await deleteMedia(gpName, uniqueId);
        await renewCache(gpCache, gpName);
        await sendReply(chatId, messageId, "Done");
        return;
      }
      await sendReply(chatId, messageId, "Content not found");
      return;
    }
    if (messageText.toLowerCase().startsWith("reply")) {
      let replyText = messageText.substring(5).trim();
      let replyId = messageObj.reply_to_message.message_id;
      await sendReply(chatId, replyId, replyText);
    }
  }
  if (
    messageText.toLowerCase() === "events" ||
    messageText.toLowerCase() === "timeline" ||
    messageText.toLowerCase() === "ایونت" ||
    messageText.toLowerCase() === "بنر" ||
    messageText.toLowerCase() === "banner"
  ) {
    try {
      await handleEvents(gpName);
    } catch (error) {
      await sendReply(chatId, messageId, error.message, true);
    }
    return;
  }
  if (gpCache.has(messageText.toLowerCase()) && messageText) {
    const { caption, file_id, media_type } = gpCache.get(
      messageText.toLowerCase()
    );
    if (media_type === "video") {
      await sendVideo(chatId, file_id, caption, messageId);
    } else if (media_type === "photo") {
      await sendPhoto(chatId, file_id, caption, messageId);
    } else if (media_type === "text") {
      await sendReply(chatId, messageId, file_id);
    }
  }
  return;
};
async function checkUserInChannels(userId) {
  const REQUIRED_CHANNELS = [
    "@IRImpact",
    "@IRStarRail",
    "@IRWutheringWaves",
    "@IRHonakaiImpact",
    "@IRZenless",
  ];
  for (const channel of REQUIRED_CHANNELS) {
    const isMember = await isUserInChannel(userId, channel);
    if (!isMember) {
      return false;
    }
  }
  return true;
}
function formatVotersInline(option) {
  if (!option.voters || option.voters.length === 0) {
    return "هیچ رأیی ثبت نشده ❌";
  }

  return option.voters.map((u) => `@${u}`).join(", ");
}

// handling messages
async function handleMessage(messageObj) {
  const messageText = messageObj.text || "";
  const chatId = messageObj.chat.id;
  const messageId = messageObj.message_id;
  const chatUsername = messageObj.chat.username;
  const userId = messageObj.from.id;
  if (messageObj.chat.type === "private") {
    try {
      // trolling that mf
      if (chatUsername === "killgis") {
        await sendMessage(7757763011, `From: @${chatUsername}\n${messageText}`);
        return;
      }
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
                `@${chatUsername} wants to help:\n${gameType} ${server}\n${messageText}`
              )
            );
            await sendMessage(chatId, "یوزرت بعد از تایید ادمین اضافه میشه");
          } catch (error) {
            await sendMessage(chatId, "یه مشکلی پیش اومده یبار دیگه امتحان کن");
          }
          return;
        } else if (sessions[chatId].includes("quiz")) {
          const [subject, _] = sessions[chatId].split(" ");
          deleteSession(chatId);
          const myChatId = await getMyChatId();
          await sendKeyboard(
            myChatId,
            quizApprovalKbFunction(
              `${messageText}\n${subject}\n${messageObj.from.first_name}`
            )
          );
        } else if (sessions[chatId].includes("genshinpity")) {
          deleteSession(chatId);
          return;
        } else if (sessions[chatId].includes("wuwapity")) {
          deleteSession(chatId);
          if (
            !messageText.startsWith(
              "https://aki-gm-resources-oversea.aki-game.net"
            )
          ) {
            await sendMessage(chatId, "ورودی اشتباهه!");
            return;
          }
          await sendMessage(chatId, "درحال پردازش لطفا صبر کنید...");
          // Extract auth params
          const authParams = extractAuthParams(messageText);
          const records = await getAllGachaRecords(authParams);
          if (!records || Object.keys(records).length === 0) {
            await sendMessage(
              chatId,
              "❌ No gacha records found or the URL has expired."
            );
            return;
          }

          const summary = generateSummary(records);
          await sendKeyboardMarkdown(chatId, gachaHistorySaveKb(summary));
          return;
        } else if (sessions[chatId].includes("contest")) {
          deleteSession(chatId);
          if (isEnglish(messageText)) {
            await createContest(messageText);
            await sendMessage(chatId, "Done");
            return;
          } else {
            await sendMessage(chatId, "Only English names are accepted");
            return;
          }
        } else {
          const [gameType, contentType] = sessions[chatId].split(" ");
          deleteSession(chatId);
          try {
            if (contentType === "primo") {
              await processPrimoCode(messageText, gameType);
              await sendMessage(chatId, "done");
              const subedChatIdList = await getSavedChatId("news", gameType);
              if (subedChatIdList.length !== 0) {
                await Promise.all(
                  subedChatIdList.map(async (subedCI) => {
                    await sendMessage(
                      subedCI,
                      `ریدیم کد جدید داریم ${gameType.toUpperCase()}`
                    );
                  })
                );
              }
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
          case "pity":
            await sendKeyboard(chatId, pityCounterkb);
            return;
          case "subtonews":
            await sendKeyboard(chatId, subToNewsKb);
            return;
          case "unsubtonews":
            try {
              //FIXME
              const err = await deleteSavedChatId(chatId);
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
              "❜❜ این ربات هر اطلاعاتی درباره گیم‌های\n⌗ Genshin Impact - ⌗ Honkai Starrail - ⌗ Wuthering Waves\nرو لازم داشته باشید در اختیارتون میزاره~ ❛❛\n❨ @IRCelesteTeam ❩\n\nنظرات و پیشنهاداتت رو میتونی به این آیدی بفرستی @emoedgy"
            );
            return;
          default:
            if (command.startsWith("start view_")) {
              const quizId = command.split("view_")[1];
              const ans = await sendQuizDetails(quizId);
              await sendMessage(chatId, ans, true);
              return;
            }

            if (command.startsWith("start")) {
              const linkParam = command.substring(5).trim();
              const theEvent = await getEvent(linkParam);
              await sendMessage(
                chatId,
                `${theEvent.event_name}:\n - ${theEvent.explanation}`
              );
            }
            return;
        }
      }
      // hadnling my commands
      if (
        chatUsername === "emoedgy" ||
        chatUsername === "MirrorOfBadSoul" ||
        chatUsername === "Kevinarges_Editor"
      ) {
        if (messageText.toLowerCase() === "admin" || messageText === "ادمین") {
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
          return;
        } else if (messageText === "vote") {
          try {
            const contestList = await getContests();
            await sendKeyboard(chatId, contestsKbFunction(contestList));
          } catch (error) {
            await sendMessage(chatId, error);
          }
        } else if (
          messageText.toLowerCase().startsWith("add admin") ||
          messageText.toLowerCase().startsWith("set admin")
        ) {
          try {
            await processSavingAdmin(messageText);
            await sendMessage(chatId, "done");
            return;
          } catch (error) {
            await sendMessage(chatId, error.message);
          }
          return;
        }
      }
      // text handling:
      switch (messageText) {
        case "⁉ سوالاتو بفرست ⁉":
          await sendKeyboard(chatId, questionKb);
          return;
        case "°˖✧مسابقات✧˖°":
          if (await checkUserInChannels(userId, chatId)) {
            const contests = await getContests();
            if (contests.length === 0) {
              await sendMessage(chatId, "فعلا مسابقه ای نداریم :(");
              return;
            }
            await sendKeyboard(chatId, voterContestKbFunction(contests));
          } else {
            await sendKeyboard(chatId, joinChannelsKb);
          }
          return;
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
            await handleContents(chatId, "genshin", "guide", messageText);
          } catch (error) {
            await sendMessage(chatId, error.message);
          }
          return;
        case "✯ آموزش":
          try {
            await handleContents(chatId, "honkai", "guide", messageText);
          } catch (error) {
            await sendMessage(chatId, error.message);
          }
          return;
        case "✧ آموزش":
          try {
            await sendMessage(
              chatId,
              "برای آموزش های بیشتر حتما به گروه سر بزن بخش اصلی محتوا و بیلد ها اونجا قرار داره: @IRWutheringWaves"
            );
            await handleContents(chatId, "wuwa", "guide", messageText);
          } catch (error) {
            await sendMessage(chatId, error.message);
          }
          return;
        case "⚝ داستان":
          try {
            await handleContents(chatId, "genshin", "story", messageText);
          } catch (error) {
            await sendMessage(chatId, error.message);
          }
          return;
        case "✯ داستان":
          try {
            await handleContents(chatId, "honkai", "story", messageText);
          } catch (error) {
            await sendMessage(chatId, error.message);
          }
          return;
        case "✧ داستان":
          try {
            await handleContents(chatId, "wuwa", "story", messageText);
          } catch (error) {
            await sendMessage(chatId, error.message);
          }
          return;
        case "⚝ بنر":
          try {
            await handleContents(chatId, "genshin", "banner", messageText);
          } catch (error) {
            await sendMessage(chatId, error.message);
          }
          return;
        case "✯ بنر":
          try {
            await handleContents(chatId, "honkai", "banner", messageText);
          } catch (error) {
            await sendMessage(chatId, error.message);
          }
          return;
        case "✧ بنر":
          try {
            await sendMessage(
              chatId,
              "برای طلاعات بیشتر و بررسی از تایمر ایونت ها وبنر ها برو داخل گروه و کلمه بنر رو بنویس: @IRWutheringWaves"
            );
            await handleContents(chatId, "wuwa", "banner", messageText);
          } catch (error) {
            await sendMessage(chatId, error.message);
          }
          return;
        case "⚝ اند گیم":
          try {
            await handleContents(chatId, "genshin", "abyss", messageText);
          } catch (error) {
            await sendMessage(chatId, error.message);
          }
          return;
        case "✯ اند گیم":
          try {
            await handleContents(chatId, "honkai", "abyss", messageText);
          } catch (error) {
            await sendMessage(chatId, error.message);
          }
          return;
        case "✧ اند گیم":
          try {
            await handleContents(chatId, "wuwa", "abyss", messageText);
          } catch (error) {
            await sendMessage(chatId, error.message);
          }
          return;
        case "⚝ بیلد کرکتر":
          try {
            await handleContents(chatId, "genshin", "build", messageText);
          } catch (error) {
            await sendMessage(chatId, error.message);
          }
          return;
        case "✯ بیلد کرکتر":
          try {
            await handleContents(chatId, "honkai", "build", messageText);
          } catch (error) {
            await sendMessage(chatId, error.message);
          }
          return;
        case "✧ بیلد کرکتر":
          try {
            await sendMessage(
              chatId,
              "برای آموزش های بیشتر حتما به گروه سر بزن بخش اصلی محتوا و بیلد ها اونجا قرار داره: @IRWutheringWaves"
            );
            await handleContents(chatId, "wuwa", "build", messageText);
          } catch (error) {
            await sendMessage(chatId, error.message);
          }
          return;
        case "𓇻 منوی اصلی":
          await sendKeyboard(chatId, startKb);
          return;
        case "❓ Wuthering Waves":
          await sendMessage(chatId, STRINGS.questionStruction);
          addSession(chatId, "WutheringWaves quiz");
          return;
        case "❓ Genshin Impact":
          await sendMessage(chatId, STRINGS.questionStruction);
          addSession(chatId, "GenshinImpact quiz");
          return;
        case "❓ Other Games":
          await sendMessage(chatId, STRINGS.questionStruction);
          addSession(chatId, "OtherGames quiz");
          return;
        default:
          return;
      }
    } catch (error) {
      errorHandler(error, "handleMessage");
      return;
    }
  } else if (messageObj.chat.type === "supergroup") {
    let gpName = "";
    switch (chatUsername) {
      case "WutheringWavesGP":
        gpName = "wuwa_gp";
        break;
      case "wuwagp":
        gpName = "wuwa_gp";
        break;
      case "IRImpactGp":
        gpName = "genshin_gp";
        break;
      case "genimpgp":
        gpName = "genshin_gp";
        break;
      case "StarRailGP":
        gpName = "honkai_gp";
        break;
      default:
        return;
    }
    try {
      switch (gpName) {
        case "wuwa_gp":
          await handleGpMessages(
            wuwaCache,
            gpName,
            messageText,
            messageObj,
            messageId,
            chatId
          );
          break;
        case "genshin_gp":
          await handleGpMessages(
            genshinCache,
            gpName,
            messageText,
            messageObj,
            messageId,
            chatId
          );
          break;
        case "honkai_gp":
          await handleGpMessages(
            honkaiCache,
            gpName,
            messageText,
            messageObj,
            messageId,
            chatId
          );
          break;
        default:
          break;
      }
    } catch (error) {
      errorHandler(error, "handleMessage");
    }
    return;
  }
}
// handling inline keyboards
async function handleCallbackQuery(cbqObj) {
  var messageText = "";
  var chatId = 0;
  var messageId = 0;
  if (cbqObj.message) {
    messageText = cbqObj.message.text;
    chatId = cbqObj.message.chat.id;
    messageId = cbqObj.message.message_id;
  }
  const cbqId = cbqObj.id;
  const cbqData = cbqObj.data;
  const userUID = cbqObj.from.id;
  const userUname = cbqObj.from.username;
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
    if (cbqData === "approve") {
      await processSavingQuestion(messageText);
      await updateMessage(chatId, messageId, `${messageText}\n✅ Approved`);
      await answerCallbackQuery(cbqId);
      return;
    }
    if (cbqData === "deny") {
      await updateMessage(chatId, messageId, `${messageText}\n❌ Denied`);
      await answerCallbackQuery(cbqId);
      return;
    }
    if (cbqData.startsWith("start:")) {
      await handleQuizStart(cbqObj);
    }
    if (cbqData.startsWith("ans:")) {
      await handleQuizAnswer(cbqObj);
    }
    if (cbqData === "genshinpity") {
      //FIXME fix this after implenting genshin datas
      await sendMessage(chatId, "هنوز کامل نشده");
      // await sendMessage(chatId, STRINGS.genshinPityIns, true);
      // addSession(chatId, "genshinpity");
      await answerCallbackQuery(cbqId);
      return;
    }
    if (cbqData === "wuwapity") {
      await sendMessage(chatId, STRINGS.pityInstruction, true);
      addSession(chatId, "wuwapity");
      await answerCallbackQuery(cbqId);
      return;
    }
    if (cbqData === "save_gacha") {
      const gachas = splitTextByDiceToObject(messageText);
      if (gachaHistoryCache.has(userUID)) {
        gachaHistoryCache.del(userUID);
        gachaHistoryCache.set(userUID, gachas);
        await processSavingGachaHistory(userUID, gachas);
        await updateMessage(chatId, messageId, messageText);
        await sendMessage(chatId, "بروزرسانی شد.");
      } else {
        gachaHistoryCache.set(userUID, gachas);
        await processSavingGachaHistory(userUID, gachas);
        await updateMessage(chatId, messageId, messageText);
        await sendKeyboard(chatId, savedGachaSwitchKb);
      }
      await answerCallbackQuery(cbqId);
      return;
    }
    if (cbqData.startsWith("contest|")) {
      const contestId = cbqData.split("|")[1];

      if (contestId === "new") {
        await sendMessage(chatId, "What would be the name of contest?");
        addSession(chatId, "contest");
        await answerCallbackQuery(cbqId);
        return;
      }
      const options = await getContestOptions(contestId);
      await updateMessage(
        chatId,
        messageId,
        "",
        contestOptionKbFunction(options, contestId)
      );
      await answerCallbackQuery(cbqId);
      return;
    }
    if (cbqData.startsWith("option|")) {
      const [_, contestId, optionId] = cbqData.split("|");

      if (optionId === "new") {
        await addOption(contestId);

        const options = await getContestOptions(contestId);
        await updateInlineKeyboard(
          chatId,
          messageId,
          contestOptionKbFunction(options, contestId)
        );
        await answerCallbackQuery(cbqId, "Added");
        return;
      }
      const options = await getContestOptions(contestId);
      const option = options.find((o) => o.id === optionId);
      await updateMessage(
        chatId,
        messageId,
        `${option.index}. ${option.votesCount}❤\n${formatVotersInline(
          option
        )} \nWanna Delete?!?!`,
        optionDeleteKbFunction(contestId, optionId)
      );

      await answerCallbackQuery(cbqId);
      return;
    }
    if (cbqData.startsWith("deleteOption|")) {
      const [_, contestId, optionId] = cbqData.split("|");

      await deleteOption(contestId, optionId);
      const options = await getContestOptions(contestId);
      await updateMessage(
        chatId,
        messageId,
        "",
        contestOptionKbFunction(options, contestId)
      );
      await answerCallbackQuery(cbqId, "Option deleted ✅");
    }
    if (cbqData.startsWith("voterCon|")) {
      const [_, contestId, contestName] = cbqData.split("|");
      const options = await getContestOptions(contestId);
      await updateMessage(
        chatId,
        messageId,
        "",
        voterOptionKbFunction(options, contestId, contestName)
      );
      await answerCallbackQuery(cbqId);
      return;
    }
    if (cbqData.startsWith("voter|")) {
      const [_, contestId, optionId] = cbqData.split("|");
      await voteOption(contestId, optionId, userUname ?? userUID)
        .then(() => {
          return answerCallbackQuery(cbqId, "ثبت شد");
        })
        .catch((err) => {
          return answerCallbackQuery(cbqId, err.message);
        });
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
            await sendMessage(
              chatId,
              `send ${cbqData} codes in this format:\nCode DaysTillExpiration\ne.g.:\ncodeX 7\ncodeZ 12`
            );
          } else if (cbqData.includes("delete")) {
            const [gameType, meh] = cbqData.split(" ");
            await updateMessage(
              chatId,
              messageId,
              "which content?",
              gamesOptionKbFunction(gameType)
            );
            return;
          } else {
            await sendMessage(
              chatId,
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
            "حالا برام UID و رنک اکانتت رو بفرست"
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
    if (messageText === "which content?") {
      switch (cbqData) {
        case "menu":
          updateMessage(chatId, messageId, "پنل ادمین", mainPanelKb);
          return;
        default:
          if (cbqData.includes("delete") || cbqData.includes("primo")) {
            return;
          } else {
            const [gameType, contentType] = cbqData.split(" ");
            const listOfContens = await getContentList(gameType, contentType);
            await updateMessage(
              chatId,
              messageId,
              "select content to delete",
              deleteSelectionKbFunction(cbqData, listOfContens)
            );
          }
          return;
      }
    }
    if (messageText === "select content to delete") {
      const [gameType, contentType, postUrl] = cbqData.split(" ");
      await deleteContent(gameType, contentType, postUrl);
      await updateMessage(chatId, messageId, "Done!");
    }

    return;
  } catch (error) {
    errorHandler(error, "handleCallbackQuery");
  }
}
// handling channel messages
async function handleChannelPost(postObj) {
  let messageText;
  if (postObj.text) {
    messageText = postObj.text;
  }
  if (postObj.caption) {
    messageText = postObj.caption;
  }
  try {
  } catch (error) {
    errorHandler(error, "handleChannelPost");
  }
}
// handling inline queries
async function handleInlineQuery(inlineObj) {
  const queryId = inlineObj.id;
  const userUID = inlineObj.from.id;
  try {
    const pityResult = await createPityResult(userUID);
    const subjectsResult = await createQuizResult();

    await answerInlineQuery(queryId, [...pityResult, ...subjectsResult]);
    return;
  } catch (error) {
    errorHandler(error, "handleInlineQuery", "");
  }
}
module.exports = {
  handleMessage,
  handleCallbackQuery,
  handleChannelPost,
  handleInlineQuery,
};
