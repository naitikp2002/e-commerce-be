const db = require("../models/index");
const Brand = db.brands;
const Product = db.products;
const Category = db.categories;

const addBrand = async (req, res, next) => {
  try {
    const { name } = req.body;
    const newBrand = await Brand.create({
      name,
    });

    return res
      .status(201)
      .json({ message: "Brand added successfully", brand: newBrand });
  } catch (error) {
    return next(error);
  }
};

const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll({
      attributes: ["id", "name"],
    });
    return res
      .status(200)
      .json({ message: "Brands fetched successfully", brands });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching brands", error: error.message });
  }
};

const getProductsByBrand = async (req, res) => {
  try {
    const { brandId } = req.params;
    
    const products = await Product.findAll({
      where: {
        brand_id: brandId
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
        message: "No products found for this brand" 
      });
    }

    return res.status(200).json({
      message: "Products fetched successfully",
      products
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ 
      message: "Error fetching products by brand", 
      error: error.message 
    });
  }
};

const getAllBrandsWithProducts = async (req, res) => {
  try {
    const brands = await Brand.findAll({
      include: [
        {
          model: Product,
          as: "products",
          include: [
            {
              model: Category,
              as: "category",
            }
          ]
        }
      ]
    });

    if (!brands.length) {
      return res.status(404).json({ 
        message: "No brands found" 
      });
    }

    return res.status(200).json({
      message: "Brands with products fetched successfully",
      brands
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ 
      message: "Error fetching brands with products", 
      error: error.message 
    });
  }
};

module.exports = { 
  addBrand, 
  getAllBrands, 
  getProductsByBrand, 
  getAllBrandsWithProducts 
};
