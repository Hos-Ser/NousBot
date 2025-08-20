const startKb = {
  text: "خوش اومدی! درباره کدوم بازی میخوای بدونی؟",
  reply_markup: JSON.stringify({
    keyboard: [
      [{ text: "°˖✧Event✧˖°" }],
      [{ text: "⋆˚₊⋆Genshin Impact๑⋆˚₊⊹" }],
      [{ text: "༶⋆˙⊹｡Honkai Starrail✯ ˛˚" }],
      [{ text: "˚⋆˙✧⋆Wuthering Waves˚ ⋆·˚" }],
      [{ text: "دنبال یکی میگردی که تو بازیت بهت کمک کنه؟" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  }),
};
const joinChannelsKb = {
  text: "برای شرکت در نظر سنجی باید تو چنلای ما جوین باشی",
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        {
          text: "📢 Join Channel",
          url: `https://t.me/somerandomchnltotestbot`,
          // TODO change this
        },
      ],
    ],
  }),
};
/**
 *
 * @param {"⚝"|"✯"|"✧"} gameIcon
 * @returns
 */
const gameMenuKbFunction = (gameIcon) => {
  return {
    text: "کدوم بخش",
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: `${gameIcon} آموزش` }, { text: `${gameIcon} داستان` }],
        [{ text: `${gameIcon} بنر` }, { text: `${gameIcon} اند گیم` }],
        [{ text: `${gameIcon} بیلد کرکتر` }, { text: `${gameIcon} ریدیم کد` }],
        [{ text: "𓇻 منوی اصلی" }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    }),
  };
};
const lookingForHelpKb = {
  text: "اینجا یه لیست از پلیرهایی که ایدیشون رو واس کمک گذاشتن هست که میتونی بگردی و به هرکدوم که دوست داری درخواست دوستی بدی داخل بازی.\nاگه توهم دوست داری آیدیت رو ثبت کنی رو این /wannahelp کلیک کن.\n تو کدوم بازی و سرور دنبال کمک میگردی:",
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "⚝ Genshin Impact", callback_data: "genshin" }],
      [{ text: "✯ Honkai Starrail", callback_data: "honkai" }],
      [{ text: "✧ Wuthering Waves", callback_data: "wuwa" }],
      [{ text: "❌ بستن لیست", callback_data: "close" }],
    ],
  }),
};
const wannaHelpKb = {
  text: "اسم بازی و سرور اکانتت رو انتخاب کن",
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "⚝ Genshin Impact", callback_data: "genshin" }],
      [{ text: "✯ Honkai Starrail", callback_data: "honkai" }],
      [{ text: "✧ Wuthering Waves", callback_data: "wuwa" }],
      [{ text: "❌ بستن لیست", callback_data: "close" }],
    ],
  }),
};
const chooseServerKbFunction = (gameType) => {
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "🌍 Europa/EU", callback_data: `${gameType} eu` }],
        [{ text: "🌎 America/NA", callback_data: `${gameType} na` }],
        [{ text: "🌏 Asia/AS", callback_data: `${gameType} as` }],
        [{ text: "↩ Back", callback_data: "back" }],
      ],
    }),
  };
};
const subToNewsKb = {
  text: "بازی که میخوای اخبارشو بگیری انتخاب کن",
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "⚝ Genshin Impact", callback_data: "news genshin" }],
      [{ text: "✯ Honkai Starrail", callback_data: "news honkai" }],
      [{ text: "✧ Wuthering Waves", callback_data: "news wuwa" }],
      [{ text: "❌ بستن لیست", callback_data: "close" }],
    ],
  }),
};

const mainPanelKb = {
  text: "پنل ادمین",
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "Genshin related Content", callback_data: "genshin" }],
      [{ text: "WuWa related Content", callback_data: "wuwa" }],
      [{ text: "Honkai related Content", callback_data: "honkai" }],
      [{ text: "Other Contents", callback_data: "other" }],
      [{ text: "❌ Close", callback_data: "close" }],
    ],
  }),
};
/**
 *
 * @param {"genshin"|"wuwa"|"honkai"} gameType
 * @returns keyboard object with specified game
 */
const gamesOptionKbFunction = (gameType) => {
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          { text: "Story", callback_data: `${gameType} story` },
          { text: "Guide", callback_data: `${gameType} guide` },
        ],
        [
          { text: "Banner", callback_data: `${gameType} banner` },
          { text: "Abyss", callback_data: `${gameType} abyss` },
        ],
        [
          { text: "Build", callback_data: `${gameType} build` },
          { text: "Redeem Code", callback_data: `${gameType} primo` },
        ],
        [{ text: "Delete Content", callback_data: `${gameType} delete` }],
        [{ text: "↩ Menu", callback_data: "menu" }],
      ],
    }),
  };
};
const otherPanelKb = {
  reply_markup: JSON.stringify({
    inline_keyboard: [[{ text: "↩ Menu", callback_data: "menu" }]],
  }),
};

