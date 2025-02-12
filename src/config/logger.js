const winston = require("winston");

// 檢查是否在 Vercel 環境中
const isVercel = process.env.VERCEL === "1";

// 創建日誌格式
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// 配置 transports
const transports = [];

// 在非 Vercel 環境中使用文件 transport
if (!isVercel) {
  // 添加文件 transports
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    })
  );
}

// 始終添加 Console transport
transports.push(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  })
);

// 創建 logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  transports: transports,
});

module.exports = logger;
