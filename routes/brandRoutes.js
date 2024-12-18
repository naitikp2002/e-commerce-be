const express = require("express");
const router = express.Router();
const { 
  addBrand, 
  getAllBrands,
  getProductsByBrand,
  getAllBrandsWithProducts
} = require("../controllers/brandController");
const { authenticate, authorizeRole } = require("../middleware/authMiddleware");

router.use(authenticate);
router.get("/all", getAllBrands);
router.get("/products/:brandId", getProductsByBrand);
router.get("/with-products", getAllBrandsWithProducts);
router.use(authorizeRole("admin"));
router.post("/add", addBrand);

module.exports = router;
