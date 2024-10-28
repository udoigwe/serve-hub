const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/service.controller");
const validators = require("../middleware/validators");
const checkAuth = require("../middleware/checkAuth");

router.post(
	"/service-categories",
	checkAuth.isAdminCheck,
	validators.createServiceCategory,
	serviceController.createServiceCategory
);
router.get(
	"/service-categories/datatable/fetch",
	checkAuth.isAdminCheck,
	serviceController.getServiceCategoriesForDataTable
);
router.get(
	"/service-categories/:service_category_id",
	validators.getServiceCategory,
	serviceController.getServiceCategory
);
router.put(
	"/service-categories/:service_category_id",
	checkAuth.isAdminCheck,
	validators.updateServiceCategory,
	serviceController.updateServiceCategory
);

router.delete(
	"/service-categories/:service_category_id",
	checkAuth.isAdminCheck,
	validators.deleteServiceCategory,
	serviceController.deleteServiceCategory
);

module.exports = router;
