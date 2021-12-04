const express = require("express");
const Joi = require("joi");
const validator = require("../../middlewares/routeValidator");
const controller = require("./controller");
const { catchAsyncErrors } = require("../../utils/utils");

const router = express.Router({ mergeParams: true });

router.post(
  "/:slug/comments",
  validator(
    {
      body: Joi.object().keys({
        comment: Joi.object().keys({
          body: Joi.string().min(1).max(500).required(),
        }),
      }),
    },
    true
  ),
  catchAsyncErrors(controller.createComment)
);

router.get(
  "/:slug/comments",
  validator({}),
  catchAsyncErrors(controller.getComments)
);

router.delete(
  "/:slug/comments/:id",
  validator({}, true),
  catchAsyncErrors(controller.deleteComment)
);

module.exports = router;
