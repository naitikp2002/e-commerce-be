const db = require("../models/index");
const Product = db.products;
const Brand = db.brands;
const Category = db.categories;
const addProduct = async (req, res, next) => {
  try {
    const { name, description, price, rating, stock, image, brand } = req.body;
    const newProduct = await Product.create({
      ...req.body,
    });

    return res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    return next(error);
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Brand,
          as: "brand",
          // attributes: ["name"],
        },
        {
          model: Category,
          as: "category",
          // attributes: ["name"],
        },
      ],
    });
    return res
      .status(200)
      .json({ message: "Products fetched successfully", products });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

module.exports = { addProduct, getAllProducts };
