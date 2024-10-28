const express = require("express");
const router = express.Router();
const pricingController = require("../controllers/pricing.controller");
const validators = require("../middleware/validators");
const checkAuth = require("../middleware/checkAuth");

router.post(
	"/pricing",
	checkAuth.isAdminCheck,
	validators.createPricingPlan,
	pricingController.createPricingPlan
);
router.get(
	"/pricing/datatable/fetch",
	checkAuth.isAdminCheck,
	pricingController.getPlansForDataTable
);
router.put(
	"/pricing/:subscription_plan_id",
	checkAuth.isAdminCheck,
	validators.updatePricingPlan,
	pricingController.updatePricingPlan
);
router.get(
	"/pricing/:subscription_plan_id",
	validators.getPricingPlan,
	pricingController.getPricingPlan
);
router.delete(
	"/pricing/:subscription_plan_id",
	checkAuth.isAdminCheck,
	validators.deletePricingPlan,
	pricingController.deletePricingPlan
);

/*
router.get(
	"/service-categories/:service_category_id",
	validators.getServiceCategory,
	serviceController.getServiceCategory
);
router.delete(
	"/service-categories/:service_category_id",
	checkAuth.isAdminCheck,
	validators.deleteServiceCategory,
	serviceController.deleteServiceCategory
); */

module.exports = router;
