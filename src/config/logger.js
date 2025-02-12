const winston = require("winston");
const path = require("path");

// 定義日誌格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 創建 Winston logger
const logger = winston.createLogger({
  format: logFormat,
  transports: [
    // 寫入所有日誌到 combined.log
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/combined.log"),
      level: "info",
    }),
    // 寫入錯誤日誌到 error.log
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/error.log"),
      level: "error",
    }),
  ],
});

// 在開發環境下，同時輸出到控制台
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

module.exports = logger;
