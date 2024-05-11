const startKb = {
  text: "خوش اومدی! درباره کدوم بازی میخوای بدونی؟",
  reply_markup: JSON.stringify({
    keyboard: [
      [{ text: "⋆˚₊⋆Genshin Impact๑⋆˚₊⊹" }],
      [{ text: "༶⋆˙⊹｡Honkai Starrail✯ ˛˚" }],
      [{ text: "˚⋆˙✧⋆Wuthering Waves˚ ⋆·˚" }],
      [{ text: "⁉ Other BS" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
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
        [{ text: `${gameIcon} بنر` }, { text: `${gameIcon} ابیس و متا` }],
        [{ text: `${gameIcon} بیلد کرکتر` }, { text: `${gameIcon} ریدیم کد` }],
        [{ text: "𓇻 منوی اصلی" }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    }),
  };
};

const wannaHelpKb = {
  text: "بازی که میخوای توش به بقیه کمک کنی رو انتخاب کن",
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "⚝ Genshin Impact", callback_data: "help genshin" }],
      [{ text: "✯ Honkai Starrail", callback_data: "help honkai" }],
      [{ text: "✧ Wuthering Waves", callback_data: "help wuwa" }],
      [{ text: "❌ Close", callback_data: "close" }],
    ],
  }),
};
const subToNewsKb = {
  text: "بازی که میخوای اخبارشو بگیری انتخاب کن",
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "⚝ Genshin Impact", callback_data: "news genshin" }],
      [{ text: "✯ Honkai Starrail", callback_data: "news honkai" }],
      [{ text: "✧ Wuthering Waves", callback_data: "news wuwa" }],
      [{ text: "❌ Close", callback_data: "close" }],
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
 * @param {"genshin"|"wuwa"|"honkai"} game
 * @returns keyboard object with specified game
 */
const gamesOptionKbFunction = (game) => {
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "Redeem Code", callback_data: `${game} primo` }],
        [{ text: "Story", callback_data: `${game} story` }],
        [{ text: "Build", callback_data: `${game} build` }],
        [{ text: "Guide", callback_data: `${game} guide` }],
        [{ text: "Abyss", callback_data: `${game} abyss` }],
        [{ text: "Banner", callback_data: `${game} banner` }],
        [{ text: "↩ Menu", callback_data: "menu" }],
      ],
    }),
  };
};
const otherPanelKb = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "Save Helper Uid", callback_data: "other uid" }],
      [{ text: "↩ Menu", callback_data: "menu" }],
    ],
  }),
};

const contentKbFunction = (text, arrayOfkeyboards) => {
  return {
    text,
    reply_markup: JSON.stringify({
      inline_keyboard: arrayOfkeyboards.map((kb) => [
        { text: kb[0], url: kb[1] },
      ]),
    }),
  };
};

module.exports = {
  startKb,
  gameMenuKbFunction,
  wannaHelpKb,
  mainPanelKb,
  subToNewsKb,
  gamesOptionKbFunction,
  contentKbFunction,
};
