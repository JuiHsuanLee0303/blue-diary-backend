const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const logger = require("./config/logger");
const authRoutes = require("./routes/authRoutes");
const diveLogRoutes = require("./routes/diveLogRoutes");
const diveMapRoutes = require("./routes/diveMapRoutes");
const profileRoutes = require("./routes/profileRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 請求日誌中間件
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  next();
});

// API 路由
app.use("/api/auth", authRoutes);
app.use("/api/divelog", diveLogRoutes);
app.use("/api/divemap", diveMapRoutes);
app.use("/api/profile", profileRoutes);

// API 文檔路由
app.get("/docs", (req, res) => {
  res.redirect("/docs/api.html");
});

// 靜態文件
app.use("/docs", express.static(path.join(__dirname, "../public/docs")));

// 首頁
app.get("/", (req, res) => {
  res.send("Blue Diary API Server");
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Unhandled Error:", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });
  res.status(500).json({ error: "服務器內部錯誤" });
});

// 只在非 Vercel 環境中啟動服務器
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

// 導出 app 而不是 handler
module.exports = app;
