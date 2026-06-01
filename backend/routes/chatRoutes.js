const express = require("express");
const router = express.Router();
const { getMessages, sendMessage } = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

router.get("/:appointmentId", protect, getMessages);
router.post("/:appointmentId", protect, sendMessage);

module.exports = router;
