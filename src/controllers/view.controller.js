const pool = require("../utils/dbConfig");

module.exports = {
	home: async (req, res) => {
		res.render("index", { title: "Serve Hub - Home" });
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
