const bcrypt = require("bcryptjs");

module.exports = {
  compareData: async (candidateData, hash) => {
    const isMatch = await bcrypt.compare(candidateData, hash);
    return isMatch;
  },
  hashData: async (data) => {
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hash(data, salt);
    return hash;
  },
};
