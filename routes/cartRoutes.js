const express = require("express");
const router = express.Router();
const { authenticate, authorizeRole } = require("../middleware/authMiddleware");
const { getCartDetails, addToCart } = require("../controllers/cartController");

router.use(authenticate);
router.get("/all", authorizeRole("admin"),getCartDetails);
router.get("/:userId", getCartDetails);
router.put("/", addToCart);

module.exports = router;
