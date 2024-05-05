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
const inlinekeyboardTest = {
  text: "ikTest",
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        { text: "Option 1", callback_data: "option1" },
        { text: "Option 2", callback_data: "option2" },
      ],
      [{ text: "Option 3", callback_data: "option3" }],
    ],
  }),
};

module.exports = {
  startKb,
  genshinKb,
  honkaiKb,
  wutheringKb,
  inlinekeyboardTest,
};
