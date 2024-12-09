const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const validators = require("../middleware/validators");
const checkAuth = require("../middleware/checkAuth");

router.post("/sign-up", validators.signUp, authController.signUp);
router.post("/sign-in", validators.signIn, authController.signIn);
router.post("/resend-otp", validators.resendOTP, authController.resendOTP);
router.post(
	"/verify-account",
	validators.verifyAccount,
	authController.verifyAccount
);
router.put(
	"/account-update",
	checkAuth.verifyToken,
	validators.updateAccount,
	authController.updateAccount
);
router.put(
	"/password-update",
	checkAuth.verifyToken,
	validators.passwordUpdate,
	authController.updatePassword
);

module.exports = router;
