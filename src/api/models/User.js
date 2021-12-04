const { Model, DataTypes } = require('sequelize');

class User extends Model {
  static init(sequelize) {
    super.init({
      email: DataTypes.STRING,
      username: DataTypes.STRING,
      bio: DataTypes.TEXT,
      image: DataTypes.TEXT,
      password: DataTypes.STRING,
    }, {
      sequelize
    });
  }

  static associate(models) {
    this.hasMany(models.Article, { foreignKey: 'user_id', as: 'articles' });
    this.belongsToMany(models.User, { as: 'following', through: 'followers', foreignKey: 'following_id', otherKey: 'follower_id' });
    this.belongsToMany(models.User, { as: 'follower', through: 'followers', foreignKey: 'follower_id', otherKey: 'following_id' });
    this.hasMany(models.Comment, { foreignKey: 'user_id', as: 'comments' });
    this.hasMany(models.Favorite, { foreignKey: 'user_id', as: 'favorites' });
  }
}

module.exports = User;