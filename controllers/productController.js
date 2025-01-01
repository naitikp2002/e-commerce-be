const db = require("../models/index");
const Product = db.products;
const Brand = db.brands;
const Category = db.categories;
const Favourites = db.favourites; // Add this line
const { storage } = require("../config/firebase");
const multer = require("multer");
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");

// Multer configuration for handling multiple files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).array("images", 5); // 'images' is the field name, 5 is max number of files

const addProduct = async (req, res, next) => {
  try {
    // Wrap multer upload in promise
    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    const { name, description, price, rating, stock, brand_id, category_id } =
      req.body;
    const imageUrls = [];

    // Upload each image to Firebase
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const timestamp = Date.now();
        const fileName = `images/${timestamp}-${file.originalname}`;
        const storageRef = ref(storage, fileName);

        // Upload to Firebase
        await uploadBytes(storageRef, file.buffer);

        // Get download URL
        const downloadURL = await getDownloadURL(storageRef);
        imageUrls.push(downloadURL);
      }
    }

    // Create product with multiple image URLs
    const newProduct = await Product.create({
      name,
      description,
      price,
      rating,
      stock,
      brand_id,
      category_id,
      images: JSON.stringify(imageUrls), // Store as JSON string in MySQL
    });

    return res.status(201).json({
      message: "Product added successfully",
      product: {
        ...newProduct.toJSON(),
        images: imageUrls, // Send back as array
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getAllProducts = async (req, res) => {
  // console.log("Query Log", req.query);
  try {
    const userId = req.user.id; // Add this line
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Extract filter parameters from query
    const { category_id, brand_id, search, price_range, ratings } = req.query;

    // Build where clause for filters
    const whereClause = {};

    // Handle category filtering for multiple IDs
    if (category_id && category_id !== "all") {
      const categories = category_id.split(",").map((id) => id.trim());
      whereClause.category_id = { [db.Sequelize.Op.in]: categories };
    }

    // Handle brand filtering for multiple IDs
    if (brand_id && brand_id !== "all") {
      const brands = brand_id.split(",").map((id) => id.trim());
      whereClause.brand_id = { [db.Sequelize.Op.in]: brands };
    }

    // Handle price range filtering
    if (price_range) {
      const [minPrice, maxPrice] = price_range.split(",").map(Number);
      whereClause.price = {
        [db.Sequelize.Op.gte]: minPrice,
        [db.Sequelize.Op.lte]: maxPrice,
      };
    }

    // Handle ratings filtering
    if (ratings) {
      whereClause.rating = {
        [db.Sequelize.Op.gte]: Number(ratings),
      };
    }

    // Add search functionality
    if (search) {
      whereClause[db.Sequelize.Op.or] = [
        {
          name: {
            [db.Sequelize.Op.like]: `%${search}%`,
          },
        },
        {
          description: {
            [db.Sequelize.Op.like]: `%${search}%`,
          },
        },
      ];
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      // attributes: {
      //   include: [
      //     [
      //       db.Sequelize.literal(
      //         '(CASE WHEN favourites.product_id IS NOT NULL THEN TRUE ELSE FALSE END)'
      //       ),
      //       'is_favourite'
      //     ]
      //   ]
      // },
      include: [
        {
          model: Brand,
          as: "brand",
        },
        {
          model: Category,
          as: "category",
        },
        {
          model: Favourites,
          as: "favourites",
          where: { user_id: userId },
          required: false, // Include products even if they are not in favourites
          attributes: ["id"], // Only need the id to check if it exists
        },
      ],
      order: [["createdAt", "DESC"]], // Sort by newest first
    });

    // Transform the products to parse the images string into array and add favourite flag
    const formattedProducts = products.map((product) => {
      const productJSON = product.toJSON();
      let images = [];

      try {
        if (productJSON.images) {
          images = JSON.parse(productJSON.images);
        }
      } catch (parseError) {
        console.error("Error parsing images JSON:", parseError);
        images = [];
      }

      return {
        ...productJSON,
        images,
        favourite: productJSON.favourites.length > 0, // Add favourite flag
      };
    });

    res.json({
      products: formattedProducts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count,
      filters: {
        category_id: category_id || null,
        brand_id: brand_id || null,
        search: search || null,
        price_range: price_range || null,
        ratings: ratings || null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
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

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Parse the images JSON string into array
    const productJSON = product.toJSON();
    let images = [];
    try {
      if (productJSON.images) {
        images = JSON.parse(productJSON.images);
      }
    } catch (parseError) {
      console.error("Error parsing images JSON:", parseError);
    }

    return res.status(200).json({
      message: "Product fetched successfully",
      product: {
        ...productJSON,
        images,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const uploadEdit = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).array("newImages", 5); // Change field name to 'productImages'

const updateProduct = async (req, res, next) => {
  try {
    // Wrap multer upload in promise with better error handling
    await new Promise((resolve, reject) => {
      uploadEdit(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading
          reject({
            status: 400,
            message: `Upload error: ${err.message}`,
          });
        } else if (err) {
          // An unknown error occurred
          reject(err);
        }
        resolve();
      });
    });

    const { id } = req.params;
    const {
      name,
      description,
      price,
      rating,
      stock,
      brand_id,
      category_id,
      existingImages, // This will be a JSON string from frontend
    } = req.body;

    // Parse existing images back to array
    const existingImageUrls = JSON.parse(existingImages || "[]");
    const newImageUrls = [];

    // Upload new images to Firebase if any
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const timestamp = Date.now();
        const fileName = `images/${timestamp}-${file.originalname}`;
        const storageRef = ref(storage, fileName);

        // Upload to Firebase
        await uploadBytes(storageRef, file.buffer);

        // Get download URL
        const downloadURL = await getDownloadURL(storageRef);
        newImageUrls.push(downloadURL);
      }
    }

    // Combine existing and new image URLs
    const finalImageUrls = [...existingImageUrls, ...newImageUrls];

    // Update product with combined image URLs
    const updatedProduct = await Product.update(
      {
        name,
        description,
        price,
        rating,
        stock,
        brand_id,
        category_id,
        images: JSON.stringify(finalImageUrls), // Store as JSON string in MySQL
      },
      {
        where: { id },
      }
    );

    // Fetch the updated product to return
    const product = await Product.findByPk(id);

    return res.status(200).json({
      message: "Product updated successfully",
      product: {
        ...product.toJSON(),
        images: finalImageUrls, // Send back as array
      },
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Error updating product",
      error: error,
    });
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Product.destroy({ where: { id } });
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
