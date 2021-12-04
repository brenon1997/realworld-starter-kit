const formatError = (err, code = 500) => {
  const error = new Error(err.message || "N/A");
  error.name = err.name || err.constructor.name;
  error.stack = err.stack;

  error.code = err.code || code;
  return error;
};

const createError = (code = 500, name = "Server Error", message = "N/A") => {
  const error = new Error(message);
  error.name = name;

  const createdStack = new Error().stack;
  // Removing this error stack line
  error.stack = createdStack.replace(createdStack.match(/at.*\n {4}/), "");
  error.code = code;
  return error;
};

module.exports = {
  createError,
  formatError,
};
