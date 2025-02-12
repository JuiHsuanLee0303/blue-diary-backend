const app = require("../src");

// 確保導出正確的處理函數
module.exports = (req, res) => {
  // 在 Vercel 環境中，req 和 res 是原生的 Node.js http 對象
  // 需要將它們傳遞給 Express 應用
  return app(req, res);
};
