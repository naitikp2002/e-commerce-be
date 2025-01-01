const db = require("../models/index");
const Users = db.users;
const Address = db.address;

const addAddress = async (req, res, next) => {
  try {
    const { name, email, mobile, street_address, city, zip_code, country } =
      req.body;
    const user_id = req.user.id; // Assuming user ID is available in req.user

    const newAddress = await Address.create({
      name,
      email,
      mobile,
      street_address,
      city,
      zip_code,
      country,
      user_id,
    });

    return res.status(201).json({
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    return next(error);
  }
};

const getUserAddresses = async (req, res, next) => {
  try {
    const user_id = req.user.id; // Assuming user ID is available in req.user

    const addresses = await Address.findAll({
      where: { user_id },
    });

    return res.status(200).json({
      message: "Addresses fetched successfully",
      addresses,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  addAddress,
  getUserAddresses,
};
