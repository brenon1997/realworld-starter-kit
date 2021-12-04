const { Model, DataTypes } = require('sequelize');

class Tag extends Model {
  static init(sequelize) {
    super.init({
      name: DataTypes.STRING,
    }, {
      sequelize
    });
  }

  static associate(models) {
    this.belongsToMany(models.Article, { foreignKey: 'tag_id', through: 'article_tag_pivot', as: 'articles' });
  }
}

module.exports = Tag;