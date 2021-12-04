const { createError } = require("../utils/errors");
const passport = require("passport");
const Joi = require("joi");

const schemaValidator = (req, res, next, schema) => {
  const data = {};

  Object.keys(schema).map((k) => {
    data[k] = req[k];
    return k;
  });

  const validation = Joi.object(schema).validate(data);

  if (!validation.error) {
    if (validation.value) {
      req.body = validation.value.body || req.body;
      req.query = validation.value.query || req.query;
      req.params = validation.value.params || req.params;
    }
    next();
  } else {
    next(createError(400, "Bad Request", validation.error.details[0].message));
  }
};

/**
 * @param {Object} schema
 * @param {boolean} needsAuth
 */
module.exports = (schema, needsAuth) => (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) {
      next(err);
      return;
    }
    if (needsAuth && !user) {
      next(createError(401, "Unauthorized", "Você não está logado."));
      return;
    }
    req.user = user;
    schemaValidator(req, res, next, schema);
  })(req, res);
};
