const { uploadProcessedData } = require("../firebase");
const { Timestamp } = require("firebase/firestore");

const processSavingEvent = async (messageText, gpName) => {
  const [eventName, expireAt, ...rest] = messageText
    .substring(5)
    .trim()
    .split("\n");
  if (!eventName || !expireAt || isNaN(expireAt)) {
    return;
  }
  let explanation = "";
  if (rest.length !== 0) {
    explanation = rest.join("\n");
  }
  const linkParam = eventName.toLowerCase().split(" ").join("");
  const currentDate = new Date();
  currentDate.setDate(currentDate.getHours + parseInt(expireAt));
  await uploadProcessedData(
    {
      event_name: eventName,
      link_param: linkParam,
      explanation: explanation,
      expire_at: Timestamp.fromDate(currentDate),
      gp_name: gpName,
    },
    "timeline"
  );

  return;
};

module.exports = processSavingEvent;
