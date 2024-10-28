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
	getUser: [
		param("user_id")
			.exists({ checkFalsy: true })
			.withMessage("User ID is required"),
	],
	updateUser: [
		body("user_full_name")
			.exists({ checkFalsy: true })
			.withMessage("User full name is required"),
		body("user_email")
			.exists({ checkFalsy: true })
			.withMessage("Email is required")
			.isEmail()
			.withMessage("Please provide a valid email address"),
		body("user_phone")
			.exists({ checkFalsy: true })
			.withMessage("User Phone is required"),
		body("user_category")
			.exists({ checkFalsy: true })
			.withMessage("Category is required")
			.isIn(["Customer", "Service Provider", "Admin"])
			.withMessage(
				"User category must be a Customer, Service Provider OR Admin"
			),
		// Custom validator to validate files
		body().custom((_, { req }) => {
			const files = req.files;
			const avatar = req.files.user_avatar;
			const certificateOfIncoporation =
				req.files.certificate_of_incoporation;
			const acceptedFileTypes = ["jpg", "png", "jpeg"];

			if (files) {
				if (avatar) {
					//check for avatar sizes
					if (!isWithinFileSize(avatar, 2 * 1024 * 1024)) {
						throw "Uploads must not be more than 2MB in size each";
					}

					//check for avatar file types
					if (!isValidFile2(avatar, acceptedFileTypes)) {
						throw `${avatar.name} must be a jpg, png or pdf document`;
					}
				}

				if (
					certificateOfIncoporation &&
					!isValidFile2(certificateOfIncoporation, acceptedFileTypes)
				) {
					throw `Certificate of Incoporation file upload must be jpg or png files`;
				}

				if (
					certificateOfIncoporation &&
					!isWithinFileSize(
						certificateOfIncoporation,
						2 * 1024 * 1024
					)
				) {
					throw `Uploads must not be more than 2MB in size each`;
				}
			}

			return true;
		}),
	],
	deleteUser: [
		param("user_id")
			.exists({ checkFalsy: true })
			.withMessage("User ID is required"),
	],
};
