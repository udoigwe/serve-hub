//accessing & configuring environmental variables
const dotenv = require('dotenv');
dotenv.config();
//Accepting from unauthorized
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

//variables
const express = require('express');
const app = express();
const port = process.env.PORT || 9001;
const cors = require('cors');
const fileUpload = require('express-fileupload');
const swaggerUi = require("swagger-ui-express");
const yaml = require('js-yaml');
const fs = require('fs');

//using middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(fileUpload({useTempFiles: true, limits: { fileSize: 50 * 1024 * 1024 * 1024 }}));

//static files
app.use(express.static(__dirname + '/public'));

//set templating engine
app.set('view engine', 'ejs');
app.set('views', './src/views');

// Parse YAML Swagger documentation to JSON
const swaggerFile = fs.readFileSync('./src/documentation/swagger.yaml', 'utf8');
const swaggerDocument = yaml.load(swaggerFile);

// Middleware to handle 404 errors
app.use((req, res, next) => {
    res.status(404).render('404', { title: "Wild Stars - Page Not Found"});
});

app.listen(port, () => {
    console.log(`App successfully running on port ${port}`);
})