const pool = require("../utils/dbConfig");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const CryptoJS = require("crypto-js");
const CustomError = require("../utils/CustomError");
const { getNewFileName, fileExists, uuidv4 } = require("../utils/functions");
const sharp = require("sharp");
const fs = require("fs").promises;

module.exports = {
	createUser: async (req, res, next) => {
		const { user_name, user_email, user_password, user_role } = req.body;

		const now = Math.floor(Date.now() / 1000);

		const query = `
            SELECT user_email
            FROM users
            WHERE user_email = ? 
            LIMIT 1
        `;

		let connection;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			//check if email already exists
			const [users] = await connection.execute(query, [user_email]);

			if (users.length > 0) {
				throw new CustomError(400, "Email already exists");
			}

			//get encrypted user password
			const encPassword = CryptoJS.AES.encrypt(
				user_password,
				process.env.CRYPTOJS_SECRET
			).toString();

			//add user to database
			await connection.execute(
				`
                    INSERT INTO users
                    (
                        user_name,
                        user_email,
                        user_password,
                        user_password_encrypt,
                        user_role,
                        user_created_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                `,
				[
					user_name,
					user_email,
					user_password,
					encPassword,
					user_role,
					now,
				]
			);

			res.json({
				error: false,
				message: `User created successfully`,
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	updateUser: async (req, res, next) => {
		const { user_id } = req.params;
		const {
			user_full_name,
			user_email,
			user_phone,
			user_category,
			user_status,
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

		const now = Math.floor(Date.now() / 1000);
		const uploadPath = "public/uploads/user-images/";
		const uploadPath2 = "public/uploads/certificates/";

		const query = `
            SELECT *
            FROM users
            WHERE user_id = ?
            LIMIT 1
        `;

		const query2 = `
            SELECT *
            FROM users
            WHERE user_email = ? 
            AND user_id != ?
            LIMIT 1
        `;

		let connection;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			//Start database transaction
			await connection.beginTransaction();

			//check if user exists
			const [users] = await connection.execute(query, [user_id]);
			//check if email already exists
			const [emails] = await connection.execute(query2, [
				user_email,
				user_id,
			]);

			if (users.length === 0) {
				throw new CustomError(400, "User does not exist");
			}

			if (emails.length > 0) {
				throw new CustomError(
					400,
					"Email already exists. Choose another"
				);
			}

			const user = users[0];

			let updateQuery = `
                UPDATE users
                SET
                    user_full_name = ?,
                    user_email = ?,
                    user_phone = ?,
                    user_category = ?,
                    user_fb_url = ?,
                    user_instagram_url = ?,
                    user_x_url = ?,
                    user_whatsapp_url = ?,
                    user_youtube_url = ?,
                    user_linkedin_url = ?,
                    user_status = ?
            `;

			const updateQueryParams = [
				user_full_name,
				user_email,
				user_phone,
				user_category,
				user_fb_url,
				user_instagram_url,
				user_x_url,
				user_whatsapp_url,
				user_youtube_url,
				user_linkedin_url,
				user_status,
			];

			if (req.files) {
				if (req.files.user_avatar) {
					let avatar = req.files.user_avatar;
					const avatarFilePath = avatar.tempFilePath;
					const newAvatarFileName = getNewFileName(avatar, uuidv4());

					if (
						await fileExists(uploadPath + user.user_avatar_filename)
					) {
						await fs.unlink(uploadPath + user.user_avatar_filename);
					}

					await sharp(avatarFilePath)
						.resize({ height: 200, width: 200, fit: "cover" })
						.toFile(uploadPath + newAvatarFileName);

					//await fs.unlink(avatarFilePath);

					updateQuery += `, user_avatar_filename = ?`;
					updateQueryParams.push(newAvatarFileName);
				}

				if (
					req.files.certificate_of_incoporation &&
					user_category === "Service Provider"
				) {
					let certificate = req.files.certificate_of_incoporation;
					const certificateFilePath = certificate.tempFilePath;
					const newCertificateFileName = getNewFileName(
						certificate,
						uuidv4()
					);

					if (
						await fileExists(
							uploadPath2 +
								user.certificate_of_incoporation_filename
						)
					) {
						await fs.unlink(
							uploadPath2 +
								user.certificate_of_incoporation_filename
						);
					}

					await certificate.mv(uploadPath2 + newCertificateFileName);
					//await fs.unlink(certificateFilePath);

					updateQuery += `, certificate_of_incoporation_filename = ?`;
					updateQueryParams.push(newCertificateFileName);
				}
			}

			updateQuery += ` WHERE user_id = ?`;
			updateQueryParams.push(user_id);

			await connection.execute(updateQuery, updateQueryParams);

			await connection.commit();

			res.json({
				error: false,
				message: "User updated successfully",
			});
		} catch (e) {
			//rollback
			connection ? await connection.rollback() : null;

			//delete tempfile from server
			req.files && req.files.user_avatar
				? await fs.unlink(req.files.user_avatar.tempFilePath)
				: null;
			req.files && req.files.certificate_of_incoporation
				? await fs.unlink(
						req.files.certificate_of_incoporation.tempFilePath
				  )
				: null;

			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	getUsersForDataTable: async (req, res, next) => {
		//dataTable Server-Side parameters
		var columns = [
			"user_id",
			"user_full_name",
			"user_email",
			"user_phone",
			"user_category",
			"user_avatar_filename",
			"user_created_at",
			"user_status",
		];

		var draw = parseInt(req.query.draw);
		var start = parseInt(req.query.start);
		var length = parseInt(req.query.length);
		var orderCol = req.query.order[0].column;
		var orderDir = req.query.order[0].dir;
		var search = req.query.search.value;

		var dTData = (dTNumRows = dNumRowsFiltered = where = "");
		var filter = search == "" || search == null ? false : true;
		orderCol = columns[orderCol];
		var columnsJoined = columns.join(", ");

		const { user_category, user_status } = req.query;

		let query = "SELECT * FROM users WHERE 1 = 1";
		const queryParams = [];

		if (user_category) {
			query += " AND user_category = ?";
			queryParams.push(user_category);
		}

		if (user_status) {
			query += " AND user_status = ?";
			queryParams.push(user_status);
		}

		query += " ORDER BY user_id DESC";

		let connection;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			const [rows] = await connection.execute(query, queryParams);

			dTNumRows = rows.length;

			if (filter) {
				where += "WHERE ";
				var i = 0;
				var len = columns.length - 1;

				for (var x = 0; x < columns.length; x++) {
					if (i == len) {
						where += `${columns[x]} LIKE '%${search}%'`;
					} else {
						where += `${columns[x]} LIKE '%${search}%' OR `;
					}

					i++;
				}

				const [rows1] = await connection.execute(
					`SELECT * FROM (${query})X ${where}`,
					queryParams
				);

				dNumRowsFiltered = rows1.length;
			} else {
				dNumRowsFiltered = dTNumRows;
			}

			const [rows2] = await connection.execute(
				`SELECT ${columns} FROM (${query})X ${where} ORDER BY ${orderCol} ${orderDir} LIMIT ${length} OFFSET ${start}`,
				queryParams
			);

			if (rows2.length > 0) {
				var data = [];
				var rtData = rows2;

				for (var i = 0; i < rtData.length; i++) {
					rtData[i].DT_RowId = rtData[i].user_id;
					data.push(rtData[i]);
				}

				dTData = data;
			} else {
				dTData = [];
			}

			var responseData = {
				draw: draw,
				recordsTotal: dTNumRows,
				recordsFiltered: dNumRowsFiltered,
				data: dTData,
			};

			res.send(responseData);
		} catch (e) {
			//console.log(e.message)
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	getUser: async (req, res) => {
		const userID = req.params.user_id;

		let connection;

		let query = `
            SELECT *
            FROM users
            WHERE user_id = ?
        `;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			const [users] = await connection.execute(query, [userID]);

			if (users.length === 0) {
				throw new CustomError(400, "User not found");
			}

			res.json({
				error: false,
				user: users[0],
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	deleteUser: async (req, res, next) => {
		const { user_id } = req.params;

		const query = `
            SELECT *
            FROM users
            WHERE user_id = ? 
            LIMIT 1
        `;

		let connection;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			//check if user exists
			const [users] = await connection.execute(query, [user_id]);

			if (users.length === 0) {
				throw new CustomError(400, "User does not exist");
			}
			const user = users[0];

			await connection.execute("DELETE FROM users WHERE user_id = ?", [
				user_id,
			]);

			res.json({
				error: false,
				message: "User deleted successfully",
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	becomeAProvider: async (req, res, next) => {
		const user_id = req.userDecodedData.user_id;
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

		const query = `
            SELECT *
            FROM users
            WHERE user_id = ? 
            LIMIT 1
        `;

		let connection;

		const uploadPath = "public/uploads/certificates/";

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			//Start database transaction
			await connection.beginTransaction();

			//check if email already exists
			const [users] = await connection.execute(query, [user_id]);

			if (users.length === 0) {
				throw new CustomError(404, "User does not exist");
			}

			if (users[0].user_category === "Service Provider") {
				throw new CustomError(
					400,
					"Sorry You are already a service provider"
				);
			}

			if (users[0].user_category === "Admin") {
				throw new CustomError(
					400,
					"Sorry You are already an administrator"
				);
			}

			const user = users[0];

			let updateQuery = `
                UPDATE users
                SET
                    user_category = 'Service Provider',
                    user_fb_url = ?,
                    user_instagram_url = ?,
                    user_x_url = ?,
                    user_whatsapp_url = ?,
                    user_youtube_url = ?,
                    user_linkedin_url = ?
            `;

			const updateQueryParams = [
				user_fb_url,
				user_instagram_url,
				user_x_url,
				user_whatsapp_url,
				user_youtube_url,
				user_linkedin_url,
			];

			let certificate = req.files.certificate_of_incoporation;
			const newCertificateFileName = getNewFileName(
				certificate,
				uuidv4()
			);

			if (
				await fileExists(
					uploadPath + user.certificate_of_incoporation_filename
				)
			) {
				await fs.unlink(
					uploadPath + user.certificate_of_incoporation_filename
				);
			}

			await certificate.mv(uploadPath + newCertificateFileName);

			updateQuery += `, certificate_of_incoporation_filename = ?`;
			updateQueryParams.push(newCertificateFileName);

			updateQuery += ` WHERE user_id = ?`;
			updateQueryParams.push(user_id);

			await connection.execute(updateQuery, updateQueryParams);

			await connection.commit();

			res.json({
				error: false,
				message: `Congratulations ${user.user_full_name}. You are now a service provider. Sign Out from your current account and sign back in to visit your dashboard to start posting your businesses`,
			});
		} catch (e) {
			connection ? connection.rollback() : null;
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
};
