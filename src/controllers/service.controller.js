const pool = require("../utils/dbConfig");
const moment = require("moment");
const CustomError = require("../utils/CustomError");
const fs = require("fs").promises;
const sharp = require("sharp");
const {
	slugify,
	fileExists,
	getNewFileName,
	uuidv4,
} = require("../utils/functions");

module.exports = {
	createServiceCategory: async (req, res, next) => {
		const { service_category } = req.body;

		const query = `
            SELECT *
            FROM service_categories
            WHERE service_category = ?
            LIMIT 1
        `;

		let connection;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			//check if news category exists
			const [categories] = await connection.execute(query, [
				service_category,
			]);

			if (categories.length > 0) {
				throw new CustomError(
					400,
					"Service Category Name already exists"
				);
			}

			const serviceCategorySlug = slugify(service_category);

			//add service category to database
			await connection.execute(
				`
                    INSERT INTO service_categories
                    (
                        service_category,
                        service_category_slug
                    )
                    VALUES (?, ?)
                `,
				[service_category, serviceCategorySlug]
			);

			res.json({
				error: false,
				message: `Service Category created successfully`,
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	updateServiceCategory: async (req, res, next) => {
		const { service_category_id } = req.params;
		const { service_category, service_category_status } = req.body;

		const query = `
            SELECT *
            FROM service_categories
            WHERE service_category_id = ?
            LIMIT 1
        `;

		const query2 = `
            SELECT *
            FROM service_categories
            WHERE service_category = ? 
            AND service_category_id != ?
            LIMIT 1
        `;

		let connection;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			//check if service category exists
			const [categories] = await connection.execute(query, [
				service_category_id,
			]);
			//check if new service category name already exists
			const [exists] = await connection.execute(query2, [
				service_category,
				service_category_id,
			]);

			if (categories.length === 0) {
				throw new CustomError(400, "Service category does not exist");
			}

			if (exists.length > 0) {
				throw new CustomError(
					400,
					"The Service category name already exist"
				);
			}

			const serviceCategorySlug = slugify(service_category);

			let updateQuery = `
                UPDATE service_categories
                SET
                    service_category = ?,
                    service_category_slug = ?,
                    service_category_status = ?
                WHERE service_category_id = ?
            `;

			const updateQueryParams = [
				service_category,
				serviceCategorySlug,
				service_category_status,
				service_category_id,
			];

			await connection.execute(updateQuery, updateQueryParams);

			res.json({
				error: false,
				message: "Service category updated successfully",
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	deleteServiceCategory: async (req, res, next) => {
		const { service_category_id } = req.params;

		const query = `
            SELECT *
            FROM service_categories
            WHERE service_category_id = ? 
            LIMIT 1
        `;

		let connection;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			//check if category exists
			const [categories] = await connection.execute(query, [
				service_category_id,
			]);

			if (categories.length === 0) {
				throw new CustomError(400, "Service category does not exist");
			}
			const category = categories[0];

			await connection.execute(
				"DELETE FROM service_categories WHERE service_category_id = ?",
				[service_category_id]
			);

			res.json({
				error: false,
				message: "Service category deleted successfully",
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	getNewsCategories: async (req, res, next) => {
		const { news_category_status } = req.query;

		const page = req.query.page ? parseInt(req.query.page) : null;
		const perPage = req.query.perPage ? parseInt(req.query.perPage) : null;

		let connection;

		let query = `
            SELECT *
            FROM news_categories
            WHERE 1 = 1
        `;
		const queryParams = [];

		let query2 = `
            SELECT COUNT(*) AS total_records 
            FROM news_categories
            WHERE 1 = 1
        `;
		const queryParams2 = [];

		if (news_category_status) {
			query += " AND news_category_status = ?";
			queryParams.push(news_category_status);

			query2 += " AND news_category_status = ?";
			queryParams2.push(news_category_status);
		}

		query += ` ORDER BY news_category_id DESC`;

		if (page && perPage) {
			const offset = (page - 1) * perPage;
			query += ` LIMIT ?, ?`;
			queryParams.push(offset);
			queryParams.push(perPage);
		}

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			const [data] = await connection.execute(query, queryParams);
			const [total] = await connection.execute(query2, queryParams2);

			/***************** get count of all posts in each category ****************/
			for (let i = 0; i < data.length; i++) {
				const category = data[i];
				const [categories] = await connection.execute(
					`
                    SELECT COUNT(*) AS post_count
                    FROM news
                    WHERE news_category_id = ?
                `,
					[category.news_category_id]
				);

				category.post_count = categories[0].post_count;
			}

			//total records
			const totalRecords = parseInt(total[0].total_records);

			// Calculate total pages if perPage is specified
			const totalPages = perPage
				? Math.ceil(totalRecords / perPage)
				: null;

			// Calculate next and previous pages based on provided page and totalPages
			const nextPage =
				page && totalPages && page < totalPages ? page + 1 : null;
			const prevPage = page && page > 1 ? page - 1 : null;

			res.json({
				error: false,
				data,
				paginationData: {
					totalRecords,
					totalPages,
					currentPage: page,
					itemsPerPage: perPage,
					nextPage,
					prevPage,
				},
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	getServiceCategoriesForDataTable: async (req, res, next) => {
		//dataTable Server-Side parameters
		var columns = [
			"service_category_id",
			"service_category",
			"service_category_status",
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

		const { service_category_status } = req.query;

		let query = "SELECT * FROM service_categories WHERE 1 = 1";
		const queryParams = [];

		if (service_category_status) {
			query += " AND service_category_status = ?";
			queryParams.push(service_category_status);
		}

		query += " ORDER BY service_category_id DESC";

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
					rtData[i].DT_RowId = rtData[i].service_category_id;
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
	getServiceCategories: async (req, res, next) => {
		const { service_category_status } = req.query;

		const page = req.query.page ? parseInt(req.query.page) : null;
		const perPage = req.query.perPage ? parseInt(req.query.perPage) : null;

		let connection;

		let query = `
            SELECT *
            FROM service_categories
            WHERE 1 = 1
        `;
		const queryParams = [];

		let query2 = `
            SELECT COUNT(*) AS total_records 
            FROM service_categories
            WHERE 1 = 1
        `;
		const queryParams2 = [];

		if (service_category_status) {
			query += " AND service_category_status = ?";
			queryParams.push(service_category_status);

			query2 += " AND service_category_status = ?";
			queryParams2.push(service_category_status);
		}

		query += ` ORDER BY service_category_id DESC`;

		if (page && perPage) {
			const offset = (page - 1) * perPage;
			query += ` LIMIT ?, ?`;
			queryParams.push(offset);
			queryParams.push(perPage);
		}

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			const [data] = await connection.execute(query, queryParams);
			const [total] = await connection.execute(query2, queryParams2);

			//total records
			const totalRecords = parseInt(total[0].total_records);

			// Calculate total pages if perPage is specified
			const totalPages = perPage
				? Math.ceil(totalRecords / perPage)
				: null;

			// Calculate next and previous pages based on provided page and totalPages
			const nextPage =
				page && totalPages && page < totalPages ? page + 1 : null;
			const prevPage = page && page > 1 ? page - 1 : null;

			res.json({
				error: false,
				data,
				paginationData: {
					totalRecords,
					totalPages,
					currentPage: page,
					itemsPerPage: perPage,
					nextPage,
					prevPage,
				},
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	getServiceCategory: async (req, res, next) => {
		const { service_category_id } = req.params;

		let connection;

		let query = `
            SELECT *
            FROM service_categories
            WHERE service_category_id = ?
        `;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			const [categories] = await connection.execute(query, [
				service_category_id,
			]);

			if (categories.length === 0) {
				throw new CustomError(400, "Service Category not found");
			}

			res.json({
				error: false,
				category: categories[0],
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	createNewService: async (req, res, next) => {
		const providerID = req.userDecodedData.user_id;
		const {
			service_category_id,
			service_title,
			service_price,
			service_description,
			service_address,
		} = req.body;
		const service_discount_rate = !req.body.service_discount_rate
			? null
			: req.body.service_discount_rate;
		const service_location_y = !req.body.service_location_y
			? null
			: req.body.service_location_y;
		const service_location_x = !req.body.service_location_x
			? null
			: req.body.service_location_x;
		const service_youtube_video_url = !req.body.service_youtube_video_url
			? null
			: req.body.service_youtube_video_url;
		const uploadPath = "public/uploads/service-gallery/";
		let images = req.files.images;
		const now = moment().format("YYYY-MM-DD HH:mm:ss");

		let connection;

		//fetch subscription details
		let query = `
			SELECT *
			FROM subscription_view
			WHERE subscriber_id = ?
			ORDER BY subscription_id DESC
			LIMIT 1
		`;
		const queryParams = [providerID];

		//fetch number of services with the current subscription plan ID
		let query2 = `
			SELECT COUNT(*) AS service_count
			FROM service_view
			WHERE subscriber_id = ${providerID}
			AND subscription_plan_id = ?
		`;
		const queryParams2 = [];

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			//start db transaction
			await connection.beginTransaction();

			//check subscription details
			const [subscriptions] = await connection.execute(
				query,
				queryParams
			);

			if (subscriptions.length === 0) {
				throw new CustomError(
					404,
					"You do not have any active subscription to post this service"
				);
			}

			const subscription = subscriptions[0];
			const serviceSlug = slugify(service_title);
			queryParams2.push(subscription.subscription_plan_id);

			const [services] = await connection.execute(query2, queryParams2);

			if (
				parseInt(subscription.no_of_services) ===
				parseInt(services[0].service_count)
			) {
				throw new CustomError(
					400,
					"Sorry!!! You have reached the limit your subscription plan can carry. Consider an upgrade."
				);
			}

			if (!Array.isArray(images)) {
				// If only one image is uploaded, wrap it in an array
				images = [images];
			}

			if (
				images.length >
				parseInt(subscriptions[0].no_of_images_per_service)
			) {
				throw new CustomError(
					400,
					"Sorry!!! You have exceeded the limit of images your subscription plan can carry. Consider an upgrade."
				);
			}

			//insert service into db
			const [newService] = await connection.execute(
				`
				INSERT INTO services
				(
					subscription_id,
					service_category_id,
					service_title,
					service_slug,
					service_price,
					service_discount_rate,
					service_description,
					service_address,
					service_location_y,
					service_location_x,
					service_youtube_video_url,
					service_created_at
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`,
				[
					subscription.subscription_id,
					service_category_id,
					service_title,
					serviceSlug,
					service_price,
					service_discount_rate,
					service_description,
					service_address,
					service_location_y,
					service_location_x,
					service_youtube_video_url,
					now,
				]
			);

			const serviceID = newService.insertId;

			//insert images into database
			for (let i = 0; i < images.length; i++) {
				const file = images[i];
				const filePath = file.tempFilePath;
				const newFileName = getNewFileName(file, `${uuidv4()}`);

				//resize avatar image file and upload it
				await sharp(filePath)
					.resize({ height: 600, width: 600, fit: "cover" })
					.toFile(uploadPath + newFileName);
				//delete avatar temp file
				//await fs.unlink(filePath);

				//insert file reference into db
				await connection.execute(
					`
                    INSERT INTO service_images
                    (
                        service_id,
                        service_image_filename,
                        service_image_mimetype,
                        service_image_size,
                        service_image_created_at
                    ) VALUES (?, ?, ?, ?, ?)
                `,
					[serviceID, newFileName, file.mimetype, file.size, now]
				);
			}

			//commit db transaction
			await connection.commit();

			res.json({
				error: false,
				message: `Service created successfully`,
			});
		} catch (e) {
			connection ? connection.rollback() : null;
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	getServices: async (req, res, next) => {
		const {
			service_category_id,
			service_status,
			subscription_plan_id,
			subscriber_id,
			is_featured,
		} = req.query;

		const page = req.query.page ? parseInt(req.query.page) : null;
		const perPage = req.query.perPage ? parseInt(req.query.perPage) : null;

		let connection;

		let query = `
            SELECT *
            FROM service_view
            WHERE 1 = 1
        `;
		const queryParams = [];

		let query2 = `
            SELECT COUNT(*) AS total_records 
            FROM service_view
            WHERE 1 = 1
        `;
		const queryParams2 = [];

		if (service_category_id) {
			query += " AND service_category_id = ?";
			queryParams.push(service_category_id);

			query2 += " AND service_category_id = ?";
			queryParams2.push(service_category_id);
		}
		if (service_status) {
			query += " AND service_status = ?";
			queryParams.push(service_status);

			query2 += " AND service_status = ?";
			queryParams2.push(service_status);
		}
		if (subscription_plan_id) {
			query += " AND subscription_plan_id = ?";
			queryParams.push(subscription_plan_id);

			query2 += " AND subscription_plan_id = ?";
			queryParams2.push(subscription_plan_id);
		}
		if (subscriber_id) {
			query += " AND subscriber_id = ?";
			queryParams.push(subscriber_id);

			query2 += " AND subscriber_id = ?";
			queryParams2.push(subscriber_id);
		}
		if (is_featured) {
			query += " AND is_featured = ?";
			queryParams.push(is_featured);

			query2 += " AND is_featured = ?";
			queryParams2.push(is_featured);
		}

		query += ` ORDER BY service_id DESC`;

		if (page && perPage) {
			const offset = (page - 1) * perPage;
			query += ` LIMIT ?, ?`;
			queryParams.push(offset);
			queryParams.push(perPage);
		}

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			const [data] = await connection.execute(query, queryParams);
			const [total] = await connection.execute(query2, queryParams2);

			//get uploaded images for each service
			for (let i = 0; i < data.length; i++) {
				const service = data[i];
				const [ratings] = await connection.execute(
					`
					SELECT ROUND(AVG(rating), 1) AS average_rating
            		FROM reviews_view
					WHERE service_id = ?
				`,
					[service.service_id]
				);
				const [images] = await connection.execute(
					`
                    SELECT *
                    FROM service_images
                    WHERE service_id = ?
					AND service_image_status = 'Published'
                `,
					[service.service_id]
				);
				service.service_images = images;
				service.average_rating = ratings[0].average_rating;
			}

			//total records
			const totalRecords = parseInt(total[0].total_records);

			// Calculate total pages if perPage is specified
			const totalPages = perPage
				? Math.ceil(totalRecords / perPage)
				: null;

			// Calculate next and previous pages based on provided page and totalPages
			const nextPage =
				page && totalPages && page < totalPages ? page + 1 : null;
			const prevPage = page && page > 1 ? page - 1 : null;

			res.json({
				error: false,
				data,
				paginationData: {
					totalRecords,
					totalPages,
					currentPage: page,
					itemsPerPage: perPage,
					nextPage,
					prevPage,
				},
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	getService: async (req, res, next) => {
		const serviceID = req.params.service_id;

		let connection;

		let query = `
            SELECT *
            FROM service_view
            WHERE service_id = ?
			LIMIT 1
        `;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			const [services] = await connection.execute(query, [serviceID]);

			if (services.length === 0) {
				throw new CustomError(400, "Service not found");
			}

			const service = services[0];
			const [ratings] = await connection.execute(
				`
					SELECT ROUND(AVG(rating), 1) AS average_rating
            		FROM reviews_view
					WHERE service_id = ?
				`,
				[serviceID]
			);
			const [images] = await connection.execute(
				`
                    SELECT *
                    FROM service_images
                    WHERE service_id = ?
					AND service_image_status = 'Published'
                `,
				[serviceID]
			);
			service.service_images = images;
			service.average_rating = ratings[0].average_rating;

			res.json({
				error: false,
				service,
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	updateService: async (req, res, next) => {
		const providerID = req.userDecodedData.user_id;
		const serviceID = req.params.service_id;
		const {
			service_category_id,
			service_title,
			service_price,
			service_description,
			service_address,
			service_status,
		} = req.body;
		const service_discount_rate = !req.body.service_discount_rate
			? null
			: req.body.service_discount_rate;
		const service_location_y = !req.body.service_location_y
			? null
			: req.body.service_location_y;
		const service_location_x = !req.body.service_location_x
			? null
			: req.body.service_location_x;
		const service_youtube_video_url = !req.body.service_youtube_video_url
			? null
			: req.body.service_youtube_video_url;
		const uploadPath = "public/uploads/service-gallery/";
		const now = moment().format("YYYY-MM-DD HH:mm:ss");
		const Now = moment();

		let connection;

		//fetch subscription details
		let query = `
			SELECT *
			FROM subscription_view
			WHERE subscriber_id = ?
			ORDER BY subscription_id DESC
			LIMIT 1
		`;
		const queryParams = [providerID];

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			//start db transaction
			await connection.beginTransaction();

			//check subscription details
			const [subscriptions] = await connection.execute(
				query,
				queryParams
			);

			if (subscriptions.length === 0) {
				throw new CustomError(
					404,
					"You do not have any active subscription to update this service"
				);
			}

			const subscription = subscriptions[0];

			//check if subscription is expired
			if (Now.isAfter(moment(subscription.expires_at))) {
				throw new CustomError(
					400,
					"Sorry!!! Your current subscription has expired. Please consider updgrading or resubscribing"
				);
			}
			const serviceSlug = slugify(service_title);

			//update service into db
			await connection.execute(
				`
				UPDATE services
				SET
					service_category_id = ?,
					service_title = ?,
					service_slug = ?,
					service_price = ?,
					service_discount_rate = ?,
					service_description = ?,
					service_address = ?,
					service_location_y = ?,
					service_location_x = ?,
					service_youtube_video_url = ?,
					service_status = ?
				WHERE service_id = ?
			`,
				[
					service_category_id,
					service_title,
					serviceSlug,
					service_price,
					service_discount_rate,
					service_description,
					service_address,
					service_location_y,
					service_location_x,
					service_youtube_video_url,
					service_status,
					serviceID,
				]
			);

			if (req.files && req.files.images) {
				let images = req.files.images;

				if (!Array.isArray(images)) {
					// If only one image is uploaded, wrap it in an array
					images = [images];
				}

				if (
					images.length >
					parseInt(subscriptions[0].no_of_images_per_service)
				) {
					throw new CustomError(
						400,
						"Sorry!!! You have exceeded the limit of images your subscription plan can carry. Consider an upgrade."
					);
				}

				//delete already existing images
				await connection.execute(
					`
						DELETE FROM service_images WHERE service_id = ?
					`,
					[serviceID]
				);

				//insert images into database
				for (let i = 0; i < images.length; i++) {
					const file = images[i];
					const filePath = file.tempFilePath;
					const newFileName = getNewFileName(file, `${uuidv4()}`);

					//resize avatar image file and upload it
					await sharp(filePath)
						.resize({ height: 600, width: 600, fit: "cover" })
						.toFile(uploadPath + newFileName);
					//delete avatar temp file
					//await fs.unlink(filePath);

					//insert file reference into db
					await connection.execute(
						`
						INSERT INTO service_images
						(
							service_id,
							service_image_filename,
							service_image_mimetype,
							service_image_size,
							service_image_created_at
						) VALUES (?, ?, ?, ?, ?)
					`,
						[serviceID, newFileName, file.mimetype, file.size, now]
					);
				}
			}

			//commit db transaction
			await connection.commit();

			res.json({
				error: false,
				message: `Service updated successfully`,
			});
		} catch (e) {
			connection ? connection.rollback() : null;
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	deleteService: async (req, res, next) => {
		const { service_id } = req.params;

		const query = `
            SELECT *
            FROM service_view
            WHERE service_id = ? 
            LIMIT 1
        `;
		const queryParams = [service_id];

		let connection;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			//start transaction
			await connection.beginTransaction();

			//check if service exists
			const [services] = await connection.execute(query, queryParams);

			if (services.length === 0) {
				throw new CustomError(400, "Service does not exist");
			}

			await connection.execute(
				"DELETE FROM services WHERE service_id = ?",
				[service_id]
			);

			res.json({
				error: false,
				message: "Service deleted successfully",
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	serviceBooking: async (req, res, next) => {
		const {
			client_fullname,
			client_email,
			client_phone,
			client_address,
			service_start_time,
			service_end_time,
			service_id,
			transaction_id,
			amount,
		} = req.body;

		const remarks = !req.body.remarks ? null : req.body.remarks;

		let connection;

		let query = `
			SELECT *
			FROM service_view
			WHERE service_id = ?
			LIMIT 1
		`;
		const queryParams = [service_id];

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			//check if service exists
			const [services] = await connection.execute(query, queryParams);

			if (services.length === 0) {
				throw new CustomError(404, "Service does not exist");
			}

			const service = services[0];
			const serviceCharge =
				parseFloat(service.service_charge) * 0.01 * parseFloat(amount);
			const expectedPayout = parseFloat(amount) - serviceCharge;

			//insert booking into db
			await connection.execute(
				`
				INSERT INTO service_bookings 
				(
					service_id,
					start_time,
					end_time,
					client_fullname,
					client_email,
					client_phone,
					client_address,
					remarks,
					amount_paid,
					transaction_id,
					expected_payout
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`,
				[
					service_id,
					service_start_time,
					service_end_time,
					client_fullname,
					client_email,
					client_phone,
					client_address,
					remarks,
					amount,
					transaction_id,
					expectedPayout,
				]
			);

			res.json({
				error: false,
				message: `Service has been booked successfully.`,
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	getServiceBookings: async (req, res, next) => {
		const {
			provider_id,
			service_id,
			booking_status,
			payout_status,
			service_category_id,
		} = req.query;

		const page = req.query.page ? parseInt(req.query.page) : null;
		const perPage = req.query.perPage ? parseInt(req.query.perPage) : null;

		let connection;

		let query = `
            SELECT *
            FROM service_bookings_view
            WHERE 1 = 1
        `;
		const queryParams = [];

		let query2 = `
            SELECT COUNT(*) AS total_records 
            FROM service_bookings_view
            WHERE 1 = 1
        `;
		const queryParams2 = [];

		if (provider_id) {
			query += " AND provider_id = ?";
			queryParams.push(provider_id);

			query2 += " AND provider_id = ?";
			queryParams2.push(provider_id);
		}
		if (service_id) {
			query += " AND service_id = ?";
			queryParams.push(service_id);

			query2 += " AND service_id = ?";
			queryParams2.push(service_id);
		}
		if (booking_status) {
			query += " AND booking_status = ?";
			queryParams.push(booking_status);

			query2 += " AND booking_status = ?";
			queryParams2.push(booking_status);
		}
		if (payout_status) {
			query += " AND payout_status = ?";
			queryParams.push(payout_status);

			query2 += " AND payout_status = ?";
			queryParams2.push(payout_status);
		}
		if (service_category_id) {
			query += " AND service_category_id = ?";
			queryParams.push(service_category_id);

			query2 += " AND service_category_id = ?";
			queryParams2.push(service_category_id);
		}

		query += ` ORDER BY service_booking_id DESC`;

		if (page && perPage) {
			const offset = (page - 1) * perPage;
			query += ` LIMIT ?, ?`;
			queryParams.push(offset);
			queryParams.push(perPage);
		}

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			const [data] = await connection.execute(query, queryParams);
			const [total] = await connection.execute(query2, queryParams2);

			//total records
			const totalRecords = parseInt(total[0].total_records);

			// Calculate total pages if perPage is specified
			const totalPages = perPage
				? Math.ceil(totalRecords / perPage)
				: null;

			// Calculate next and previous pages based on provided page and totalPages
			const nextPage =
				page && totalPages && page < totalPages ? page + 1 : null;
			const prevPage = page && page > 1 ? page - 1 : null;

			res.json({
				error: false,
				data,
				paginationData: {
					totalRecords,
					totalPages,
					currentPage: page,
					itemsPerPage: perPage,
					nextPage,
					prevPage,
				},
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	postReview: async (req, res, next) => {
		const reviewerID = req.userDecodedData.user_id;
		const { service_id, review, rating, review_title } = req.body;

		let connection;

		let query = `
			SELECT *
			FROM reviews
			WHERE service_id = ?
			AND reviewer_id = ?
			LIMIT 1
		`;
		const queryParams = [service_id, reviewerID];

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			const [reviews] = await connection.execute(query, queryParams);

			if (reviews.length > 0) {
				//review already exists for this service and reviewer; update review
				await connection.execute(
					`
					UPDATE reviews
					SET
						review_title = ?,
						review = ?,
						rating = ?,
						reviewed_at = CURRENT_TIMESTAMP
					WHERE service_id = ?
					AND reviewer_id = ?
				`,
					[review_title, review, rating, service_id, reviewerID]
				);

				res.json({
					error: false,
					message: "Thank you for your review",
				});
			} else {
				//review does not exist for this service and reviewer. Insert review
				await connection.execute(
					`
					INSERT INTO reviews
					(
						service_id,
						reviewer_id,
						review_title,
						review,
						rating
					) VALUES (?, ?, ?, ?, ?)
				`,
					[service_id, reviewerID, review_title, review, rating]
				);

				res.json({
					error: false,
					message: "Thank you for your review",
				});
			}
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	updateBookingStatus: async (req, res, next) => {
		const { service_booking_id, booking_status } = req.body;

		let connection;

		let query = `
			SELECT *
			FROM service_bookings_view
			WHERE service_booking_id = ?
			LIMIT 1
		`;
		const queryParams = [service_booking_id];

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			const [bookings] = await connection.execute(query, queryParams);

			if (bookings.length === 0) {
				throw new CustomError(404, "Booking does not exist");
			}

			let updateQuery =
				booking_status !== "Completed"
					? `
				UPDATE service_bookings
					SET
						booking_status = ?
					WHERE service_booking_id = ?
			`
					: `
				UPDATE service_bookings
					SET
						payout_status = 'Scheduled For Payout',
						booking_status = ?
					WHERE service_booking_id = ?
			`;

			//update service booking status
			await connection.execute(updateQuery, [
				booking_status,
				service_booking_id,
			]);

			res.json({
				error: false,
				message: "Booking Status updated successfully",
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	/*createNews: async (req, res, next) => {
		const newsAuthorID = req.userDecodedData.user_id;
		const { news_category_id, news_title, news_body, news_tags } = req.body;

		const now = Math.floor(Date.now() / 1000);
		const uploadPath = "public/images/news/";
		const acceptedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];

		const query = `
            SELECT *
            FROM news_categories
            WHERE news_category_id = ?
            LIMIT 1
        `;

		let connection;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			//check if news category exists
			const [categories] = await connection.execute(query, [
				news_category_id,
			]);

			if (categories.length === 0) {
				throw new CustomError(400, "News category does not exist");
			}

			if (!req.files || !req.files.cover_image) {
				throw new CustomError(
					400,
					"Please proive a cover image for this post"
				);
			}

			if (
				acceptedMimeTypes.indexOf(req.files.cover_image.mimetype) == -1
			) {
				throw new CustomError(
					400,
					"File attachment must be a jpg or png file"
				);
			}

			if (req.files.cover_image.size > 1000000) {
				throw new CustomError(
					400,
					"File attachment must not be more than 1MB in size"
				);
			}

			const newsSlug = slugify(news_title);
			const file = req.files.cover_image;
			const filename = file.name;
			const fileMimeType = file.mimetype;
			const filePath = file.tempFilePath;
			const extensionPosition = filename.lastIndexOf(".");
			const extension = filename.substr(extensionPosition).toLowerCase();
			const newFileName = now + extension;

			//upload album cover image
			await sharp(filePath)
				.resize({ height: 600, width: 1200, fit: "cover" })
				.toFile(uploadPath + newFileName);

			//delete tempfile from server
			await fs.unlink(filePath);

			//add artist to database
			await connection.execute(
				`
                    INSERT INTO news
                    (
                        news_category_id,
                        news_author_id,
                        news_title,
                        news_slug,
                        news_body,
                        news_tags,
                        news_cover_image,
                        news_created_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `,
				[
					news_category_id,
					newsAuthorID,
					news_title,
					newsSlug,
					news_body,
					news_tags,
					newFileName,
					now,
				]
			);

			res.json({
				error: false,
				message: `Post created successfully`,
			});
		} catch (e) {
			//delete tempfile from server
			req.files
				? await fs.unlink(req.files.cover_image.tempFilePath)
				: null;

			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	updateNews: async (req, res, next) => {
		const newsID = req.params.news_id;
		const {
			news_category_id,
			news_title,
			news_body,
			news_tags,
			news_status,
		} = req.body;

		const now = Math.floor(Date.now() / 1000);
		const uploadPath = "public/images/news/";
		const acceptedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];

		const query = `
            SELECT *
            FROM news
            WHERE news_id = ?
            LIMIT 1
        `;

		const query2 = `
            SELECT *
            FROM news_categories
            WHERE news_category_id = ? 
            LIMIT 1
        `;

		let connection;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			//Start database transaction
			await connection.beginTransaction();

			//check if post exists
			const [posts] = await connection.execute(query, [newsID]);
			//check if news category exists
			const [categories] = await connection.execute(query2, [
				news_category_id,
			]);

			if (posts.length === 0) {
				throw new CustomError(400, "News post does not exist");
			}

			if (categories.length === 0) {
				throw new CustomError(400, "News category does not exist");
			}

			const post = posts[0];
			const newsSlug = slugify(news_title);

			let updateQuery = `
                UPDATE news
                SET
                    news_category_id = ?,
                    news_title = ?,
                    news_slug = ?,
                    news_body = ?,
                    news_tags = ?,
                    news_status = ?
            `;

			const updateQueryParams = [
				news_category_id,
				news_title,
				newsSlug,
				news_body,
				news_tags,
				news_status,
			];

			if (req.files) {
				if (
					acceptedMimeTypes.indexOf(req.files.cover_image.mimetype) ==
					-1
				) {
					throw new CustomError(
						400,
						"Image file must be a png or jpg file"
					);
				}

				if (req.files.cover_image.size > 1000000) {
					throw new CustomError(
						400,
						"Image file must not be more than 1MB in size"
					);
				}

				const file = req.files.cover_image;
				const filename = file.name;
				const filePath = file.tempFilePath;
				const extensionPosition = filename.lastIndexOf(".");
				const extension = filename
					.substr(extensionPosition)
					.toLowerCase();
				const newFileName = now + extension;

				if (await fileExists(uploadPath + post.news_cover_image)) {
					await fs.unlink(uploadPath + post.news_cover_image);
				}

				await sharp(filePath)
					.resize({ height: 600, width: 1200, fit: "cover" })
					.toFile(uploadPath + newFileName);

				await fs.unlink(filePath);

				updateQuery += `, news_cover_image = ?`;
				updateQueryParams.push(newFileName);
			}

			updateQuery += ` WHERE news_id = ?`;
			updateQueryParams.push(newsID);

			await connection.execute(updateQuery, updateQueryParams);

			await connection.commit();

			res.json({
				error: false,
				message: "News post updated successfully",
			});
		} catch (e) {
			//rollback
			connection ? await connection.rollback() : null;

			//delete tempfile from server
			req.files
				? await fs.unlink(req.files.cover_image.tempFilePath)
				: null;

			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	deleteNews: async (req, res, next) => {
		const newsID = req.params.news_id;

		const query = `
            SELECT *
            FROM news
            WHERE news_id = ? 
            LIMIT 1
        `;

		const uploadPath = "public/images/news/";

		let connection;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			//check if news exists
			const [posts] = await connection.execute(query, [newsID]);

			if (posts.length === 0) {
				throw new CustomError(400, "Post does not exist");
			}
			const post = posts[0];

			//delete the news cover image if exists
			if (await fileExists(uploadPath + post.news_cover_image)) {
				await fs.unlink(uploadPath + post.news_cover_image);
			}

			await connection.execute("DELETE FROM news WHERE news_id = ?", [
				newsID,
			]);

			res.json({
				error: false,
				message: "Post deleted successfully",
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	getPosts: async (req, res, next) => {
		const { news_category_id, news_author_id, news_status, tag } =
			req.query;

		const page = req.query.page ? parseInt(req.query.page) : null;
		const perPage = req.query.perPage ? parseInt(req.query.perPage) : null;

		let connection;

		let query = `
            SELECT *
            FROM news_view
            WHERE 1 = 1
        `;
		const queryParams = [];

		let query2 = `
            SELECT COUNT(*) AS total_records 
            FROM news_view
            WHERE 1 = 1
        `;
		const queryParams2 = [];

		if (news_category_id) {
			query += " AND news_category_id = ?";
			queryParams.push(news_category_id);

			query2 += " AND news_category_id = ?";
			queryParams2.push(news_category_id);
		}

		if (news_author_id) {
			query += " AND news_author_id = ?";
			queryParams.push(news_author_id);

			query2 += " AND news_author_id = ?";
			queryParams2.push(news_author_id);
		}

		if (news_status) {
			query += " AND news_status = ?";
			queryParams.push(news_status);

			query2 += " AND news_status = ?";
			queryParams2.push(news_status);
		}

		if (tag) {
			query += " AND FIND_IN_SET(?, news_tags)";
			queryParams.push(tag);

			query2 += " AND FIND_IN_SET(?, news_tags)";
			queryParams2.push(tag);
		}

		query += ` ORDER BY news_id DESC`;

		if (page && perPage) {
			const offset = (page - 1) * perPage;
			query += ` LIMIT ?, ?`;
			queryParams.push(offset);
			queryParams.push(perPage);
		}

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			const [data] = await connection.execute(query, queryParams);
			const [total] = await connection.execute(query2, queryParams2);

			//total records
			const totalRecords = parseInt(total[0].total_records);

			// Calculate total pages if perPage is specified
			const totalPages = perPage
				? Math.ceil(totalRecords / perPage)
				: null;

			// Calculate next and previous pages based on provided page and totalPages
			const nextPage =
				page && totalPages && page < totalPages ? page + 1 : null;
			const prevPage = page && page > 1 ? page - 1 : null;

			res.json({
				error: false,
				data,
				paginationData: {
					totalRecords,
					totalPages,
					currentPage: page,
					itemsPerPage: perPage,
					nextPage,
					prevPage,
				},
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	getArticlesForDataTable: async (req, res, next) => {
		//dataTable Server-Side parameters
		var columns = [
			"news_id",
			"news_category_id",
			"news_author_id",
			"news_title",
			"news_tags",
			"news_created_at",
			"news_status",
			"user_name",
			"news_category_name",
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

		const { news_category_id, news_author_id, news_status } = req.query;

		let query = "SELECT * FROM news_view WHERE 1 = 1";
		const queryParams = [];

		if (news_category_id) {
			query += " AND news_category_id = ?";
			queryParams.push(news_category_id);
		}

		if (news_author_id) {
			query += " AND news_author_id = ?";
			queryParams.push(news_author_id);
		}

		if (news_status) {
			query += " AND news_status = ?";
			queryParams.push(news_status);
		}

		query += " ORDER BY news_id DESC";

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
					rtData[i].DT_RowId = rtData[i].news_id;
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
	getPost: async (req, res, next) => {
		const newsID = req.params.news_id;

		let connection;

		let query = `
            SELECT *
            FROM news_view
            WHERE news_id = ?
        `;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			const [posts] = await connection.execute(query, [newsID]);

			if (posts.length === 0) {
				throw new CustomError(400, "Post not found");
			}

			res.json({
				error: false,
				post: posts[0],
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	}, */
};
