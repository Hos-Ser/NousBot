const startKb = {
  text: "خوش اومدی! درباره کدوم بازی میخوای بدونی؟",
  reply_markup: JSON.stringify({
    keyboard: [
      [{ text: "🥂 Genshin Impact" }],
      [{ text: "💩 Honkai Star Rail" }],
      [{ text: "🐐 Wuthering Waves" }],
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
      [{ text: "🥂 Story" }, { text: "🥂 Characters Builds" }],
      [{ text: "🥂 Abyss" }, { text: "🥂 از کجا شروع کنم؟" }],
      [{ text: "♿ منوی اصلی" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  }),
};

module.exports = { startKb, genshinKb };
