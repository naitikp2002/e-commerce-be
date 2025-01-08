// const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const db = require("../models/index");
const { Sequelize, Op, QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");
const User = db.users;
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { storage } = require("../config/firebase");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const stripe = require("stripe")(
  "sk_test_51QchuML6qcJ4o2wV89HbmyTD0I5utKo51OFVuEoP7DXASi64at6sWfxdyG9F81lnZSvxIK91aF48PMNpdMzC4drs00JWsW0ZfN"
);
const registerUser = async (req, res, next) => {
  try {
    console.log(req.body);
    // Access form-data fields from req.body
    const name = req.body.name;
    const email = req.body.email;
    const mobile = req.body.mobile;
    const password = req.body.password;
    const imageFile = req.file; // Image file from multer

    // Validate required fields
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Upload image to Firebase if it exists
    let imageUrl = null;
    if (imageFile) {
      const fileName = `images/${uuidv4()}-${imageFile.originalname}`;
      const storageRef = ref(storage, fileName);

      // Upload the file
      await uploadBytes(storageRef, imageFile.buffer);

      // Get the download URL
      imageUrl = await getDownloadURL(storageRef);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with image URL
    const newUser = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      image: imageUrl,
    });

    // Remove password from response
    const userResponse = { ...newUser.toJSON() };
    delete userResponse.password;

    return res.status(201).json({
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    return next(error);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    let stripeCustomerId = user.stripe_customer_id;

    if (!stripeCustomerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name, // Assuming user has firstName and lastName fields
        metadata: { userId: user.id.toString() }, // Add additional metadata if needed
      });
      console.log("Customer", customer);
      // Update the user in your database with the Stripe customer ID
      stripeCustomerId = customer.id;
      user.stripe_customer_id = stripeCustomerId;
      await user.save();
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error logging in", error: error.message });
  }
};

const getUser = async (req, res, next) => {
  try {
    const users = await User.findAll();
    return res.status(200).json({ users });
  } catch (error) {
    return next(error);
  }
};

module.exports = { registerUser, loginUser, getUser };
