const express = require("express");
const validator = require("../../middlewares/routeValidator");
const controller = require("./controller");
const { catchAsyncErrors } = require("../../utils/utils");

const router = express.Router({ mergeParams: true });

router.get(
  "/",
  validator({}),
  catchAsyncErrors(controller.getTags)
);

module.exports = router;
