const {
  addProduct,
  getAllProducts,
} = require("../controllers/productController");
const { authenticate, authorizeRole } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.use(authenticate);
router.get("/all", getAllProducts);
router.use(authorizeRole("admin"));
router.post("/add", addProduct);

module.exports = router;
