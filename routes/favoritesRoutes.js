const express = require("express");
const router = express.Router();
const { authenticate, authorizeRole } = require("../middleware/authMiddleware");
const {
  toggleFavourite,
  getFavourites,
} = require("../controllers/favouritesController");

router.use(authenticate);
router.put("/", toggleFavourite);
router.get("/", getFavourites);

module.exports = router;
