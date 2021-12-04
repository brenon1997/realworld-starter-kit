const { Model, DataTypes } = require('sequelize');

class Comment extends Model {
  static init(sequelize) {
    super.init({
      body: DataTypes.STRING,
    }, {
      sequelize
    });
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'author' });
    this.belongsTo(models.Article, { foreignKey: 'article_id', as: 'article' });
  }
}

module.exports = Comment;