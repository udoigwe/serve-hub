const { validate } = require("../utils/functions");
const authValidations = require("../validations/auth.validation");
const userValidations = require("../validations/user.validation");
const serviceValidations = require("../validations/service.validation");
const pricingValidations = require("../validations/pricing.validation");
const transactionValidations = require("../validations/transactions.validation");
const messagesValidations = require("../validations/messages.validation");

module.exports = {
	/* Auth route validators */
	signUp: validate(authValidations.signUp),
	signIn: validate(authValidations.signIn),
	updateAccount: validate(authValidations.updateAccount),
	passwordUpdate: validate(authValidations.updatePassword),
	accountVerification: validate(authValidations.accountVerification),
	resendOTP: validate(authValidations.resendOTP),
	verifyAccount: validate(authValidations.verifyAccount),

	/* User route validators */
	getUser: validate(userValidations.getUser),
	updateUser: validate(userValidations.updateUser),
	deleteUser: validate(userValidations.deleteUser),
	becomeAProvider: validate(userValidations.becomeAProvider),

	/* Service route validators */
	createServiceCategory: validate(serviceValidations.createServiceCategory),
	getServiceCategory: validate(serviceValidations.getServiceCategory),
	updateServiceCategory: validate(serviceValidations.updateServiceCategory),
	deleteServiceCategory: validate(serviceValidations.deleteServiceCategory),
	createNewService: validate(serviceValidations.createNewService),
	updateService: validate(serviceValidations.updateService),
	getService: validate(serviceValidations.getService),
	deleteService: validate(serviceValidations.deleteService),
	serviceBooking: validate(serviceValidations.serviceBooking),
	getServiceBooking: validate(serviceValidations.getServiceBooking),
	postReview: validate(serviceValidations.postReview),
	updateBookingStatus: validate(serviceValidations.updateBookingStatus),
	updateBookingStatuses: validate(serviceValidations.updateBookingStatuses),
	newServiceSchedule: validate(serviceValidations.newServiceSchedule),
	serviceAvailabilityCheck: validate(
		serviceValidations.serviceAvailabilityCheck
	),

	/* Pricing route validators */
	createPricingPlan: validate(pricingValidations.createPricingPlan),
	updatePricingPlan: validate(pricingValidations.updatePricingPlan),
	getPricingPlan: validate(pricingValidations.getPricingPlan),
	deletePricingPlan: validate(pricingValidations.deletePricingPlan),

	/* Transaction route validators */
	verifySubscriptionPayment: validate(
		transactionValidations.verifySubscriptionPayment
	),

	/* Message route validators */
	sendMessage: validate(messagesValidations.sendMessage),
};
