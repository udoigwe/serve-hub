const express = require("express");
const router = express.Router();
const viewsController = require("../controllers/view.controller");

router.get("/", viewsController.home);

/* ADMIN */
router.get("/admin", viewsController.adminHome);
router.get("/admin/sign-in", viewsController.adminSignIn);
router.get("/admin/dashboard", viewsController.adminDashboard);
router.get("/admin/users", viewsController.adminUserManagement);
router.get("/admin/service-categories", viewsController.adminServiceCategories);
router.get("/admin/pricing-plans", viewsController.adminPricingPlans);

module.exports = router;
