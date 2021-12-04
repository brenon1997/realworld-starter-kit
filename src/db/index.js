const Sequelize = require('sequelize');
const dbConfig = require('../db/database');

const User = require('../api/models/User');
const Article = require('../api/models/Article');
const Tag = require('../api/models/Tag');
const Comment = require('../api/models/Comment');
const Favorite = require('../api/models/Favorite');

const connection = new Sequelize(dbConfig);

User.init(connection);
Article.init(connection);
Tag.init(connection);
Comment.init(connection);
Favorite.init(connection);
Article.associate(connection.models);
User.associate(connection.models);
Tag.associate(connection.models);
Comment.associate(connection.models);
Favorite.associate(connection.models);

module.exports = connection;