const helperKbFunction = (arrayOfkeyboards) => {
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: arrayOfkeyboards.map((kb) => [
        { text: kb.description, callback_data: kb.description },
      ]),
    }),
  };
};
const contentKbFunction = (text, arrayOfkeyboards) => {
  let i = 1;
  const finalKb = arrayOfkeyboards.map((kb) => [
    { text: `${i++}. ${kb.title}`, url: kb.post_url },
  ]);
  finalKb.push([{ text: "❌ بستن لیست", callback_data: "close" }]);

  return {
    text,
    reply_markup: JSON.stringify({
      inline_keyboard: finalKb,
    }),
  };
};
const deleteSelectionKbFunction = (cbqData, arrayOfkeyboards) => {
  const finalKb = arrayOfkeyboards.map((kb) => [
    { text: kb.title, callback_data: `${cbqData} ${kb.post_url}` },
  ]);
  finalKb.push([{ text: "❌ بستن لیست", callback_data: "close" }]);

  return {
    reply_markup: JSON.stringify({
      inline_keyboard: finalKb,
    }),
  };
};
const pityCounterkb = {
  text: "کدوم بازی رو میخوای؟",
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "Genshin Impact", callback_data: "genshinpity" }],
      [{ text: "Wuthering Waves", callback_data: "wuwapity" }],
    ],
  }),
};

const gachaHistorySaveKb = (text) => {
  return {
    text,
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "دخیره اطلاعات", callback_data: "save_gacha" }],
      ],
    }),
  };
};
const adminApprovalKbFunction = (text) => {
  return {
    text,
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          { text: "✅", callback_data: "yes" },
          { text: "❌", callback_data: "no" },
        ],
      ],
    }),
  };
};
const savedGachaSwitchKb = {
  text: "ذخیره شد",
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "امتحانش کن!", switch_inline_query_current_chat: "" }],
    ],
  }),
};

const redoKb = (gameInfo) => {
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "this again?", callback_data: `${gameInfo}` }],
      ],
    }),
  };
};

const contestsKbFunction = (contests) => {
  const keyboard = contests.map((c) => [
    { text: c.name, callback_data: `contest|${c.id}` },
  ]);
  keyboard.push([{ text: "Create New Contest", callback_data: "contest|new" }]);
  return {
    text: "Vote Contest",
    reply_markup: JSON.stringify({
      inline_keyboard: keyboard,
    }),
  };
};
const contestOptionKbFunction = (options, contestId) => {
  const rows = [];
  let row = [];

  options.forEach((o, i) => {
    row.push({
      text: `${o.index} (${o.votesCount}❤)`,
      callback_data: `option|${contestId}|${o.id}`,
    });

    if (row.length === 4 || i === options.length - 1) {
      rows.push(row);
      row = [];
    }
  });

  rows.push([
    { text: "Add New Option", callback_data: `option|${contestId}|new` },
  ]);
  return {
    text: "Contest Options:",
    reply_markup: JSON.stringify({
      inline_keyboard: rows,
    }),
  };
};
const optionDeleteKbFunction = (contestId, optionId) => {
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          {
            text: "❌ Delete",
            callback_data: `deleteOption|${contestId}|${optionId}`,
          },
        ],
        [{ text: "⬅ Back", callback_data: `contest|${contestId}` }],
      ],
    }),
  };
};

const voterContestKbFunction = (contests) => {
  const keyboard = contests.map((c) => [
    { text: c.name, callback_data: `voterCon|${c.id}|${c.name}` },
  ]);
  return {
    text: "لیست مسابقات",
    reply_markup: JSON.stringify({
      inline_keyboard: keyboard,
    }),
  };
};
const voterOptionKbFunction = (options, contestId, contestName) => {
  const rows = [];
  let row = [];

  options.forEach((o, i) => {
    row.push({
      text: `${o.index}`,
      callback_data: `voter|${contestId}|${o.id}`,
    });

    if (row.length === 5 || i === options.length - 1) {
      rows.push(row);
      row = [];
    }
  });
  return {
    text: `🎉 ${contestName}`,
    reply_markup: JSON.stringify({
      inline_keyboard: rows,
    }),
  };
};

module.exports = {
  startKb,
  joinChannelsKb,
  gameMenuKbFunction,
  lookingForHelpKb,
  wannaHelpKb,
  chooseServerKbFunction,
  mainPanelKb,
  subToNewsKb,
  helperKbFunction,
  gamesOptionKbFunction,
  contentKbFunction,
  pityCounterkb,
  gachaHistorySaveKb,
  adminApprovalKbFunction,
  deleteSelectionKbFunction,
  savedGachaSwitchKb,
  redoKb,
  contestsKbFunction,
  contestOptionKbFunction,
  optionDeleteKbFunction,
  voterContestKbFunction,
  voterOptionKbFunction,
};
