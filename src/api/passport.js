const passport = require("passport");
const { Strategy, ExtractJwt } = require("passport-jwt");
const User = require('../api/models/User');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

const getUserFromDb = (payload, cb) => {
  try {
    User.findByPk(payload.id)
      .then((users) => {
        if (!users) {
          return cb(new Error("User not found"), false);
        }
        cb(null, {
          ...users.dataValues,
        });
      });
  } catch (err) {
    cb(err, false);
  }
};

passport.use(new Strategy(opts, getUserFromDb));
