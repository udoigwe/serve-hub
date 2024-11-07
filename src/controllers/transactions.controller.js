const pool = require("../utils/dbConfig");
const moment = require("moment");
const CustomError = require("../utils/CustomError");

module.exports = {
	verifySubscriptionPayment: async (req, res, next) => {
		const { subscription_plan_id, amount, subscriber_id, transaction_id } =
			req.body;

		let connection;
		let differenceInSeconds = 0;

		let query = `
            SELECT *
            FROM subscription_plans
            WHERE subscription_plan_id = ?
            LIMIT 1
        `;
		const queryParams = [subscription_plan_id];

		let query2 = `
            SELECT *
            FROM users
            WHERE user_id = ?
            LIMIT 1
        `;
		const queryParams2 = [subscriber_id];

		let query3 = `
            SELECT *
            FROM subscriptions
            WHERE subscriber_id = ?
            ORDER BY subscription_id DESC
            LIMIT 1
        `;
		const queryParams3 = [subscriber_id];

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			const [plans] = await connection.execute(query, queryParams);
			const [users] = await connection.execute(query2, queryParams2);
			const [subscriptions] = await connection.execute(
				query3,
				queryParams3
			);

			if (plans.length === 0) {
				throw new CustomError(
					404,
					`The selected Subscription plan does not exist`
				);
			}

			if (plans.length === 0) {
				throw new CustomError(404, `User does not exist`);
			}

			if (subscriptions.length > 0) {
				const now = moment();
				const subscription = subscriptions[0];
				const expectedExpirationTime = moment(subscription.expires_at);

				// Set difference in seconds if now is before stored timestamp, otherwise keep it 0
				if (now.isBefore(expectedExpirationTime)) {
					differenceInSeconds = expectedExpirationTime.diff(
						now,
						"seconds"
					);
				}
			}

			const plan = plans[0];
			const user = users[0];

			const expiration = moment().add(
				parseInt(plan.duration + differenceInSeconds),
				"seconds"
			);
			const subscribedAt = moment().format("YYYY-MM-DD HH:mm:ss");
			const expiresAt = expiration.format("YYYY-MM-DD HH:mm:ss");

			//insert subscription
			await connection.execute(
				`
                INSERT INTO subscriptions
                (
                    subscription_plan_id,
                    subscriber_id,
                    subscription_amount,
                    subscribed_at,
                    expires_at,
                    transaction_id
                ) VALUES (?, ?, ?, ?, ?, ?)
            `,
				[
					subscription_plan_id,
					user.user_id,
					amount,
					subscribedAt,
					expiresAt,
					transaction_id,
				]
			);

			res.json({
				error: false,
				message: `You have succesfully subscribed to the ${plan.subscription_plan_title} expiring at ${expiresAt}`,
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
