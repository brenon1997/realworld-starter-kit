const express = require("express");
const validator = require("../../middlewares/routeValidator");
const controller = require("./controller");

const { catchAsyncErrors } = require("../../utils/utils");

const router = express.Router({ mergeParams: true });

router.get(
  "/:username",
  validator({}, true),
  catchAsyncErrors(controller.getFollowers)
);

router.post(
  "/:username/follow",
  validator({}, true),
  catchAsyncErrors(controller.follow)
);

router.delete(
  "/:username/follow",
  validator({}, true),
  catchAsyncErrors(controller.unfollow)
);

module.exports = router;
