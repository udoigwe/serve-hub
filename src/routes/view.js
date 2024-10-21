const express = require("express");
const router = express.Router();
const viewsController = require("../controllers/view.controller");

router.get("/", viewsController.home);

module.exports = router;
