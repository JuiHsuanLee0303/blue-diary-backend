const express = require("express");
const { db } = require("../config/firebase");
const { verifyToken } = require("../middlewares/authMiddleware");
const logger = require("../config/logger");
const { auth } = require("../config/firebase");

const router = express.Router();

// 獲取用戶資料
router.get("/", verifyToken, async (req, res) => {
  try {
    const snapshot = await db.ref(`users/${req.user.uid}`).once("value");
    const userData = snapshot.val() || {};

    logger.info("User profile fetched", {
      uid: req.user.uid,
    });

    res.json({
      uid: req.user.uid,
      ...userData,
    });
  } catch (error) {
    logger.error("Failed to fetch user profile", {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid,
    });
    res.status(500).json({ error: error.message });
  }
});

// 更新用戶資料
router.put("/", verifyToken, async (req, res) => {
  try {
    const userRef = db.ref(`users/${req.user.uid}`);
    const { currentPassword, newPassword, ...updateData } = req.body;

    // 如果要更改密碼
    if (currentPassword || newPassword) {
      try {
        // 驗證當前密碼
        const user = await auth.getUser(req.user.uid);
        if (user.password !== currentPassword) {
          return res.status(400).json({ error: "當前密碼不正確" });
        }

        // 使用 Firebase Admin SDK 更新密碼
        await auth.updateUser(req.user.uid, {
          password: newPassword,
        });

        logger.info("Password updated successfully", {
          uid: req.user.uid,
        });
      } catch (error) {
        logger.error("Password update failed", {
          error: error.message,
          uid: req.user.uid,
        });
        return res.status(400).json({ error: "密碼更新失敗" });
      }
    }

    // 更新其他用戶資料
    const profileUpdate = {
      name: updateData.name,
      email: updateData.email,
      certificates: updateData.certificates || [],
      updatedAt: new Date().toISOString(),
    };

    await userRef.update(profileUpdate);

    logger.info("User profile updated", {
      uid: req.user.uid,
    });

    res.json({
      uid: req.user.uid,
      ...profileUpdate,
    });
  } catch (error) {
    logger.error("Failed to update user profile", {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid,
    });
    res.status(500).json({ error: error.message });
  }
});

// 添加證照
router.post("/certificates", verifyToken, async (req, res) => {
  try {
    const { system, level, url } = req.body;

    if (!system || !level) {
      return res.status(400).json({ error: "系統和等級為必填欄位" });
    }

    const userRef = db.ref(`users/${req.user.uid}`);
    const snapshot = await userRef.child("certificates").once("value");
    const certificates = snapshot.val() || [];

    const newCertificate = {
      system,
      level,
      url: url || "",
      createdAt: new Date().toISOString(),
    };

    certificates.push(newCertificate);
    await userRef.child("certificates").set(certificates);

    logger.info("Certificate added", {
      uid: req.user.uid,
      system,
      level,
    });

    res.status(201).json(newCertificate);
  } catch (error) {
    logger.error("Failed to add certificate", {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid,
    });
    res.status(500).json({ error: error.message });
  }
});

// 刪除證照
router.delete("/certificates/:index", verifyToken, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const userRef = db.ref(`users/${req.user.uid}`);
    const snapshot = await userRef.child("certificates").once("value");
    const certificates = snapshot.val() || [];

    if (index < 0 || index >= certificates.length) {
      return res.status(404).json({ error: "證照不存在" });
    }

    certificates.splice(index, 1);
    await userRef.child("certificates").set(certificates);

    logger.info("Certificate deleted", {
      uid: req.user.uid,
      index,
    });

    res.json({ message: "證照已成功刪除" });
  } catch (error) {
    logger.error("Failed to delete certificate", {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid,
    });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
