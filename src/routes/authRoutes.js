const express = require("express");
const { auth, db } = require("../config/firebase");
const jwt = require("jsonwebtoken");
const logger = require("../config/logger");
const { verifyRefreshToken } = require("../middlewares/authMiddleware");

const router = express.Router();

const generateAccessToken = (uid) => {
  return jwt.sign({ uid }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

const generateRefreshToken = (uid) => {
  return jwt.sign({ uid }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
  });
};

// 驗證註冊數據
const validateRegistrationData = ({ name, email, password }) => {
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("名稱至少需要2個字符");
  }

  if (!email || !email.includes("@")) {
    errors.push("請提供有效的電子郵件");
  }

  if (!password || password.length < 6) {
    errors.push("密碼至少需要6個字符");
  }

  return errors;
};

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. 驗證輸入數據
    const validationErrors = validateRegistrationData({
      name,
      email,
      password,
    });
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(", "));
    }

    // 2. 檢查郵箱是否已被使用
    try {
      const existingUser = await auth.getUserByEmail(email);
      if (existingUser) {
        throw new Error("此電子郵件已被註冊");
      }
    } catch (error) {
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }

    let userRecord = null;

    try {
      // 3. 創建 Firebase Auth 用戶
      userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });

      logger.info("Auth user created", {
        uid: userRecord.uid,
        email: userRecord.email,
      });

      // 4. 創建用戶數據
      const userRef = db.ref(`users/${userRecord.uid}`);
      await userRef.set({
        name,
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // 驗證數據是否創建成功
      const snapshot = await userRef.once("value");
      if (!snapshot.exists()) {
        throw new Error("Failed to verify user data creation");
      }

      logger.info("User data created successfully", {
        uid: userRecord.uid,
        email: userRecord.email,
        name,
      });

      // 5. 生成令牌
      const token = generateAccessToken(userRecord.uid);
      const refreshToken = generateRefreshToken(userRecord.uid);

      // 6. 返回成功響應
      res.json({
        token,
        refreshToken,
        user: {
          uid: userRecord.uid,
          name,
          email,
        },
      });
    } catch (error) {
      // 如果出錯，清理已創建的 Auth 用戶
      if (userRecord) {
        try {
          await auth.deleteUser(userRecord.uid);
          logger.info("Cleaned up auth user after failure", {
            uid: userRecord.uid,
          });
        } catch (cleanupError) {
          logger.error("Failed to clean up auth user", {
            error: cleanupError.message,
            uid: userRecord.uid,
          });
        }
      }
      throw error;
    }
  } catch (error) {
    logger.error("Registration failed", {
      error: error.message,
      stack: error.stack,
      email,
      name,
    });

    res.status(400).json({
      error: error.message || "註冊失敗",
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await auth.getUserByEmail(email);

    // 從 Realtime Database 獲取用戶資料
    const snapshot = await db.ref(`users/${userRecord.uid}`).once("value");
    const userData = snapshot.val();

    const token = generateAccessToken(userRecord.uid);
    const refreshToken = generateRefreshToken(userRecord.uid);

    logger.info("User logged in successfully", {
      email: userRecord.email,
      name: userData.name,
      uid: userRecord.uid,
    });

    res.json({
      token,
      refreshToken,
      user: {
        uid: userRecord.uid,
        name: userData.name,
        email: userData.email,
      },
    });
  } catch (error) {
    logger.error("Login failed", { error: error.message, email });
    res.status(401).json({ error: "登入失敗" });
  }
});

router.post("/refresh", verifyRefreshToken, (req, res) => {
  const newToken = generateAccessToken(req.user.uid);
  res.json({ token: newToken });
});

module.exports = router;
