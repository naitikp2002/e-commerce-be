const {
  addProduct,
  getAllProducts,
} = require("../controllers/productController");
const { authenticate, authorizeRole } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.use(authenticate);
router.get("/all", getAllProducts);
router.post("/add", addProduct);
router.use(authorizeRole("admin"));

module.exports = router;
