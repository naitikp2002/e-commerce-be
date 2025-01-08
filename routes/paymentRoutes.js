const express = require("express");
const router = express.Router();
const app = express();
app.use(express.static("public"));
const {
  getPayment,
  PaymentPost,
  createSetupIntent,
  getSavedCards,
} = require("../controllers/paymentController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/place-order", getPayment);
router.get("/get-saved-cards", authenticate, getSavedCards);
router.post("/create-checkout-session", PaymentPost);
router.post("/create-setup-intent", authenticate,createSetupIntent);

module.exports = router;
