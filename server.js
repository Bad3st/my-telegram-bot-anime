const express = require("express");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Бот работает 24/7 на Render! 🚀");
});

app.listen(PORT, () => {
  console.log(`🌍 Сервер для Render запущен на порту ${PORT}`);
});
