const { Model, DataTypes } = require('sequelize');

class Article extends Model {
  static init(sequelize) {
    super.init({
      user_id: DataTypes.INTEGER,
      slug: DataTypes.STRING,
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      body: DataTypes.TEXT,
    }, {
      sequelize
    });
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'owner' });
    this.belongsToMany(models.Tag, { foreignKey: 'article_id', through: 'article_tag_pivot', as: 'tags' });
    this.hasMany(models.Comment, { foreignKey: 'article_id', as: 'comments' });
    this.hasMany(models.Favorite, { foreignKey: 'article_id', as: 'favorites' });
  }
}

module.exports = Article;