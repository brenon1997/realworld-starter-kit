const { formatError } = require("../utils/errors");

module.exports = (err, req, res, next) => {
  const error = formatError(err);
  console.log(req);
  const status = typeof error.code === "number" ? error.code : 500;

  res.status(status).error(error);
};
