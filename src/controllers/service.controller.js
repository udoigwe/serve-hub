const pool = require("../utils/dbConfig");
const moment = require("moment");
const CustomError = require("../utils/CustomError");
const fs = require("fs").promises;
const sharp = require("sharp");
const { slugify, fileExists } = require("../utils/functions");

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
