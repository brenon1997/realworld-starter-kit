const User = require('../../models/User');
const Article = require('../../models/Article');
const Tag = require('../../models/Tag');
const Favorite = require('../../models/Favorite');

async function output(article, authUser) {
  const newTagList = [];
  for (let t of article.dataValues.tags) {
    newTagList.push(t.dataValues.name);
  }


  newTagList.sort(function (a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  });


  const favorites = await Favorite.findAll({
    where: {
      article_id: article.dataValues.id
    },
  });


  let favorited = false;
  for (let f of favorites) {
    if (authUser.id == f.user_id) {
      favorited = true;
    }
  }

  delete article.dataValues.tags;
  article.dataValues.tagList = newTagList;
  if (article) {

    delete authUser.dataValues.password;

    delete authUser.dataValues.email;
    delete authUser.dataValues.following;

    article.dataValues.author = authUser;
    article.dataValues.favorited = favorited;
    article.dataValues.favoritesCount = favorites.length;
    return article;
  }
}

async function outputMultiple(article, authUser) {
  const newTagList = [];
  for (let t of article.dataValues.tags) {
    newTagList.push(t.dataValues.name);
  }
  newTagList.sort(function (a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  });
  delete article.dataValues.tags;
  article.dataValues.tagList = newTagList;

  const favorites = await Favorite.findAll({
    where: {
      article_id: article.dataValues.id
    },
  });
  let favorited = false;

  if (authUser) {

    for (let f of favorites) {
      if (authUser.id == f.user_id) {
        favorited = true;
      }
    }
  }

  let user = {
    username: article.dataValues.owner.username,
    email: article.dataValues.owner.email,
    bio: article.dataValues.owner.bio,
    image: article.dataValues.owner.image,
  };

  delete article.dataValues.owner;
  article.dataValues.author = user;
  article.dataValues.favorited = favorited;
  article.dataValues.favoritesCount = favorites.length;

  return article;
}

const slugTitle = async (title) => {
  let slugArr = []

  for (let i = 0; i < title.length; i++) {

    let char = title[i].toLowerCase()
    if (char >= 'a' && char <= 'z')
      slugArr.push(char)
    else
      slugArr.push('-')
  }
  return slugArr.join('')
}

exports.createArticle = async (req, res, next) => {
  try {
    const data = req.body.article;
    const user = await User.findByPk(req.user.id);
    if (!user) throw new Error('User does not exist');
    const slug = await slugTitle(data.title);
    let article = await Article.create({
      slug: slug,
      title: data.title,
      description: data.description,
      body: data.body,
      user_id: user.id,
    });

    if (data.tagList) {
      for (let tagName of data.tagList) {
        const [tag] = await Tag.findOrCreate({
          where: { name: tagName }
        });
        await article.addTag(tag);
      }
    }

    article = await Article.findByPk(article.id, {
      include: { model: Tag, as: 'tags' }
    });
    article = await output(article, user);
    res.status(201).json({ article });

  } catch (e) {
    return res.status(422).json({
      errors: { body: ['Could not create article', e.message] },
    });
  }
};

