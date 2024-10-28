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
	createServiceCategory: [
		body("service_category")
			.exists({ checkFalsy: true })
			.withMessage("Service Category is required"),
	],
	updateServiceCategory: [
		param("service_category_id")
			.exists({ checkFalsy: true })
			.withMessage("Service Category ID is required"),
		body("service_category")
			.exists({ checkFalsy: true })
			.withMessage("Service category is required"),
		body("service_category_status")
			.exists({ checkFalsy: true })
			.withMessage("Service Category Status is required")
			.isIn(["Active", "Inactive"])
			.withMessage("Service category Status must be Active or Inactive"),
	],
	getServiceCategory: [
		param("service_category_id")
			.exists({ checkFalsy: true })
			.withMessage("Service Category ID is required"),
	],
	deleteServiceCategory: [
		param("service_category_id")
			.exists({ checkFalsy: true })
			.withMessage("Service Category ID is required"),
	],
};
