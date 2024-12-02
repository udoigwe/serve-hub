const pool = require("../utils/dbConfig");
const moment = require("moment");
const { sumArray } = require("../utils/functions");

module.exports = {
	home: async (req, res, next) => {
		let connection;

		let query = `
            SELECT COUNT(*) AS completed_booking_count
            FROM service_bookings_view
            WHERE booking_status = 'Completed'
        `;
		let query2 = `
            SELECT ROUND(AVG(rating), 1) AS average_rating
            FROM reviews_view
        `;
		let query3 = `
            SELECT COUNT(*) AS providers_count
            FROM users
            WHERE user_category = 'Service Provider'
			AND user_status = 'Active'
        `;
		let query4 = `
            SELECT COUNT(*) AS reviews_count
            FROM reviews_view
            WHERE review_status = 'Published'
        `;
		let query5 = `
            SELECT *
            FROM service_categories
            WHERE service_category_status = 'Active'
        `;
		let query6 = `
            SELECT *
            FROM service_view
            WHERE service_status = 'Published'
			AND is_featured = 'Yes'
			LIMIT 50
        `;
		let query7 = `
			SELECT 
				service_id, 
				AVG(rating) AS average_rating 
			FROM reviews_view 
			GROUP BY service_id 
			ORDER BY average_rating DESC 
			LIMIT 10;
		`;
		let query8 = `
			SELECT *
			FROM reviews_view
			WHERE review_status = 'Published'
			ORDER BY reviewed_at DESC
			LIMIT 10
		`;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			const [bookings] = await connection.execute(query);
			const [ratings] = await connection.execute(query2);
			const [providers] = await connection.execute(query3);
			const [reviews] = await connection.execute(query4);
			const [categories] = await connection.execute(query5);
			const [services] = await connection.execute(query6);
			const [preferred] = await connection.execute(query7);
			const [Reviews] = await connection.execute(query8);

			for (let i = 0; i < categories.length; i++) {
				const category = categories[i];
				const [listings] = await connection.execute(
					`
					SELECT COUNT(*) AS category_listings_count
					FROM service_view
					WHERE service_category_id = ?
				`,
					[category.service_category_id]
				);
				category.listings_count = listings[0].category_listings_count;
			}

			for (let i = 0; i < services.length; i++) {
				const service = services[i];
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
				service.images = images;
				service.average_rating = ratings[0].average_rating;
			}

			for (let i = 0; i < preferred.length; i++) {
				const service = preferred[i];
				const [reviews] = await connection.execute(
					`
					SELECT COUNT(*) AS reviews_count
					FROM reviews_view
					WHERE review_status = 'Published'
					AND service_id = ?
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
				const [bookings] = await connection.execute(
					`
					SELECT COUNT(*) AS booking_count
					FROM service_bookings_view
					WHERE service_id = ?
				`,
					[service.service_id]
				);
				const [services] = await connection.execute(
					`
					SELECT a.*, b.user_avatar_filename
					FROM service_view a
					LEFT JOIN users b ON a.subscriber_id = b.user_id
					WHERE a.service_id = ?
					LIMIT 1
				`,
					[service.service_id]
				);

				service.reviews_count = reviews[0].reviews_count;
				service.images = images;
				service.booking_count = bookings[0].booking_count;
				service.service_details = services[0];
			}

			res.render("index", {
				title: "Serve Hub - Home",
				completed_booking_count: bookings[0].completed_booking_count,
				average_rating: ratings[0].average_rating,
				providers_count: providers[0].providers_count,
				reviews_count: reviews[0].reviews_count,
				categories,
				services,
				preferred,
				Reviews,
				moment,
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	services: async (req, res, next) => {
		const {
			service_status,
			search_term,
			service_category_id,
			location,
			price_from,
			price_to,
		} = req.query;

		let connection;

		let query = `
            SELECT *
            FROM service_view
            WHERE service_status = 'Published'
			AND expires_at > NOW()
        `;
		const queryParams = [];

		if (service_status) {
			query += " AND service_status = ?";
			queryParams.push(service_status);
		}

		if (search_term) {
			query += ` AND service_title LIKE ?`;
			queryParams.push(`%${search_term}%`);
		}

		if (service_category_id) {
			query += " AND service_category_id = ?";
			queryParams.push(service_category_id);
		}

		if (location) {
			query += " AND service_address LIKE ?";
			queryParams.push(`%${location}%`);
		}

		if (price_from) {
			query += " AND service_price >= ?";
			queryParams.push(price_from);
		}

		if (price_to) {
			query += " AND service_price <= ?";
			queryParams.push(price_to);
		}

		query += ` ORDER BY service_id DESC`;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			const [data] = await connection.execute(query, queryParams);

			//get uploaded images for each service
			for (let i = 0; i < data.length; i++) {
				const service = data[i];
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
			}

			res.render("services", { title: "Serve Hub - Services", data });
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	service: async (req, res, next) => {
		const { service_id } = req.params;

		let connection;

		let query = `
            SELECT *
            FROM service_view
            WHERE service_id = ?
			LIMIT 1
        `;
		const queryParams = [service_id];

		let query2 = `
			SELECT *
			FROM service_images
			WHERE service_id = ?
		`;
		const queryParams2 = [service_id];

		let query3 = `
			SELECT COUNT(*) AS booking_count
			FROM service_bookings_view
			WHERE service_id = ?
		`;
		const queryParams3 = [service_id];

		let query4 = `
			SELECT 
				COUNT(*) AS total_reviews, 
				SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS one_star_count, 
				SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS two_star_count, 
				SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS three_star_count, 
				SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS four_star_count, 
				SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS five_star_count,
				ROUND(AVG(rating), 1) AS average_rating
			FROM reviews_view 
			WHERE service_id = ?
		`;
		const queryParams4 = [service_id];

		let query5 = `
			SELECT *
			FROM reviews_view
			WHERE service_id = ?
			ORDER BY reviewed_at DESC
		`;
		const queryParams5 = [service_id];

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			const [services] = await connection.execute(query, queryParams);
			const [images] = await connection.execute(query2, queryParams2);
			const [bookings] = await connection.execute(query3, queryParams3);
			const [ratings] = await connection.execute(query4, queryParams4);
			const [reviews] = await connection.execute(query5, queryParams5);

			if (services.length === 0) {
				res.status(404).render("404", {
					title: "ServeHub - Page Not Found",
				});
			}

			const service = services[0];

			//get provider details
			const [providers] = await connection.execute(
				`
				SELECT *
				FROM users
				WHERE user_id = ?
				LIMIT 1
			`,
				[service.subscriber_id]
			);

			service.provider = providers[0];
			service.images = images;
			service.booking_count = bookings[0].booking_count;
			service.ratings = ratings;
			service.reviews = reviews;

			res.render("service", {
				title: "Serve Hub - Service Detail",
				service,
				moment,
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},

	/* ADMIN */
	adminHome: async (req, res) => {
		res.render("admin/index", { title: "Serve Hub - Admin Home" });
	},
	adminSignIn: async (req, res) => {
		res.render("admin/sign-in", { title: "Serve Hub - Sign In" });
	},
	adminDashboard: async (req, res, next) => {
		const year = moment().format("YYYY");
		const months = [
			"01",
			"02",
			"03",
			"04",
			"05",
			"06",
			"07",
			"08",
			"09",
			"10",
			"11",
			"12",
		];
		const monthLabelsArray = [];
		const amountPaidArray = [];
		const expectedPayoutArray = [];
		const serviceChargeArray = [];
		const subscriptionArray = [];

		let dashboard;
		let connection;

		//messages count
		let query = `
			SELECT COUNT(*) AS message_count
			FROM messages
			WHERE provider_id = NULL
		`;

		let query2 = `
			SELECT COUNT(*) AS review_count
			FROM reviews
			WHERE review_status = 'Published'
		`;

		let query3 = `
			SELECT COUNT(*) AS service_count
			FROM services
			WHERE service_status = 'Published'
		`;

		let query4 = `
			SELECT COUNT(*) AS service_booking_count
			FROM service_bookings
		`;

		let query5 = `
			SELECT COUNT(*) AS service_category_count
			FROM service_categories
			WHERE service_category_status = 'Active'
		`;

		let query6 = `
			SELECT COUNT(*) AS subscription_count
			FROM subscriptions
		`;

		let query7 = `
			SELECT COUNT(*) AS subscription_plan_count
			FROM subscription_plans
			WHERE subscription_plan_status = 'Active'
		`;

		let query8 = `
			SELECT COUNT(*) AS admin_count
			FROM users
			WHERE user_category = 'Admin'
			AND user_status = 'Active'
		`;

		let query9 = `
			SELECT COUNT(*) AS service_provider_count
			FROM users
			WHERE user_category = 'Service Provider'
			AND user_status = 'Active'
		`;

		let query10 = `
			SELECT COUNT(*) AS customer_count
			FROM users
			WHERE user_category = 'Customer'
			AND user_status = 'Active'
		`;

		try {
			// Get a connection from the pool
			connection = await pool.getConnection();

			const [messages] = await connection.execute(query);
			const [reviews] = await connection.execute(query2);
			const [services] = await connection.execute(query3);
			const [bookings] = await connection.execute(query4);
			const [categories] = await connection.execute(query5);
			const [subscriptions] = await connection.execute(query6);
			const [plans] = await connection.execute(query7);
			const [admins] = await connection.execute(query8);
			const [providers] = await connection.execute(query9);
			const [customers] = await connection.execute(query10);

			//generate my monthly income chart
			for (var i = 0; i < months.length; i++) {
				const month = months[i];

				const period = `${year}-${month}`;

				//get total of amount paid for this period
				let [amountPaid] = await connection.execute(`
						SELECT COALESCE(SUM(amount_paid), 0) AS total_amount_paid_this_month FROM service_bookings WHERE DATE_FORMAT(booked_at, '%Y-%m') = '${period}'
					`);

				//get total of payouts for this period
				let [payouts] = await connection.execute(`
						SELECT COALESCE(SUM(expected_payout), 0) AS total_expected_payout_this_month FROM service_bookings WHERE DATE_FORMAT(booked_at, '%Y-%m') = '${period}' AND payout_status = 'Paid Out'
					`);

				//get total of service charges for this period
				let [serviceCharges] = await connection.execute(`
						SELECT COALESCE(SUM(amount_paid - expected_payout), 0) AS total_service_charge_this_month FROM service_bookings WHERE DATE_FORMAT(booked_at, '%Y-%m') = '${period}' AND payout_status = 'Paid Out'
					`);

				//get total of subscriptions for this period
				let [subscriptionAmount] = await connection.execute(`
						SELECT COALESCE(SUM(subscription_amount), 0) AS total_subscription_amount_this_month FROM subscriptions WHERE DATE_FORMAT(subscribed_at, '%Y-%m') = '${period}'
					`);

				//push to arrays
				monthLabelsArray.push(moment(period).format("MMM"));
				amountPaidArray.push(
					amountPaid[0].total_amount_paid_this_month
				);
				expectedPayoutArray.push(
					payouts[0].total_expected_payout_this_month
				);
				serviceChargeArray.push(
					serviceCharges[0].total_service_charge_this_month
				);
				subscriptionArray.push(
					subscriptionAmount[0].total_subscription_amount_this_month
				);
			}

			//generate monthly revenue chart
			const chartData = {
				labels: monthLabelsArray,
				datasets: {
					amountPaidArray,
					expectedPayoutArray,
					serviceChargeArray,
					subscriptionArray,
					total_income: sumArray([
						...serviceChargeArray,
						...subscriptionArray,
					]),
				},
			};

			dashboard = {
				message_count: messages[0].message_count,
				review_count: reviews[0].review_count,
				service_count: services[0].service_count,
				service_booking_count: bookings[0].service_booking_count,
				service_category_count: categories[0].service_category_count,
				subscription_count: subscriptions[0].subscription_count,
				subscription_plan_count: plans[0].subscription_plan_count,
				admin_count: admins[0].admin_count,
				service_provider_count: providers[0].service_provider_count,
				customer_count: customers[0].customer_count,
				chart_data: chartData,
			};

			res.render("admin/dashboard", {
				title: "Serve Hub - Dashboard",
				dashboard,
			});
		} catch (e) {
			next(e);
		} finally {
			connection ? connection.release() : null;
		}
	},
	adminUserManagement: async (req, res) => {
		res.render("admin/users", { title: "Serve Hub - User Management" });
	},
	adminServiceCategories: async (req, res) => {
		res.render("admin/service-categories", {
			title: "Serve Hub - Service Categories",
		});
	},
	adminPricingPlans: async (req, res) => {
		res.render("admin/pricing-plans", {
			title: "Serve Hub - Pricing Plans",
		});
	},

	/* PROVIDER */
	providerServices: async (req, res) => {
		res.render("provider/services", {
			title: "Serve Hub - Provider Services",
		});
	},
	providerPlan: async (req, res) => {
		res.render("provider/plan", {
			title: "Serve Hub - Plan & Billings",
		});
	},
	providerServiceBookings: async (req, res) => {
		res.render("provider/bookings", {
			title: "Serve Hub - Service Bookings",
		});
	},
};