exports.getArticles = async (req, res, next) => {
  try {
    const { tag, author, favorited, limit = 20, offset = 0 } = req.query;

    const newFavList = [];
    if (favorited) {
      const userFav = await User.findOne({
        where: { username: favorited }
      });
      const articlesFav = await userFav.getFavorites();

      for (let t of articlesFav) {
        newFavList.push(t.article_id);
      }
      if (newFavList.length == 0)
        res.json({ articles: {} });
    }
    let article;
    article = await Article.findAll({
      where: newFavList.length ? { id: [newFavList] } : {},
      include: [
        {
          model: Tag,
          as: 'tags',
          attributes: ['name'],
          where: tag ? { name: tag } : {},
        },
        {
          model: User,
          as: 'owner',
          attributes: ['email', 'username', 'bio', 'image'],
          where: author ? { username: author } : {},
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    let articles = [];
    for (let t of article) {
      if (tag) {
        const newTag = await Article.findByPk(t.id);
        t.dataValues.tags = await newTag.getTags();
      }

      let addArt = await outputMultiple(t);
      articles.push(addArt);
    }

    res.json({ articles, articlesCount: articles.length });
  } catch (e) {
    const code = res.statusCode ? res.statusCode : 422;
    return res.status(code).json({
      errors: { body: ['Could not create article', e.message] },
    });
  }
};

exports.getArticleBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    let article = await Article.findOne({
      where: {
        slug: slug,
      },
      include: [
        {
          model: Tag,
          as: 'tags',
          attributes: ['name'],
        },
      ],
    });

    if (!article) {
      res.status(404);
      throw new Error('Article not found');
    }

    let user = await User.findByPk(article.id);

    article = await output(article, user);

    res.status(200).json({ article });
  } catch (e) {
    return res.status(422).json({
      errors: { body: ['Could not get article', e.message] },
    });
  }
};

exports.getFeed = async (req, res, next) => {
  try {

    const authUser = await User.findByPk(req.user.id);

    const followingUsers = await authUser.getFollower();

    if (!followingUsers) {
      return res.json({ articles: [] });
    }

    let followingUserId = [];

    for (let t of followingUsers) {
      followingUserId.push(t.id);
    }

    let article = await Article.findAll({
      where: {
        user_id: followingUserId,
      },
      include: [
        {
          model: Tag,
          as: 'tags',
          attributes: ['name'],
        },
        {
          model: User,
          as: 'owner',
          attributes: ['email', 'username', 'bio', 'image'],
        },
      ],
    });
    let articles = [];
    for (let t of article) {
      let addArt = await outputMultiple(t, authUser);

      articles.push(addArt);
    }

    res.json({ articles, articlesCount: articles.length });
  } catch (e) {
    const code = res.statusCode ? res.statusCode : 422;
    return res.status(code).json({
      errors: { body: ['Could not get feed ', e.message] },
    });
  }
};

exports.updateArticle = async (req, res, next) => {
  try {
    const data = req.body.article;
    const slugInfo = req.params.slug;
    let article = await Article.findOne({
      where: {
        slug: slugInfo,
      },
      include: [
        {
          model: Tag,
          as: 'tags',
          attributes: ['name'],
        },
      ],
    });

    if (!article) {
      res.status(404);
      throw new Error('Article not found');
    }

    const user = await User.findByPk(req.user.id);

    if (user.id != article.user_id) {
      res.status(403);
      throw new Error('You must be the author to modify this article');
    }

    const title = data.title ? data.title : article.title;
    const description = data.description ? data.description : article.description;
    const body = data.body ? data.body : article.body;
    const slug = data.title ? slugify(title) : slugInfo;

    const updatedArticle = await article.update({ slug, title, description, body });
    const tags = await updatedArticle.getTags();

    updatedArticle.dataValues.tags = tags;
    article = await output(updatedArticle, user);
    res.status(200).json({ article });
  } catch (e) {
    const code = res.statusCode ? res.statusCode : 422;
    return res.status(code).json({
      errors: { body: ['Could not update article', e.message] },
    });
  }
};

exports.deleteArticle = async (req, res, next) => {
  try {
    const slugInfo = req.params.slug;
    const article = await Article.findOne({
      where: {
        slug: slugInfo,
      },
      include: [
        {
          model: Tag,
          as: 'tags',
          attributes: ['name'],
        },
      ],
    });

    if (!article) {
      res.status(404);
      throw new Error('Article not found');
    }

    const user = await User.findByPk(req.user.id);
    if (user.id != article.user_id) {
      res.status(403);
      throw new Error('You must be the author to modify this article');
    }

    await Article.destroy({ where: { slug: slugInfo } });
    res.status(200).json({ message: 'Article deleted successfully' });
  } catch (e) {
    const code = res.statusCode ? res.statusCode : 422;
    return res.status(code).json({
      errors: { body: ['Could not delete article', e.message] },
    });
  }
};

exports.createFavorite = async (req, res, next) => {
  try {
    const slugInfo = req.params.slug;
    let article = await Article.findOne({
      where: {
        slug: slugInfo,
      },
      include: [
        {
          model: Tag,
          as: 'tags',
          attributes: ['name'],
        },
      ],
    });
    if (!article) {
      res.status(404)
      throw new Error('Article not found')
    }
    const user = await User.findByPk(req.user.id);
    await Favorite.create({ user_id: user.id, article_id: article.id });

    const count = await article.countFavorites();
    article = await output(article, user, count)
    res.json({ article })
  } catch (e) {
    const code = res.statusCode ? res.statusCode : 422;
    return res.status(code).json({
      errors: { body: [e.message] }
    });
  }
};

exports.deleteFavorite = async (req, res, next) => {
  try {
    const slugInfo = req.params.slug;
    let article = await Article.findOne({
      where: {
        slug: slugInfo,
      },
      include: [
        {
          model: Tag,
          as: 'tags',
          attributes: ['name'],
        },
      ],
    });
    if (!article) {
      res.status(404)
      throw new Error('Article not found')
    }
    const user = await User.findByPk(req.user.id);
    await Favorite.destroy({ where: { user_id: user.id, article_id: article.id } });

    const count = await article.countFavorites();
    article = await output(article, user, count)
    res.json({ article })
  } catch (e) {
    const code = res.statusCode ? res.statusCode : 422;
    return res.status(code).json({
      errors: { body: [e.message] }
    });
  }
};
