const {
  getAllOrdersByUserId,
  getAllOrders,
  getOrderListAdmin,
} = require("../controllers/orderController");
const { authenticate, authorizeRole } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.use(authenticate);
router.get("/all", authorizeRole("admin"), getAllOrders);
router.get("/admin/all", authorizeRole("admin"), getOrderListAdmin);
router.get("/:id", getAllOrdersByUserId);

module.exports = router;
