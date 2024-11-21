const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const validators = require("../middleware/validators");
const checkAuth = require("../middleware/checkAuth");

router.put(
	"/users/:user_id",
	checkAuth.isAdminCheck,
	validators.updateUser,
	userController.updateUser
);
router.get("/users/:user_id", validators.getUser, userController.getUser);
router.get(
	"/users/datatable/fetch",
	checkAuth.verifyToken,
	userController.getUsersForDataTable
);
router.delete(
	"/users/:user_id",
	checkAuth.isAdminCheck,
	validators.deleteUser,
	userController.deleteUser
);
router.post(
	"/providers",
	checkAuth.verifyToken,
	validators.becomeAProvider,
	userController.becomeAProvider
);

module.exports = router;
