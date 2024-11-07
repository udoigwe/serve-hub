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
	createNewService: [
		body("service_category_id")
			.exists({ checkFalsy: true })
			.withMessage("Service category ID is required"),
		body("service_title")
			.exists({ checkFalsy: true })
			.withMessage("Service title is required"),
		body("service_price")
			.exists({ checkFalsy: true })
			.withMessage("Service price is required"),
		body("service_description")
			.exists({ checkFalsy: true })
			.withMessage("Service description is required"),
		body("service_address")
			.exists({ checkFalsy: true })
			.withMessage("Service address is required"),
		// Custom validator to validate files
		body().custom((_, { req }) => {
			const files = req.files;
			let images = req.files.images;
			const acceptedFileTypes = ["jpg", "png", "jpeg"];

			if (!files) {
				throw "No file upload found.";
			}

			// Check if the files exists
			if (!images) {
				throw "Please provide atleast an image of this issue.";
			}

			// If only one image is uploaded, wrap it in an array
			if (!Array.isArray(images)) {
				images = [images];
			}

			//validate images
			for (let i = 0; i < images.length; i++) {
				const file = images[i];

				if (!isValidFile2(file, acceptedFileTypes)) {
					throw `${file.name} must be a jpg, png or pdf document`;
				}

				//check for file sizes
				if (!isWithinFileSize(file, 2 * 1024 * 1024)) {
					throw "Uploads must not be more than 2MB in size each";
				}
			}

			return true;
		}),
	],
	getService: [
		param("service_id")
			.exists({ checkFalsy: true })
			.withMessage("Service ID is required"),
	],
	updateService: [
		param("service_id")
			.exists({ checkFalsy: true })
			.withMessage("Service ID is required"),
		body("service_category_id")
			.exists({ checkFalsy: true })
			.withMessage("Service category ID is required"),
		body("service_title")
			.exists({ checkFalsy: true })
			.withMessage("Service title is required"),
		body("service_price")
			.exists({ checkFalsy: true })
			.withMessage("Service price is required"),
		body("service_description")
			.exists({ checkFalsy: true })
			.withMessage("Service description is required"),
		body("service_address")
			.exists({ checkFalsy: true })
			.withMessage("Service address is required"),
		body("service_status")
			.exists({ checkFalsy: true })
			.withMessage("Service status is required")
			.isIn(["Published", "Unpublished"]),
		// Custom validator to validate files
		body().custom((_, { req }) => {
			if (req.files && req.files.images) {
				const files = req.files;
				let images = req.files.images;
				const acceptedFileTypes = ["jpg", "png", "jpeg"];

				if (!files) {
					throw "No file upload found.";
				}

				// Check if the files exists
				if (!images) {
					throw "Please provide atleast an image of this issue.";
				}

				// If only one image is uploaded, wrap it in an array
				if (!Array.isArray(images)) {
					images = [images];
				}

				//validate images
				for (let i = 0; i < images.length; i++) {
					const file = images[i];

					if (!isValidFile2(file, acceptedFileTypes)) {
						throw `${file.name} must be a jpg, png or pdf document`;
					}

					//check for file sizes
					if (!isWithinFileSize(file, 2 * 1024 * 1024)) {
						throw "Uploads must not be more than 2MB in size each";
					}
				}
			}

			return true;
		}),
	],
	deleteService: [
		param("service_id")
			.exists({ checkFalsy: true })
			.withMessage("Service ID is required"),
	],
};
