const { body, query, param } = require("express-validator");
const {
	parseJSONOrUseOriginal,
	validateDigits,
	isWithinFileSize,
	isValidFile,
	validateNumber,
	isValidFile2,
} = require("../utils/functions");
const moment = require("moment");

module.exports = {
	createPricingPlan: [
		body("subscription_plan_title")
			.exists({ checkFalsy: true })
			.withMessage("Subscription Plan is required"),
		body("duration")
			.exists({ checkFalsy: true })
			.withMessage("Duration is required")
			.isNumeric()
			.withMessage("Duration must be a number"),
		body("no_of_services")
			.exists({ checkFalsy: true })
			.withMessage("Number of service is required")
			.isNumeric()
			.withMessage("Number of service must be a number"),
		body("no_of_images_per_service")
			.exists({ checkFalsy: true })
			.withMessage("Number of images per service is required")
			.isNumeric()
			.withMessage("Number of images per service must be a number"),
		body("is_featured")
			.exists({ checkFalsy: true })
			.withMessage("Is Featured is required")
			.isIn(["Yes", "No"])
			.withMessage("Is Featured Must be Yes Or No"),
		body("price")
			.exists({ checkFalsy: true })
			.withMessage("Price is required")
			.isNumeric()
			.withMessage("Price must be a number"),
	],
	updatePricingPlan: [
		param("subscription_plan_id")
			.exists({ checkFalsy: true })
			.withMessage("Pricing Plan ID is required"),
		body("duration")
			.exists({ checkFalsy: true })
			.withMessage("Duration is required")
			.isNumeric()
			.withMessage("Duration must be a number"),
		body("no_of_services")
			.exists({ checkFalsy: true })
			.withMessage("Number of service is required")
			.isNumeric()
			.withMessage("Number of service must be a number"),
		body("no_of_images_per_service")
			.exists({ checkFalsy: true })
			.withMessage("Number of images per service is required")
			.isNumeric()
			.withMessage("Number of images per service must be a number"),
		body("is_featured")
			.exists({ checkFalsy: true })
			.withMessage("Is Featured is required")
			.isIn(["Yes", "No"])
			.withMessage("Is Featured Must be Yes Or No"),
		body("price")
			.exists({ checkFalsy: true })
			.withMessage("Price is required")
			.isNumeric()
			.withMessage("Price must be a number"),
		body("subscription_plan_status")
			.exists({ checkFalsy: true })
			.withMessage("Subscription Plan Status is required")
			.isIn(["Active", "Inactive"])
			.withMessage("Pricing Plan status must be Active or Inactive"),
	],
	getPricingPlan: [
		param("subscription_plan_id")
			.exists({ checkFalsy: true })
			.withMessage("Pricing Plan ID is required"),
	],
	deletePricingPlan: [
		param("subscription_plan_id")
			.exists({ checkFalsy: true })
			.withMessage("Subscription Plan ID is required"),
	],
};
