module.exports = {
	home: async (req, res) => {
		res.render("index", { title: "Serve Hub - Home" });
	},
};
