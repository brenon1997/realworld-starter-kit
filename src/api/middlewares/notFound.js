const { createError } = require("../utils/errors");

module.exports = (req, res) => {
  res.status(404).error(createError(404, "Not Found"));
};
