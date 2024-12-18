const express = require("express");
const router = express.Router();
const {
  addCategory,
  getAllCategories,
  getProductsByCategory,
  getAllCategoriesWithProducts
} = require("../controllers/categoryController");
const { authenticate, authorizeRole } = require("../middleware/authMiddleware");

router.use(authenticate);
router.get("/all", getAllCategories);
router.get("/products/:categoryId", getProductsByCategory);
router.get("/with-products", getAllCategoriesWithProducts);
router.use(authorizeRole("admin"));
router.post("/add", addCategory);

module.exports = router;
