module.exports = {
	home: async (req, res) => {
		res.render("index", { title: "Serve Hub - Home" });
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
};
