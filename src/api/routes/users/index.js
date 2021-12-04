const express = require("express");
const Joi = require("joi");
const validator = require("../../middlewares/routeValidator");
const controller = require("./controller");

const { catchAsyncErrors } = require("../../utils/utils");

const router = express.Router({ mergeParams: true });

router.post(
  "/",
  validator({
    body: Joi.object().keys({
      user: Joi.object().keys({
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(20).required(),
      }).required(),
    }),
  }),
  catchAsyncErrors(controller.signup)
);

router.post(
  "/login",
  validator({
    body: Joi.object().keys({
      user: Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(20).required(),
      }),
    }),
  }),
  catchAsyncErrors(controller.login)
);

router.get(
  "/",
  validator({}, true),
  catchAsyncErrors(controller.getUserById)
);

router.put(
  "/",
  validator({}, true),
  catchAsyncErrors(controller.updateUserDetails)
);

module.exports = router;
