const express = require("express");
const router = express.Router();
const { authenticate, authorizeRole } = require("../middleware/authMiddleware");
const { getUserAddresses, addAddress } = require("../controllers/addressController");

router.use(authenticate);
// router.get("/all", authorizeRole("admin"),getCartDetails);
router.get("/", getUserAddresses);
router.post("/", addAddress);

module.exports = router;
