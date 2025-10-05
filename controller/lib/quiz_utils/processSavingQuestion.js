const { uploadProcessedData } = require("../firebase");

const processSavingQuestion = async (message) => {
  const lines = message.split("\n");
  const first5 = lines.slice(0, 5).join("\n");
  const line6 = lines[5];
  const line7 = lines[6];
  const line8 = lines[7];

  await uploadProcessedData(
    {
      question: first5,
      correct: line6,
      subject: line7,
      name: line8,
    },
    "quiz"
  );
  return;
};

module.exports = processSavingQuestion;
