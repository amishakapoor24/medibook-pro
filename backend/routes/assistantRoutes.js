const express = require("express");
const rateLimit = require("express-rate-limit");
const { protect, authorize } = require("../middleware/auth");
const { chat } = require("../controllers/assistantController");
const { detectEmergency } = require("../utils/emergency");

const router = express.Router();
const assistantLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  keyGenerator: (req) => String(req.user._id),
  message: { success: false, message: "You have asked a lot of questions. Please try again in a few minutes." },
  skip: (req) => {
    const messages = req.body?.messages;
    const latest = Array.isArray(messages) && messages.length ? messages[messages.length - 1]?.content : "";
    return Boolean(detectEmergency(latest));
  },
});

router.post("/chat", protect, authorize("patient"), assistantLimiter, chat);

module.exports = router;