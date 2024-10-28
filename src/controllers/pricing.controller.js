const pool = require("../utils/dbConfig");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const CryptoJS = require("crypto-js");
const CustomError = require("../utils/CustomError");
const {
	getNewFileName,
	fileExists,
	uuidv4,
	slugify,
} = require("../utils/functions");
const sharp = require("sharp");
const fs = require("fs").promises;

module.exports = {
	createPricingPlan: async (req, res, next) => {
		const {
			subscription_plan_title,
			duration,
			no_of_services,
			no_of_images_per_service,
			is_featured,
			price,
			service_charge,
		} = req.body;

		const subscriptionPlanSlug = slugify(subscription_plan_title);

		const query = `
            SELECT *
            FROM subscription_plans
            WHERE subscription_plan_slug = ? 
            LIMIT 1
        `;

		let connection;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			//check if subscription plan already exists
			const [plans] = await connection.execute(query, [
				subscriptionPlanSlug,
			]);

			if (plans.length > 0) {
				throw new CustomError(400, "Plan already exists");
			}

			//add plan to database
			await connection.execute(
				`
                    INSERT INTO subscription_plans
                    (
                        subscription_plan_title,
                        subscription_plan_slug,
                        duration,
                        no_of_services,
                        no_of_images_per_service,
                        is_featured,
                        price,
                        service_charge
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `,
				[
					subscription_plan_title,
					subscriptionPlanSlug,
					duration,
					no_of_services,
					no_of_images_per_service,
					is_featured,
					price,
					service_charge,
				]
			);

			res.json({
				error: false,
				message: `Subscription Plan created successfully`,
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	updatePricingPlan: async (req, res, next) => {
		const { subscription_plan_id } = req.params;
		const {
			subscription_plan_title,
			duration,
			no_of_services,
			no_of_images_per_service,
			is_featured,
			price,
			service_charge,
			subscription_plan_status,
		} = req.body;

		const subscriptionPlanSlug = slugify(subscription_plan_title);

		const query = `
            SELECT *
            FROM subscription_plans
            WHERE subscription_plan_id = ?
            LIMIT 1
        `;

		const query2 = `
            SELECT *
            FROM subscription_plans
            WHERE subscription_plan_slug = ? 
            AND subscription_plan_id != ?
            LIMIT 1
        `;

		let connection;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			//check if plan exists
			const [plans] = await connection.execute(query, [
				subscription_plan_id,
			]);
			//check if plan title already exists
			const [exists] = await connection.execute(query2, [
				subscriptionPlanSlug,
				subscription_plan_id,
			]);

			if (plans.length === 0) {
				throw new CustomError(400, "Plan does not exist");
			}

			if (exists.length > 0) {
				throw new CustomError(
					400,
					"Plan title already exists. Choose another"
				);
			}

			let updateQuery = `
                UPDATE subscription_plans
                SET
                    subscription_plan_title = ?,
                    subscription_plan_slug = ?,
                    duration = ?,
                    no_of_services = ?,
                    no_of_images_per_service = ?,
                    is_featured = ?,
                    price = ?,
                    service_charge = ?,
                    subscription_plan_status = ?
                WHERE subscription_plan_id = ?
            `;

			const updateQueryParams = [
				subscription_plan_title,
				subscriptionPlanSlug,
				duration,
				no_of_services,
				no_of_images_per_service,
				is_featured,
				price,
				service_charge,
				subscription_plan_status,
				subscription_plan_id,
			];

			await connection.execute(updateQuery, updateQueryParams);

			res.json({
				error: false,
				message: "Pricing Plan updated successfully",
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	getPlansForDataTable: async (req, res, next) => {
		//dataTable Server-Side parameters
		var columns = [
			"subscription_plan_id ",
			"subscription_plan_title",
			"duration",
			"no_of_services",
			"no_of_images_per_service",
			"is_featured",
			"price",
			"service_charge",
			"subscription_plan_status",
			"subscription_plan_created_at",
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

		const { is_featured, subscription_plan_status } = req.query;

		let query = "SELECT * FROM subscription_plans WHERE 1 = 1";
		const queryParams = [];

		if (is_featured) {
			query += " AND is_featured = ?";
			queryParams.push(is_featured);
		}

		if (subscription_plan_status) {
			query += " AND subscription_plan_status = ?";
			queryParams.push(subscription_plan_status);
		}

		query += " ORDER BY subscription_plan_id DESC";

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
					rtData[i].DT_RowId = rtData[i].subscription_plan_id;
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
	getPricingPlan: async (req, res) => {
		const { subscription_plan_id } = req.params;

		let connection;

		let query = `
            SELECT *
            FROM subscription_plans
            WHERE subscription_plan_id = ?
        `;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			const [plans] = await connection.execute(query, [
				subscription_plan_id,
			]);

			if (plans.length === 0) {
				throw new CustomError(400, "Plan not found");
			}

			res.json({
				error: false,
				plan: plans[0],
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	deletePricingPlan: async (req, res, next) => {
		const { subscription_plan_id } = req.params;

		const query = `
            SELECT *
            FROM subscription_plans
            WHERE subscription_plan_id = ? 
            LIMIT 1
        `;

		let connection;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			//check if plan exists
			const [plans] = await connection.execute(query, [
				subscription_plan_id,
			]);

			if (plans.length === 0) {
				throw new CustomError(400, "Plan does not exist");
			}
			const plan = plans[0];

			await connection.execute(
				"DELETE FROM subscription_plans WHERE subscription_plan_id = ?",
				[subscription_plan_id]
			);

			res.json({
				error: false,
				message: "Subscription Plan deleted successfully",
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
};
