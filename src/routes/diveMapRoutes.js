const express = require("express");
const { db } = require("../config/firebase");
const { verifyToken } = require("../middlewares/authMiddleware");
const logger = require("../config/logger");

const router = express.Router();

// 創建潛點
router.post("/", verifyToken, async (req, res) => {
  try {
    const newSpot = {
      name: req.body.name,
      lat: req.body.lat,
      lng: req.body.lng,
      description: req.body.description,
      depthMin: req.body.depthMin,
      depthMax: req.body.depthMax,
      difficulty: req.body.difficulty,
      createdAt: new Date().toISOString(),
    };

    const sitesRef = db.ref("diveSites");
    const newSiteRef = sitesRef.push();
    await newSiteRef.set(newSpot);

    logger.info("Dive site created", {
      siteId: newSiteRef.key,
      name: newSpot.name,
    });

    res.status(201).json({
      id: newSiteRef.key,
      ...newSpot,
    });
  } catch (error) {
    logger.error("Failed to create dive site", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: error.message });
  }
});

// 獲取所有潛點
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.ref("diveSites").once("value");
    const sites = snapshot.val() || {};

    const siteList = Object.entries(sites).map(([id, site]) => ({
      id,
      ...site,
    }));

    logger.info("Dive sites fetched successfully", {
      count: siteList.length,
    });

    res.json(siteList);
  } catch (error) {
    logger.error("Failed to fetch dive sites", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: error.message });
  }
});

// 獲取特定潛點
router.get("/:id", async (req, res) => {
  try {
    const snapshot = await db.ref(`diveSites/${req.params.id}`).once("value");

    if (!snapshot.exists()) {
      logger.warn("Dive site not found", {
        siteId: req.params.id,
      });
      return res.status(404).json({ error: "潛點不存在" });
    }

    const site = snapshot.val();

    logger.info("Dive site fetched successfully", {
      siteId: req.params.id,
    });

    res.json({
      id: req.params.id,
      ...site,
    });
  } catch (error) {
    logger.error("Failed to fetch dive site", {
      error: error.message,
      stack: error.stack,
      siteId: req.params.id,
    });
    res.status(500).json({ error: error.message });
  }
});

// 更新潛點
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const siteRef = db.ref(`diveSites/${req.params.id}`);
    const snapshot = await siteRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "潛點不存在" });
    }

    const updateData = {
      name: req.body.name,
      lat: req.body.lat,
      lng: req.body.lng,
      description: req.body.description,
      depthMin: req.body.depthMin,
      depthMax: req.body.depthMax,
      difficulty: req.body.difficulty,
      updatedAt: new Date().toISOString(),
    };

    await siteRef.update(updateData);

    logger.info("Dive site updated", {
      siteId: req.params.id,
      name: updateData.name,
    });

    res.json({
      id: req.params.id,
      ...updateData,
    });
  } catch (error) {
    logger.error("Failed to update dive site", {
      error: error.message,
      stack: error.stack,
      siteId: req.params.id,
    });
    res.status(500).json({ error: error.message });
  }
});

// 刪除潛點
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const siteRef = db.ref(`diveSites/${req.params.id}`);
    const snapshot = await siteRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "潛點不存在" });
    }

    await siteRef.remove();

    logger.info("Dive site deleted", {
      siteId: req.params.id,
    });

    res.json({ message: "潛點已成功刪除" });
  } catch (error) {
    logger.error("Failed to delete dive site", {
      error: error.message,
      stack: error.stack,
      siteId: req.params.id,
    });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
