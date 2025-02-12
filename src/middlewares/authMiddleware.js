const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(403).json({ error: "未提供 Token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token 無效" });
  }
};

const verifyRefreshToken = (req, res, next) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(403).json({ error: "未提供 Refresh Token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Refresh Token 無效" });
  }
};

module.exports = {
  verifyToken,
  verifyRefreshToken,
};
