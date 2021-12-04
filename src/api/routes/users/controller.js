const crypto = require("../../utils/crypto");
const { createError } = require("../../utils/errors");
const { upperCaseFirstLetter } = require("../../utils/utils");
const jwt = require("jsonwebtoken");
const User = require('../../models/User');

const checkUser = async (res, email, password) => {
  const user = await User.findOne({ where: { email: email } });
  if (!user) {
    res
      .status(403)
      .error(createError(404, "Not Found", "Usuário não encontrado."));
    return;
  }

  const isMatch = await crypto.compareData(password, user.password);
  if (isMatch) {
    delete user.password;
    return user;
  }

  res.status(403).error(createError(403, "Forbidden", "Senha incorreta."));
};

const getTokenAndRes = (res, next, user) => {
  if (!user) return;

  if (user.dataValues.password)
    delete user.dataValues.password;
  const jwtPayload = {
    id: user.id,
    email: user.email,
    username: user.username,
  };

  // Sign Token
  jwt.sign(
    jwtPayload,
    process.env.JWT_SECRET,
    { expiresIn: 30 * 24 * 60 * 60 * 1000 },
    (err, token) => {
      if (err) next(err);
      res.status(200).json({
        user: {
          token: `Bearer ${token}`,
          ...user.dataValues,
        }
      });
    }
  );
};

exports.login = async (req, res, next) => {
  try {
    const user = await checkUser(res, req.body.user.email, req.body.user.password);
    getTokenAndRes(res, next, user);
  } catch (e) {
    const status = res.statusCode ? res.statusCode : 500
    res.status(status).json({ errors: { body: ['Could not create user ', e.message] } });
  }
};

const checkIfEmailAlreadyExists = async (email) => {
  const user = await User.findOne({ where: { email: email } });
  return !!user;
};

exports.signup = async (req, res, next) => {
  try {
    const { password, email } = req.body.user;

    if (await checkIfEmailAlreadyExists(email)) {
      throw createError(422, "Already Exists", "Email já cadastrado.");
    }

    const hash = await crypto.hashData(password);

    const userName = upperCaseFirstLetter(req.body.user.username).trim();
    delete req.body.user.fullname;

    const user = await User.create({
      username: userName,
      password: hash,
      email: email
    });

    if (user) {
      user.dataValues.bio = null
      user.dataValues.image = null
      getTokenAndRes(res, next, user)
    }
  } catch (e) {
    res.status(422).json({ errors: { body: ['Could not create user ', e.message] } })
  }
};


exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      throw new Error('No such user found');
    }
    delete user.dataValues.password;
    user.dataValues.token = 'Bearer ' + req.header('Authorization').split(' ')[1];
    return res.status(200).json({ user });
  } catch (e) {
    return res.status(404).json({
      errors: { body: [e.message] }
    });
  }
};

exports.updateUserDetails = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      res.status(401);
      throw new Error('No user with this id');
    }


    if (req.body.user) {
      const username = req.body.user.username ? req.body.user.username : user.username;
      const bio = req.body.user.bio ? req.body.user.bio : user.bio;
      const image = req.body.user.image ? req.body.user.image : user.image;
      let password = user.password;
      if (req.body.user.password)
        password = await hashPassword(req.body.user.password);

      const updatedUser = await user.update({ username, bio, image, password });
      delete updatedUser.dataValues.password;
      updatedUser.dataValues.token = 'Bearer ' + req.header('Authorization').split(' ')[1];
      res.json({ user: updatedUser });
    } else {
      delete user.dataValues.password;
      user.dataValues.token = 'Bearer ' + req.header('Authorization').split(' ')[1];
      res.json({ user: user });
    }
  } catch (e) {
    const status = res.statusCode ? res.statusCode : 500;
    return res.status(status).json({
      errors: { body: [e.message] }
    });
  }
};
