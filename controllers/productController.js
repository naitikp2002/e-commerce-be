const db = require("../models/index");
const Product = db.products;
const Brand = db.brands;
const Category = db.categories;
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

// const getAllProducts = async (req, res) => {
//   try {
//     const products = await Product.findAll({
//       include: [
//         {
//           model: Brand,
//           as: "brand",
//           // attributes: ["name"],
//         },
//         {
//           model: Category,
//           as: "category",
//           // attributes: ["name"],
//         },
//       ],
//     });

//     // Transform the products to parse the images string into array
//     const formattedProducts = products.map((product) => {
//       const productJSON = product.toJSON();
//       let images = [];

//       try {
//         // Attempt to parse images if it exists and is not empty
//         if (productJSON.images) {
//           images = JSON.parse(productJSON.images);
//         }
//       } catch (parseError) {
//         console.error("Error parsing images JSON:", parseError);
//         // If parsing fails, default to empty array
//         images = [];
//       }

//       return {
//         ...productJSON,
//         images,
//       };
//     });

//     return res
//       .status(200)
//       .json({
//         message: "Products fetched successfully",
//         products: formattedProducts,
//       });
//   } catch (error) {
//     console.error("Error:", error);
//     return res
//       .status(500)
//       .json({ message: "Error fetching products", error: error.message });
//   }
// };

const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: products } = await Product.findAndCountAll({
      limit,
      offset,
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

    // Transform the products to parse the images string into array
    const formattedProducts = products.map(product => {
      const productJSON = product.toJSON();
      let images = [];
      
      try {
        if (productJSON.images) {
          images = JSON.parse(productJSON.images);
        }
      } catch (parseError) {
        console.error('Error parsing images JSON:', parseError);
        images = [];
      }

      return {
        ...productJSON,
        images
      };
    });

    res.json({
      products: formattedProducts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count
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

module.exports = { addProduct, getAllProducts, getProductById, updateProduct, deleteProduct };
