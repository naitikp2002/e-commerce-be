const express = require("express");
const router = express.Router();
const app = express();
app.use(express.static('public'));
const { getPayment, PaymentPost } = require("../controllers/paymentController");

router.get("/session-status", getPayment);
router.post("/create-checkout-session", PaymentPost);

module.exports = router;
