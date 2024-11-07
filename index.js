//accessing & configuring environmental variables
const dotenv = require("dotenv");
dotenv.config();
//Accepting from unauthorized
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

//variables
const express = require("express");
const app = express();
const port = process.env.PORT || 9001;
const cors = require("cors");
const fileUpload = require("express-fileupload");
const swaggerUi = require("swagger-ui-express");
const yaml = require("js-yaml");
const fs = require("fs");

//using middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
	fileUpload({
		useTempFiles: true,
		limits: { fileSize: 50 * 1024 * 1024 * 1024 },
	})
);

//static files
app.use(express.static(__dirname + "/public"));
app.use("/assets", express.static(__dirname + "/public/assets"));
app.use("/uploads", express.static(__dirname + "/public/uploads"));
app.use("/admin-assets", express.static(__dirname + "/public/admin-assets"));

//set templating engine
app.set("view engine", "ejs");
app.set("views", "./src/views");

//import all required routes
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/user");
const serviceRoutes = require("./src/routes/service");
const pricingRoutes = require("./src/routes/pricing");
const transactionRoutes = require("./src/routes/transactions");
const errorHandler = require("./src/middleware/errorHandler");

//importing all view routes
const viewRoutes = require("./src/routes/view");

// Parse YAML Swagger documentation to JSON
const swaggerFile = fs.readFileSync("./src/documentation/swagger.yaml", "utf8");
const swaggerDocument = yaml.load(swaggerFile);

//using imported routes
app.use(process.env.ROUTE_PREFIX, authRoutes);
app.use(process.env.ROUTE_PREFIX, userRoutes);
app.use(process.env.ROUTE_PREFIX, serviceRoutes);
app.use(process.env.ROUTE_PREFIX, pricingRoutes);
app.use(process.env.ROUTE_PREFIX, transactionRoutes);

// Serve Swagger documentation at /api/docs
app.use(process.env.API_DOCS_ROUTE_PREFIX, swaggerUi.serve);
app.get(process.env.API_DOCS_ROUTE_PREFIX, swaggerUi.setup(swaggerDocument));

//using imported view routes
app.use(viewRoutes);

// Middleware to handle 404 errors
app.use((req, res, next) => {
	res.status(404).render("404", { title: "ServeHub - Page Not Found" });
});

// Use the errorHandler middleware
app.use(errorHandler);

app.listen(port, () => {
	console.log(`App successfully running on port ${port}`);
});
