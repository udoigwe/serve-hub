const pool = require("../utils/dbConfig");
const moment = require("moment");
const CustomError = require("../utils/CustomError");

module.exports = {
	sendMessage: async (req, res, next) => {
		const {
			message_subject,
			message_sender_name,
			message_sender_email_address,
			message_sender_phone_number,
			message,
		} = req.body;
		const provider_id = !req.body.provider_id ? null : req.body.provider_id;

		let connection;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			//insert message
			await connection.execute(
				`
                INSERT INTO messages
                (
                    provider_id,
                    message_subject,
                    message_sender_name,
                    message_sender_email_address,
                    message_sender_phone_number,
                    message
                ) VALUES (?, ?, ?, ?, ?, ?)
            `,
				[
					provider_id,
					message_subject,
					message_sender_name,
					message_sender_email_address,
					message_sender_phone_number,
					message,
				]
			);

			res.json({
				error: false,
				message: `Message sent successfully. You will get a feedback soon`,
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	getAllSubscriptions: async (req, res, next) => {
		const { subscription_plan_id, subscriber_id } = req.query;

		const page = req.query.page ? parseInt(req.query.page) : null;
		const perPage = req.query.perPage ? parseInt(req.query.perPage) : null;

		let connection;

		let query = `
            SELECT *
            FROM subscription_view
            WHERE 1 = 1
        `;
		const queryParams = [];

		let query2 = `
            SELECT COUNT(*) AS total_records 
            FROM subscription_view
            WHERE 1 = 1
        `;
		const queryParams2 = [];

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

		query += ` ORDER BY subscription_id DESC`;

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
};
