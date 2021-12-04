const Article = require('../../models/Article');
const User = require('../../models/User');
const Comment = require('../../models/Comment');

exports.createComment = async (req, res, next) => {
  try {
    const slugInfo = req.params.slug;
    const data = req.body.comment;

    const article = await Article.findOne({ where: { slug: slugInfo, }, });

    if (!article) {
      res.status(404);
      throw new Error('Article not found');
    }

    const user = await User.findByPk(req.user.id);

    const comment = await Comment.create({ user_id: user.id, article_id: article.id, body: data.body });

    comment.dataValues.author = {
      username: user.dataValues.username,
      bio: user.dataValues.bio,
      image: user.dataValues.image,
    }

    res.status(201).json({ comment });

  } catch (e) {
    const code = res.statusCode ? res.statusCode : 422;
    return res.status(code).json({
      errors: { body: ['Could not create article', e.message] }
    });
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const slugInfo = req.params.slug;
    const article = await Article.findOne({ where: { slug: slugInfo, }, });
    if (!article) {
      res.status(404);
      throw new Error('Article Slug not valid');
    }

    const comments = await Comment.findAll({
      where: {
        article_id: article.id
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['username', 'bio', 'image']
        }
      ]
    });

    res.status(200).json({ comments });

  } catch (e) {
    const code = res.statusCode ? res.statusCode : 422
    return res.status(code).json({
      errors: { body: ['Could not create article', e.message] }
    });
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const slugInfo = req.params.slug;
    const idInfo = req.params.id;

    const article = await Article.findOne({ where: { slug: slugInfo, }, });
    if (!article) {
      res.status(404)
      throw new Error('Article not found');
    }

    const comment = await Comment.findByPk(idInfo);
    if (!comment) {
      res.status(404);
      throw new Error('Comment not found');
    }

    if (req.user.id != comment.user_id) {
      res.status(403);
      throw new Error("You must be the author to modify this comment");
    }

    await Comment.destroy({ where: { id: idInfo } });
    res.status(200).json({ "message": "Comment deleted successfully" });

  } catch (e) {
    const code = res.statusCode ? res.statusCode : 422;
    return res.status(code).json({
      errors: { body: ['Could not create article', e.message] }
    });
  }
};
