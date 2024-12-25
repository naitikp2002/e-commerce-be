const db = require("../models/index");
const User = db.users;

const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      where: {
        role: "user",
      },
      attributes: {
        exclude: ["password"],
      },
    });
    return res.status(200).json({ users });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getUsers };
