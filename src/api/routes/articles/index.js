const express = require("express");
const Joi = require("joi");
const validator = require("../../middlewares/routeValidator");
const controller = require("./controller");
const { catchAsyncErrors } = require("../../utils/utils");

const router = express.Router({ mergeParams: true });

router.post(
  "/",
  validator(
    {
      body: Joi.object().keys({
        article: Joi.object().keys({
          title: Joi.string().max(64).required(),
          description: Joi.string().max(2500).required(),
          body: Joi.string().max(500).required(),
          tagList: Joi.array().items(Joi.string()),
        }).required(),
      }),
    },
    true
  ),
  catchAsyncErrors(controller.createArticle)
);

router.get(
  "/feed",
  validator({}, true),
  catchAsyncErrors(controller.getFeed)
);

router.get(
  "/",
  validator({}),
  catchAsyncErrors(controller.getArticles)
);

router.get(
  "/:slug",
  validator({}),
  catchAsyncErrors(controller.getArticleBySlug)
);

router.put(
  "/:slug",
  validator(
    {
      body: Joi.object().keys({
        article: Joi.object().keys({
          title: Joi.string().max(64),
          description: Joi.string().max(2500),
          body: Joi.string().max(500),
        }).required(),
      }),
    },
    true
  ),
  catchAsyncErrors(controller.updateArticle)
);

router.delete(
  "/:slug",
  validator({}, true),
  catchAsyncErrors(controller.deleteArticle)
);

router.post(
  "/:slug/favorite",
  validator({}, true),
  catchAsyncErrors(controller.createFavorite)
);

router.delete(
  "/:slug/favorite",
  validator({}, true),
  catchAsyncErrors(controller.deleteFavorite)
);

module.exports = router;
