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
const genshinKb = {
  text: "کدوم قسمت",
  reply_markup: JSON.stringify({
    keyboard: [
      [{ text: "⚝ Story" }, { text: "⚝ Characters Builds" }],
      [{ text: "⚝ Redeem Codes" }, { text: "⚝ از کجا شروع کنم؟" }],
      [{ text: "𓇻 منوی اصلی" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  }),
};
const honkaiKb = {
  text: "کدوم قسمت",
  reply_markup: JSON.stringify({
    keyboard: [
      [{ text: "✯ Story" }, { text: "✯ Characters Builds" }],
      [{ text: "✯ Redeem Codes" }, { text: "✯ از کجا شروع کنم؟" }],
      [{ text: "𓇻 منوی اصلی" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  }),
};
const wutheringKb = {
  text: "کدوم قسمت",
  reply_markup: JSON.stringify({
    keyboard: [
      [{ text: "✧ Story" }, { text: "✧ Characters Builds" }],
      [{ text: "✧ Redeem Codes" }, { text: "✧ از کجا شروع کنم؟" }],
      [{ text: "𓇻 منوی اصلی" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
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

module.exports = {
  startKb,
  genshinKb,
  honkaiKb,
  wutheringKb,
  mainPanelKb,
  gamesOptionKbFunction,
};
