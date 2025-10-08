require("dotenv").config();
const express = require("express");
const { handler } = require("./controller");
const runCronJob = require("./controller/lib/quiz_utils/quizCron");

const PORT = process.env.PORT || 4040;
const app = express();
app.use(express.json());

app.post("*", async (req, res) => {
  if (process.env.ENV === "DEV") {
    console.log(req.body);
  }
  res.send(await handler(req, "POST"));
});

app.get("/api/check-quizzes", async (req, res) => {
  try {
    const secret = req.query.secret;
    if (secret !== process.env.CRON_SECRET) {
      return res.status(403).send("Forbidden");
    }

    const result = await runCronJob();
    res.json(result);
  } catch (err) {
    console.error("Cron route error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
