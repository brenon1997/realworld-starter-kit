const { Model } = require('sequelize');

class Favorite extends Model {
  static init(sequelize) {
    super.init({
    }, {
      sequelize
    });
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.Article, { foreignKey: 'article_id', as: 'article' });
  }
}

module.exports = Favorite;