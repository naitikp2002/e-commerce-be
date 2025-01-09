const { placeOrder } = require("./orderController");
const db = require("../models/index");
const Orders = db.orders;
const User = db.users;
const stripe = require("stripe")(
  "sk_test_51QchuML6qcJ4o2wV89HbmyTD0I5utKo51OFVuEoP7DXASi64at6sWfxdyG9F81lnZSvxIK91aF48PMNpdMzC4drs00JWsW0ZfN"
);
const YOUR_DOMAIN = "http://localhost:3000";

const PaymentPost = async (req, res) => {
  try {
    const { amount, userId, selectedAddress } = req.body;
    const payment = await stripe.paymentIntents.create({
      automatic_payment_methods: { enabled: true },
      amount: amount,
      currency: "usd",
      metadata: {
        userId,
        selectedAddress,
      },
    });
    res.send({ clientSecret: payment.client_secret });
  } catch (error) {
    res.status(400).send({ error: error.raw.message });
  }
};

const getPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.query;

    const checkOrder = await Orders.findAll({
      where: { payment_id: paymentIntentId },
    });
    if (checkOrder.length > 0) {
      res.status(500).json({
        success: false,
        message: "Order already placed",
      });
      return;
    }
    // Fetch the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.latest_charge) {
      const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);

      const { userId, selectedAddress } = paymentIntent.metadata;
      console.log("User Recieved:", userId, selectedAddress);
      const orderPayload = {
        userId,
        addressId: selectedAddress,
        paymentMethod: charge?.payment_method_details?.type,
        paymentDetails: charge?.payment_method_details,
        paymentId: paymentIntentId,
      };
      try {
        const placeOrderResponse = await placeOrder(orderPayload);
        res.status(200).json({
          success: true,
          message: "Order placed successfully",
          data: placeOrderResponse,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to place order",
          error: error.message,
        });
      }
    } else {
      res
        .status(404)
        .send({ error: "No charge found for the given PaymentIntent." });
    }
  } catch (error) {
    console.error("Error retrieving payment details:", error);
    res.status(500).send({ error: error.message });
  }
};

const createSetupIntent = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne({
      where: { id: userId },
    });
    const stripeCustomerId = user.stripe_customer_id;

    if (!stripeCustomerId) {
      return res
        .status(400)
        .json({ message: "Stripe customer ID is required" });
    }

    // Create a SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
    });

    res.status(200).json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error("Error creating SetupIntent:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const getSavedCards = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne({
      where: { id: userId },
    });
    const stripeCustomerId = user.stripe_customer_id;

    if (!stripeCustomerId) {
      return res
        .status(400)
        .json({ message: "Stripe customer ID is required" });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: "card",
    });

    res.status(200).json({ paymentMethods });
  } catch (error) {
    console.error("Error fetching saved cards:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const makePaymentUsingSavedCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne({
      where: { id: userId },
    });
    const stripeCustomerId = user.stripe_customer_id;
    const { paymentMethodId, amount, selectedAddress } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ message: "Payment method ID is required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      metadata: {
        userId,
        selectedAddress,
      },
      off_session: true, // Off-session payments (optional)
      confirm: true, // Confirm immediately
    });

    res.status(200).json({ paymentIntent });
  } catch (error) {
    console.error("Error making payment:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPayment,
  PaymentPost,
  createSetupIntent,
  getSavedCards,
  makePaymentUsingSavedCard,
};
