const db = require("../models/index");
const Category = db.categories;
const Product = db.products;
const Brand = db.brands;

const addCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const newCategory = await Category.create({
      name,
    });

    return res
      .status(201)
      .json({ message: "Category added successfully", category: newCategory });
  } catch (error) {
    return next(error);
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    return res
      .status(200)
      .json({ message: "Categories fetched successfully", categories });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const products = await Product.findAll({
      where: {
        category_id: categoryId
      },
      include: [
        {
          model: Brand,
          as: "brand",
        },
        {
          model: Category,
          as: "category",
        },
      ],
    });

    if (!products.length) {
      return res.status(404).json({ 
        message: "No products found for this category" 
      });
    }

    return res.status(200).json({
      message: "Products fetched successfully",
      products
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ 
      message: "Error fetching products by category", 
      error: error.message 
    });
  }
};

const getAllCategoriesWithProducts = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Product,
          as: "products",
          include: [
            {
              model: Brand,
              as: "brand",
            }
          ]
        }
      ]
    });

    if (!categories.length) {
      return res.status(404).json({ 
        message: "No categories found" 
      });
    }

    return res.status(200).json({
      message: "Categories with products fetched successfully",
      categories
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ 
      message: "Error fetching categories with products", 
      error: error.message 
    });
  }
};

module.exports = { 
  addCategory, 
  getAllCategories, 
  getProductsByCategory, 
  getAllCategoriesWithProducts 
};
