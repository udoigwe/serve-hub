const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messages.controller");
const validators = require("../middleware/validators");
const checkAuth = require("../middleware/checkAuth");

router.post(
	"/messages",
	checkAuth.verifyToken,
	validators.sendMessage,
	messagesController.sendMessage
);

module.exports = router;
