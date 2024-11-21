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
	"/service-categories",
	/* checkAuth.verifyToken, */
	serviceController.getServiceCategories
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
router.post(
	"/services",
	checkAuth.verifyToken,
	validators.createNewService,
	serviceController.createNewService
);
router.get("/services", serviceController.getServices);
router.get(
	"/services/:service_id",
	validators.getService,
	serviceController.getService
);
router.put(
	"/services/:service_id",
	checkAuth.verifyToken,
	validators.updateService,
	serviceController.updateService
);
router.delete(
	"/services/:service_id",
	checkAuth.verifyToken,
	validators.deleteService,
	serviceController.deleteService
);
router.post(
	"/bookings",
	validators.serviceBooking,
	serviceController.serviceBooking
);
router.get(
	"/bookings",
	checkAuth.verifyToken,
	serviceController.getServiceBookings
);
router.post(
	"/reviews",
	checkAuth.verifyToken,
	validators.postReview,
	serviceController.postReview
);
router.post(
	"/booking-status",
	checkAuth.verifyToken,
	validators.updateBookingStatus,
	serviceController.updateBookingStatus
);

module.exports = router;
