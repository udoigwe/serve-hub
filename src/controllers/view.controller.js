const pool = require("../utils/dbConfig");
const moment = require("moment");

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
	adminDashboard: async (req, res) => {
		res.render("admin/dashboard", { title: "Serve Hub - Dashboard" });
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
