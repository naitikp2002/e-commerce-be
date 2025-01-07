const {
    getOrderDetailsByOrderId
  } = require("../controllers/orderController");
  const { authenticate, authorizeRole } = require("../middleware/authMiddleware");
  
  const router = require("express").Router();
  
  router.use(authenticate);
//   router.get("/all", authorizeRole("admin"), getAllOrders);
  router.get("/:id", getOrderDetailsByOrderId);
  
  module.exports = router;
  