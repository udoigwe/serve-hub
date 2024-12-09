const { pool } = require("../utils/dbConfig");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const CustomError = require("./CustomError");
const moment = require("moment");
const fs = require("fs").promises;
const nodemailer = require("nodemailer");

exports.validateEmail = (email) => {
	var filter = /^[\w-.+]+@[a-zA-Z0-9.-]+.[a-zA-Z0-9]{2,4}$/;

	if (filter.test(email)) {
		return true;
	} else {
		return false;
	}
};

exports.validateDigits = (entry) => {
	var filter = /^[0-9]+$/;

	if (filter.test(entry)) {
		return true;
	} else {
		return false;
	}
};

exports.validateLeadingZeros = (entry) => {
	var filter = /^(0|[1-9][0-9]*)$/;

	if (filter.test(entry)) {
		return true;
	} else {
		return false;
	}
};

exports.verifyToken = (token, cb) => {
	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
			cb(err, null);
		} else {
			cb(null, decoded);
		}
	});
};

exports.slugify = (text) => {
	return (
		text
			.toString() //convert to string
			.toLowerCase() //convert the string to lowercase letters
			.normalize("NFD") //returns the unicode normalization form of a given string
			.trim() //removes white spaces from both sides of a string
			/* .replace(/ /g,'_')       //replaces white space with underscore */
			.replace(/[\- ]/g, "_") //replaces white space and hiphens with underscore
			.replace(/[^\w-]+/g, "") //removes all non-word characters
			.replace(/\_\_+/g, "_")
	); // Replace multiple _ with single _
};

exports.uuidv4 = () => {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
		/[xy]/g,
		function (c) {
			var r = (Math.random() * 16) | 0,
				v = c == "x" ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		}
	);
};

exports.sumArray = (array) => {
	//initialize our finall answer
	let sum = 0;

	//loop through entire array
	for (let i = 0; i < array.length; i++) {
		sum += array[i];
	}

	return sum;
};

exports.validate = (validations) => {
	return async (req, res, next) => {
		try {
			await Promise.all(
				validations.map((validation) => validation.run(req))
			);
			const errors = validationResult(req);

			if (!errors.isEmpty()) {
				//iterate through the errors and show the first to the user
				throw new CustomError(422, `${errors.array()[0].msg}`);
			}

			return next();
		} catch (e) {
			next(e);
		}
	};
};

exports.getCSVPlaceHolders = (value) => {
	// Split the comma-separated string into an array of values
	const valuesArray = value.split(",");

	// Create an array of placeholders for the parameterized query
	const placeholders = valuesArray
		.map((value, index) => {
			return `?`;
		})
		.join(",");

	//return values and placeholders
	return { valuesArray, placeholders };
};

exports.parseJSONOrUseOriginal = (str) => {
	try {
		const parsedJson = JSON.parse(str);
		return parsedJson;
	} catch (error) {
		// If parsing fails, return the original string
		return str;
	}
};

exports.isValidFile = (file, allowedExtensions) => {
	/* const fileExtension = file.name.split('.').pop().toLowerCase();
    return allowedExtensions.includes(fileExtension); */
	const fileMimeType = file.mimetype;
	return allowedExtensions.includes(fileMimeType);
};

exports.isValidFile2 = (file, allowedExtensions) => {
	const fileExtension = file.name.split(".").pop().toLowerCase();
	return allowedExtensions.includes(fileExtension);
};

exports.isWithinFileSize = (file, allowedFileSize) => {
	const fileSize = file.size;
	return fileSize <= allowedFileSize;
};

exports.fileExists = async (filePath) => {
	try {
		await fs.stat(filePath);
		return true;
	} catch (err) {
		if (err.code === "ENOENT") {
			return false;
		}
		throw err; // Some other error
	}
};

exports.getNewFileName = (file, prefixAlgorithm) => {
	const filename = file.name;
	const extensionPosition = filename.lastIndexOf(".");
	const extension = filename.substr(extensionPosition).toLowerCase();
	const newFileName = prefixAlgorithm + extension;

	return newFileName;
};

exports.stripHtmlTags = (str) => {
	str = str.toString();

	// Regular expression to identify HTML tags in
	// the input string. Replacing the identified
	// HTML tag with a null string.
	return str.replace(/(<([^>]+)>)/gi, "");
};

exports.sendMail = async (to, subject, html) => {
	const transporter = nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 465,
		auth: {
			user: process.env.GMAIL_USER,
			pass: process.env.GMAIL_PASSWORD,
		},
	});

	const mailOptions = {
		from: `${process.env.GMAIL_USER}`,
		to,
		subject,
		html,
	};

	try {
		await transporter.sendMail(mailOptions);
		return true;
	} catch (e) {
		throw e;
	}
};
