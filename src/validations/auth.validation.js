const { body} = require("express-validator");

module.exports = {
    signUp: [
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
        body("user_password")
            .exists({ checkFalsy: true })
            .withMessage("Password is required"),
        body("user_category")
            .exists({ checkFalsy: true })
            .withMessage("Category is required")
            .isIn(["Customer", "Service Provider"])
            .withMessage("User category must be a Customer or Service Provider")
    ],
    signIn: [
        body("email")
            .exists({ checkFalsy: true })
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Please provide a valid email address"),
        body("password")
            .exists({ checkFalsy: true })
            .withMessage("Password is required")
    ],
    updateAccount: [
		body("user_full_name")
			.exists({ checkFalsy: true })
			.withMessage("User Full Name is required"),
        body("user_email")
            .exists({ checkFalsy: true })
            .withMessage("User Email is required")
            .isEmail()
            .withMessage("Please provide a valid email address"),
        body("user_phone")
            .exists({ checkFalsy: true })
            .withMessage("User Phone is required"),
	],
    updatePassword: [
		body("current_password")
			.exists({ checkFalsy: true })
			.withMessage("Current Password is required"),
		body("new_password")
		 	.exists({ checkFalsy: true})
			.withMessage("New Password is required")
	],
}