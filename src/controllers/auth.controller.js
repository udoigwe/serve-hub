const db = require("../utils/dbConfig");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const fs = require("fs").promises;
const CustomError = require("../utils/CustomError");
const {
	isValidFile,
	isWithinFileSize,
	getNewFileName,
	uuidv4,
	fileExists,
	sendMail,
} = require("../utils/functions");
const sharp = require("sharp");
const { otpHTML } = require("../utils/emailTemplates");

module.exports = {
	signUp: async (req, res, next) => {
		const {
			user_full_name,
			user_email,
			user_phone,
			user_password,
			user_category,
			student_id,
			year_of_graduation,
		} = req.body;

		const user_fb_url = !req.body.user_fb_url ? null : req.body.user_fb_url;
		const user_instagram_url = !req.body.user_instagram_url
			? null
			: req.body.user_instagram_url;
		const user_x_url = !req.body.user_x_url ? null : req.body.user_x_url;
		const user_whatsapp_url = !req.body.user_whatsapp_url
			? null
			: req.body.user_whatsapp_url;
		const user_youtube_url = !req.body.user_youtube_url
			? null
			: req.body.user_youtube_url;
		const user_linkedin_url = !req.body.user_linkedin_url
			? null
			: req.body.user_linkedin_url;

		let connection;

		const query = `
            SELECT *
            FROM users
            WHERE user_email = ?
            LIMIT 1
        `;
		const queryParams = [user_email];

		const query2 = `
            SELECT *
            FROM users
            WHERE student_id = ?
            LIMIT 1
        `;
		const queryParams2 = [student_id];

		const uploadPath = "public/uploads/user-images/";
		const uploadPath2 = "public/uploads/certificates/";
		const randomNumber = Math.floor(1000 + Math.random() * 9000);
		const encryptedPassword = CryptoJS.AES.encrypt(
			user_password,
			process.env.CRYPTOJS_SECRET
		).toString();

		try {
			// Get a connection from the pool
			connection = await db.getConnection();

			//start db transaction
			await connection.beginTransaction();

			const [users] = await connection.execute(query, queryParams);
			const [ids] = await connection.execute(query2, queryParams2);

			if (users.length > 0) {
				throw new CustomError(400, `${user_email} already exists`);
			}

			if (ids.length > 0) {
				throw new CustomError(
					400,
					`Student ID ${student_id} already exists`
				);
			}

			//rename user avatar
			const avatarFile = req.files.user_avatar;
			const coi = req.files.certificate_of_incoporation;
			const avatarFilePath = avatarFile.tempFilePath;
			const newAvatatrFileName = getNewFileName(
				req.files.user_avatar,
				uuidv4()
			);
			const newCertificateOfIncoporationFileName = coi
				? getNewFileName(
						req.files.certificate_of_incoporation,
						uuidv4()
				  )
				: null;

			//resize avatar image file and upload it
			await sharp(avatarFilePath)
				.resize({ height: 200, width: 200, fit: "cover" })
				.toFile(uploadPath + newAvatatrFileName);
			//delete avatar temp file
			//await fs.unlink(avatarFilePath);

			//upload the certificate of incoporation if exists
			if (coi) {
				await coi.mv(
					uploadPath2 + newCertificateOfIncoporationFileName
				);
			}

			//insert user into database
			await connection.execute(
				`
                INSERT INTO users
                (
                    user_full_name,
                    user_email,
                    user_phone,
                    user_password,
                    user_enc_password,
                    user_category,
                    certificate_of_incoporation_filename,
                    user_avatar_filename,
                    user_fb_url,
                    user_instagram_url,
                    user_x_url,
                    user_whatsapp_url,
                    user_youtube_url,
                    user_linkedin_url,
					otp,
					student_id,
					year_of_graduation,
					user_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Inactive')
            `,
				[
					user_full_name,
					user_email,
					user_phone,
					user_password,
					encryptedPassword,
					user_category,
					newCertificateOfIncoporationFileName,
					newAvatatrFileName,
					user_fb_url,
					user_instagram_url,
					user_x_url,
					user_whatsapp_url,
					user_youtube_url,
					user_linkedin_url,
					randomNumber,
					student_id,
					year_of_graduation,
				]
			);

			//generate html email template
			const emailTemplate = otpHTML(user_email, randomNumber.toString());

			//send otp
			await sendMail(user_email, "Email Verification", emailTemplate);

			//start db commit
			await connection.commit();

			res.json({
				error: false,
				message: `A verification email with an OTP has been sent to ${user_email}`,
			});
		} catch (e) {
			connection ? connection.rollback() : null;
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	signIn: async (req, res, next) => {
		const { email, password } = req.body;

		const query = `
            SELECT *
            FROM users
            WHERE user_email = ? 
            LIMIT 1
        `;
		const queryParams = [email];

		let connection;

		try {
			// Get a connection from the pool
			connection = await db.getConnection();

			//check if email exists
			const [users] = await connection.execute(query, queryParams);

			if (users.length === 0) {
				throw new CustomError(400, "Invalid credentials");
			}

			const user = users[0];

			const decryptedPassword = CryptoJS.AES.decrypt(
				user.user_enc_password,
				process.env.CRYPTOJS_SECRET
			);
			const decryptedPasswordToString = decryptedPassword.toString(
				CryptoJS.enc.Utf8
			);

			if (decryptedPasswordToString !== password) {
				throw new CustomError(400, "Invalid credentials");
			}

			if (user.user_status === "Inactive") {
				throw new CustomError(
					400,
					"Sorry!!! Your account is currently inactive. Please contact administrator"
				);
			}

			//destructure user object to remove passwords
			const { user_enc_password, user_password, ...rest } = user;

			const token = jwt.sign(rest, process.env.JWT_SECRET, {
				expiresIn: 60 * 60 * 24 * 7,
			});

			res.json({
				error: false,
				user: rest,
				token,
				message: `Welcome on board ${user.user_full_name}`,
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	updateAccount: async (req, res, next) => {
		const userID = req.userDecodedData.user_id;
		const userAvatar = req.userDecodedData.user_avatar_filename;
		const { user_full_name, user_email, user_phone } = req.body;

		const user_fb_url = !req.body.user_fb_url ? null : req.body.user_fb_url;
		const user_instagram_url = !req.body.user_instagram_url
			? null
			: req.body.user_instagram_url;
		const user_x_url = !req.body.user_x_url ? null : req.body.user_x_url;
		const user_whatsapp_url = !req.body.user_whatsapp_url
			? null
			: req.body.user_whatsapp_url;
		const user_youtube_url = !req.body.user_youtube_url
			? null
			: req.body.user_youtube_url;
		const user_linkedin_url = !req.body.user_linkedin_url
			? null
			: req.body.user_linkedin_url;

		let connection;

		const query = `
            SELECT *
            FROM users
            WHERE user_email = ?
            AND user_id != ?
            LIMIT 1
        `;
		const queryParams = [user_email, userID];

		const uploadPath = "public/uploads/user-images/";
		const acceptedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];

		try {
			// Get a connection from the pool
			connection = await db.getConnection();

			const [users] = await connection.execute(query, queryParams);

			//check if selected email address already exists
			if (users.length > 0) {
				throw new CustomError(400, `${user_email} already exists`);
			}

			let updateQuery = `
                UPDATE users
                SET
                    user_full_name = ?,
                    user_email = ?,
                    user_phone = ?,
                    user_fb_url = ?,
                    user_instagram_url = ?,
                    user_x_url = ?,
                    user_whatsapp_url = ?,
                    user_youtube_url = ?,
                    user_linkedin_url = ?
            `;

			const updateQueryParams = [
				user_full_name,
				user_email,
				user_phone,
				user_fb_url,
				user_instagram_url,
				user_x_url,
				user_whatsapp_url,
				user_youtube_url,
				user_linkedin_url,
			];

			if (req.files && req.files.user_avatar) {
				//check for file types
				if (!isValidFile(req.files.user_avatar, acceptedMimeTypes)) {
					throw new CustomError(
						400,
						"User avatar must be jpg or png files"
					);
				}

				//check for file sizes
				if (!isWithinFileSize(req.files.user_avatar, 1000000)) {
					throw new CustomError(
						400,
						"Uploads must not be more than 1MB in size each"
					);
				}

				const file = req.files.user_avatar;
				const filePath = file.tempFilePath;
				const newAvatatrFileName = getNewFileName(
					req.files.user_avatar,
					uuidv4()
				);

				if (await fileExists(uploadPath + userAvatar)) {
					await fs.unlink(uploadPath + userAvatar);
				}

				await sharp(filePath)
					.resize({ height: 200, width: 200, fit: "cover" })
					.toFile(uploadPath + newAvatatrFileName);

				//await fs.unlink(filePath);

				updateQuery += `, user_avatar_filename = ?`;
				updateQueryParams.push(newAvatatrFileName);
			}

			updateQuery += ` WHERE user_id = ?`;
			updateQueryParams.push(userID);

			await connection.execute(updateQuery, updateQueryParams);

			//remove expired timing in token
			const { iat, exp, ...rest } = req.userDecodedData;

			//update the current token
			let tkn = jwt.sign(
				{
					...rest,
					user_full_name,
					user_email,
					user_phone,
					user_fb_url,
					user_instagram_url,
					user_x_url,
					user_whatsapp_url,
					user_youtube_url,
					user_linkedin_url,
				},
				process.env.JWT_SECRET,
				{ expiresIn: 60 * 60 * 24 * 7 }
			);

			res.json({
				error: false,
				message: "Account updated successfully",
				token: tkn,
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	updatePassword: async (req, res) => {
		const myData = req.userDecodedData;
		const email = myData.user_email;
		const { current_password, new_password } = req.body;

		let query = `
            SELECT * 
            FROM users 
            WHERE user_email = ? 
            LIMIT 1
        `;
		const queryParams = [email];

		let connection;

		try {
			// Get a connection from the pool
			connection = await db.getConnection();

			const [users] = await connection.execute(query, queryParams);

			if (users.length === 0) {
				throw new CustomError(404, "Your account no longer exists");
			}

			const user = users[0];

			const decryptedPassword = CryptoJS.AES.decrypt(
				user.user_enc_password,
				process.env.CRYPTOJS_SECRET
			);
			const decryptedPasswordToString = decryptedPassword.toString(
				CryptoJS.enc.Utf8
			);

			if (decryptedPasswordToString !== current_password) {
				throw new CustomError(
					400,
					"Password provided does not match your stored password. Try Again"
				);
			}

			const encryptedPassword = CryptoJS.AES.encrypt(
				new_password,
				process.env.CRYPTOJS_SECRET
			).toString();

			await connection.execute(
				`
                UPDATE users 
                SET user_password = ?, 
                user_enc_password = ? 
                WHERE user_email = ?`,
				[new_password, encryptedPassword, email]
			);

			res.json({
				error: false,
				message: "Password updated successfully",
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	resendOTP: async (req, res, next) => {
		const { email } = req.body;

		const randomNumber = Math.floor(1000 + Math.random() * 9000);
		let connection;

		try {
			//instantiate db
			connection = await db.getConnection();

			//start db transaction
			await connection.beginTransaction();

			//check if email exists
			const [users] = await connection.execute(
				`
                SELECT *
                FROM users
                WHERE user_email = ?
                LIMIT 1`,
				[email]
			);

			if (users.length === 0) {
				throw new CustomError(400, "User does not exist.");
			}

			//update otp into database
			await connection.execute(
				`
                UPDATE users
                SET
                    otp = ?
                WHERE user_email = ?`,
				[randomNumber, email]
			);

			//generate html email template
			const emailTemplate = otpHTML(email, randomNumber.toString());

			//send email
			//await sendMail(process.env.AWS_SES_NO_REPLY_SENDER, [ email ], 'Email Verification', emailTemplate);
			await sendMail(email, "Email Verification", emailTemplate);

			//commit db
			await connection.commit();

			res.json({
				error: false,
				message: `OTP has been resent to ${email}`,
			});
		} catch (e) {
			connection ? connection.rollback() : null;
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	verifyAccount: async (req, res, next) => {
		const { email, otp } = req.body;

		let connection;

		try {
			//instantiate db
			connection = await db.getConnection();

			//check if email exists
			const [users] = await connection.execute(
				`
                SELECT *
                FROM users
                WHERE user_email = ?
                LIMIT 1`,
				[email]
			);

			if (users.length === 0) {
				throw new CustomError(400, "User does not exist.");
			}

			//check if otp provided matches stored otp
			if (users[0].otp !== otp) {
				throw new CustomError(
					400,
					"Invalid OTP provided. Please try again"
				);
			}

			//activate and verify user
			await connection.execute(
				`
                UPDATE users
                SET
                    user_status = 'Active',
                    otp = NULL
                WHERE user_email = ?`,
				[email]
			);

			res.json({
				error: false,
				message: "Account verified successfully",
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
};
