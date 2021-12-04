const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const passport = require("passport");

const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const customSend = require("./middlewares/customSend");

const app = express();

app.use(helmet());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      new RegExp(`.+\.${process.env.FRONT_ORIGIN}$`), // eslint-disable-line
    ],
    credentials: true,
  })
);

app.use(customSend);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require("./passport");
app.use(passport.initialize());

app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

app.get("/", (req, res) => {
  res.status(200).success();
});

app.use("/users", require("./routes/users"));
app.use("/user", require("./routes/users"));
app.use("/articles", require("./routes/articles"));
app.use("/articles", require("./routes/comments"));
app.use("/tags", require("./routes/tags"));
app.use("/profiles", require("./routes/profiles"));

app.all("*", notFound);

app.use(errorHandler);

module.exports = app;
