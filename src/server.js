const app = require("./api/app");
require('./db');

module.exports = () => {
  app.listen(process.env.SERVER_PORT, () => {
    console.log(`HTTP Server running on port ${process.env.SERVER_PORT}`);
  });
};
