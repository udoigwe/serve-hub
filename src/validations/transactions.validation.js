const { body, query, param } = require("express-validator");
const moment = require("moment");

module.exports = {
	verifySubscriptionPayment: [
		body("subscription_plan_id")
			.exists({ checkFalsy: true })
			.withMessage("Subscription plan ID is required"),
		body("amount")
			.exists({ checkFalsy: true })
			.withMessage("Amount is required"),
		body("subscriber_id")
			.exists({ checkFalsy: true })
			.withMessage("Subscriber is required"),
		body("transaction_id")
			.exists({ checkFalsy: true })
			.withMessage("Transaction ID is required"),
	],
};
