const express = require("express");
const { db } = require("../config/firebase");
const { verifyToken } = require("../middlewares/authMiddleware");
const logger = require("../config/logger");

const router = express.Router();

// 創建潛水日誌
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      // 基本資訊
      name,
      date,
      time,
      location,

      // 環境資訊
      airTemp,
      waterTemp,
      weather,
      waterType,
      diveType,
      current,
      waveCondition,

      // 潛水數據
      maxDepth,
      duration,
      weight,
      visibility,

      // 氣瓶資訊
      tankType,
      tankVolume,
      startPressure,
      endPressure,

      // 夥伴資訊
      buddies,
      diveShop,

      // 裝備
      equipment,

      // 照片和筆記
      images,
      notes,
    } = req.body;

    // 計算 SAC
    const calculateSAC = () => {
      const consumption = startPressure - endPressure;
      const averageDepth = maxDepth / 2;
      const atm = averageDepth / 10 + 1;
      return ((consumption * tankVolume) / (duration * atm)).toFixed(1);
    };

    const newLog = {
      userId: req.user.uid,
      // 基本資訊
      name,
      date,
      time,
      location,

      // 環境資訊
      airTemp: Number(airTemp) || null,
      waterTemp: Number(waterTemp),
      weather,
      waterType,
      diveType,
      current,
      waveCondition,

      // 潛水數據
      maxDepth: Number(maxDepth),
      duration: Number(duration),
      weight: Number(weight) || null,
      visibility: Number(visibility) || null,

      // 氣瓶資訊
      tankType,
      tankVolume: Number(tankVolume),
      startPressure: Number(startPressure),
      endPressure: Number(endPressure),
      pressureConsumption: Number(startPressure) - Number(endPressure),
      sac: calculateSAC(),

      // 夥伴資訊
      buddies: buddies || [],
      diveShop: diveShop || "",

      // 裝備
      equipment: equipment || [],

      // 照片和筆記
      images: images || [],
      notes: notes || "",

      // 時間戳
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 創建新的日誌記錄
    const logRef = db.ref(`diveLogs/${req.user.uid}`).push();
    await logRef.set(newLog);

    logger.info("Dive log created", {
      uid: req.user.uid,
      logId: logRef.key,
      location,
    });

    res.status(201).json({
      id: logRef.key,
      ...newLog,
    });
  } catch (error) {
    logger.error("Failed to create dive log", {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid,
    });
    res.status(500).json({ error: error.message });
  }
});

// 獲取用戶的所有潛水日誌
router.get("/", verifyToken, async (req, res) => {
  try {
    const snapshot = await db.ref(`diveLogs/${req.user.uid}`).once("value");
    const logs = [];

    snapshot.forEach((childSnapshot) => {
      logs.push({
        id: childSnapshot.key,
        ...childSnapshot.val(),
      });
    });

    // 按日期降序排序
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(logs);
  } catch (error) {
    logger.error("Failed to fetch dive logs", {
      error: error.message,
      uid: req.user.uid,
    });
    res.status(500).json({ error: error.message });
  }
});

// 獲取特定潛水日誌
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const snapshot = await db
      .ref(`diveLogs/${req.user.uid}/${req.params.id}`)
      .once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "潛水日誌不存在" });
    }

    const log = {
      id: snapshot.key,
      ...snapshot.val(),
    };

    res.json(log);
  } catch (error) {
    logger.error("Failed to fetch dive log", {
      error: error.message,
      uid: req.user.uid,
      logId: req.params.id,
    });
    res.status(500).json({ error: error.message });
  }
});

// 更新潛水日誌
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const logRef = db.ref(`diveLogs/${req.user.uid}/${req.params.id}`);
    const snapshot = await logRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "潛水日誌不存在" });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    await logRef.update(updateData);

    logger.info("Dive log updated", {
      uid: req.user.uid,
      logId: req.params.id,
    });

    res.json({
      id: req.params.id,
      ...updateData,
    });
  } catch (error) {
    logger.error("Failed to update dive log", {
      error: error.message,
      uid: req.user.uid,
      logId: req.params.id,
    });
    res.status(500).json({ error: error.message });
  }
});

// 刪除潛水日誌
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const logRef = db.ref(`diveLogs/${req.user.uid}/${req.params.id}`);
    const snapshot = await logRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "潛水日誌不存在" });
    }

    await logRef.remove();

    logger.info("Dive log deleted", {
      uid: req.user.uid,
      logId: req.params.id,
    });

    res.json({ message: "日誌已成功刪除" });
  } catch (error) {
    logger.error("Failed to delete dive log", {
      error: error.message,
      uid: req.user.uid,
      logId: req.params.id,
    });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
