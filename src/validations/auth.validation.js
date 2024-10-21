const { body} = require("express-validator");
const { isWithinFileSize, isValidFile, isValidFile2 } = require("../utils/functions");

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
            .withMessage("User category must be a Customer or Service Provider"),
        // Custom validator to validate files
        body().custom((_, { req }) => {
            const user_category = req.body.user_category;
            const files = req.files;
            const avatar = req.files.user_avatar;
            const certificateOfIncoporation = req.files.certificate_of_incoporation;
            const acceptedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            const acceptedFileTypes = ['jpg', 'png', 'jpeg'];

            if (!files) {
                throw 'No image files were uploaded';
            }

            // Check if the avatar exists
            if (!avatar) {
                throw 'No images were uploaded.';
            }

            //check if certificate of incoroporation file is available if user is a service provide
            if(!certificateOfIncoporation && user_category === "Service Provider")
            {
                throw `Please upload your certificate of incoporation as a service provider`;
            }

            //check for avatar sizes
            if (!isWithinFileSize(avatar, 2 * 1024 * 1024)) {
                throw 'Uploads must not be more than 2MB in size each';
            }

            //check for avatar file types
            if (!isValidFile2(avatar, acceptedFileTypes)) {
                throw `${avatar.name} must be a jpg, png or pdf document`;
            }

            if(certificateOfIncoporation && !isValidFile2(certificateOfIncoporation, acceptedFileTypes))
            {
                throw `Certificate of Incoporation file upload must be jpg or png files`;
            }

            if(certificateOfIncoporation && !isWithinFileSize(certificateOfIncoporation, 2 * 1024 * 1024))
            {
                throw `Uploads must not be more than 2MB in size each`;
            }

            return true;
        })
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