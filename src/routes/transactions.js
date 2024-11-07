const express = require("express");
const router = express.Router();
const transactionsController = require("../controllers/transactions.controller");
const validators = require("../middleware/validators");
const checkAuth = require("../middleware/checkAuth");

router.post(
	"/subscriptions",
	checkAuth.verifyToken,
	validators.verifySubscriptionPayment,
	transactionsController.verifySubscriptionPayment
);
router.get(
	"/subscriptions",
	checkAuth.verifyToken,
	transactionsController.getAllSubscriptions
);

module.exports = router;
