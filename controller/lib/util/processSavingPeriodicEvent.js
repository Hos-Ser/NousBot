const { uploadProcessedData } = require("../firebase");
const { Timestamp } = require("firebase/firestore");

const processSavingPeriodicEvent = async (messageText, gpName) => {
  const [eventName, expireDay, expireHour, resetDuration, ...rest] = messageText
    .substring(5)
    .trim()
    .split("\n");
  if (
    !eventName ||
    !expireDay ||
    !expireHour ||
    !resetDuration ||
    isNaN(resetDuration) ||
    isNaN(expireDay) ||
    isNaN(expireHour)
  ) {
    throw new Error("something missing");
  }
  let explanation = "";
  if (rest.length !== 0) {
    explanation = rest.join("\n");
  }
  const linkParam = eventName.toLowerCase().split(" ").join("");
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + parseInt(expireDay));
  currentDate.setHours(currentDate.getHours() + parseInt(expireHour));
  await uploadProcessedData(
    {
      event_name: eventName,
      link_param: linkParam,
      explanation: explanation,
      expire_at: Timestamp.fromDate(currentDate),
      reset_duration: resetDuration,
      gp_name: gpName,
    },
    "timeline"
  );
  return;
};

module.exports = processSavingPeriodicEvent;
