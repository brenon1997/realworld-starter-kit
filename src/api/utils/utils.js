const crypto = require("crypto");
const { ObjectId } = require("mongodb");

const catchAsyncErrors = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (e) {
    next(e);
  }
};

const genRandomHash = (length) =>
  crypto.randomBytes(length).toString("hex").substring(length);

const dateFromObjectId = function (objectId) {
  return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
};

const dateIdCaracters = (date) => {
  return Math.floor(date.getTime() / 1000).toString(16);
};

const objectIdFromDate = (date) => {
  return ObjectId(dateIdCaracters(date) + genRandomHash(16));
};

const upperCaseFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const mergeArray = (outerArray) => {
  const newArray = [];
  for (let i = 0; i < outerArray.length; i++) {
    newArray.push(...outerArray[i]);
  }
  return newArray;
};

module.exports = {
  catchAsyncErrors,
  genRandomHash,
  objectIdFromDate,
  dateFromObjectId,
  upperCaseFirstLetter,
  mergeArray,
};
