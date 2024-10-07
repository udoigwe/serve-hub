const { validate } = require('../utils/functions');
const authValidations = require('../validations/auth.validation');

module.exports = {
    /* Auth route validators */
    signUp: validate(authValidations.signUp),
    signIn: validate(authValidations.signIn),
    updateAccount: validate(authValidations.updateAccount),
    passwordUpdate: validate(authValidations.updatePassword),
}