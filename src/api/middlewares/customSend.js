module.exports = (req, res, next) => {
  const successResponse = (data = {}) => {
    res.send({
      success: true,
      data,
    });
  };
  const errorResponse = (error = {}) => {
    console.log(error);
    res.send({
      success: false,
      error: { code: error.code, message: error.message, name: error.name },
    });
  };

  res.success = successResponse;
  res.error = errorResponse;
  next();
};
