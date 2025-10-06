const { uploadProcessedData } = require("../firebase");

const processSavingQuestion = async (message) => {
  const lines = message.split("\n");
  const remaining = lines.slice(0, -3).join("\n").trim();
  const lastThree = lines.slice(-3);

  await uploadProcessedData(
    {
      question: remaining,
      correct: lastThree[0],
      subject: lastThree[1],
      name: lastThree[2],
    },
    "questions"
  );
  return;
};

module.exports = processSavingQuestion;
