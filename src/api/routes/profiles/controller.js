const User = require('../../models/User');

exports.getFollowers = async (req, res, next) => {
  try {
    const name = req.params.username;
    const userToFollow = await User.findOne({
      where: {
        username: name
      },
      include: { model: User, as: 'following' }
    });

    if (!userToFollow) {
      res.status(404);
      throw new Error('User with this username not found');
    }

    let followingUser = false;
    if (req.user) {
      for (let t of userToFollow.following) {
        if (t.dataValues.email === req.user.email) {
          followingUser = true;
          break;
        }
      }
    }
    const profile = {
      username: name,
      bio: userToFollow.dataValues.bio,
      image: userToFollow.dataValues.image,
      following: followingUser
    };
    res.status(200).json({ profile });
  } catch (e) {
    const code = res.statusCode ? res.statusCode : 422;
    return res.status(code).json({
      errors: { body: [e.message] }
    });
  }
};

exports.follow = async (req, res, next) => {
  try {
    const name = req.params.username;
    const userToFollow = await User.findOne({
      where: {
        username: name
      }
    });

    if (!userToFollow) {
      res.status(404);
      throw new Error('User with this username not found');
    }
    const user = await User.findByPk(req.user.id);

    await userToFollow.addFollowing(user);
    const profile = {
      username: name,
      bio: userToFollow.dataValues.bio,
      image: userToFollow.dataValues.image,
      following: true
    }
    res.status(200).json({ profile });
  } catch (e) {
    const code = res.statusCode ? res.statusCode : 422;
    return res.status(code).json({
      errors: { body: [e.message] }
    });
  }
};

exports.unfollow = async (req, res, next) => {
  try {
    const name = req.params.username
    const userToFollow = await User.findOne({
      where: {
        username: name
      }
    });

    if (!userToFollow) {
      res.status(404);
      throw new Error('User with this username not found');
    }
    const user = await User.findByPk(req.user.id);
    await userToFollow.removeFollowing(user);
    const profile = {
      username: name,
      bio: userToFollow.dataValues.bio,
      image: userToFollow.dataValues.image,
      following: false
    }
    res.status(200).json({ profile });
  } catch (e) {
    const code = res.statusCode ? res.statusCode : 422;
    return res.status(code).json({
      errors: { body: [e.message] }
    });
  }
};
