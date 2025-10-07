require("dotenv").config();
const express = require("express");
const { handler } = require("./controller");

const PORT = process.env.PORT || 4040;
const app = express();
app.use(express.json());

app.post("*", async (req, res) => {
  if (process.env.ENV === "DEV") {
    console.log(req.body);
  }
  res.send(await handler(req, "POST"));
});

app.listen(PORT, (err) => {
  // if (err) console.log(err);
  // console.log("Server listening on PORT", PORT);
});
