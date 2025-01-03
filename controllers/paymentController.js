const stripe = require("stripe")(
  "sk_test_51QchuML6qcJ4o2wV89HbmyTD0I5utKo51OFVuEoP7DXASi64at6sWfxdyG9F81lnZSvxIK91aF48PMNpdMzC4drs00JWsW0ZfN"
);
const YOUR_DOMAIN = "http://localhost:3000";

// const PaymentPost = async (req, res) => {
//   const session = await stripe.checkout.sessions.create({
//     ui_mode: "hosted",
//     line_items: [
//       {
//         price_data: {
//           currency: "usd",
//           product_data: {
//             name: "T-shirt",
//           },
//           unit_amount: 2000,
//         },
//         quantity: 1,
//       },
//     ],
//     mode: "payment",
//     success_url: `${YOUR_DOMAIN}/return?session_id={CHECKOUT_SESSION_ID}`,
//   });
//   res.send({ clientSecret: session.client_secret });
// };

const PaymentPost = async (req, res) => {
  try {
    const { amount, userId } = req.body;
    const payment = await stripe.paymentIntents.create({
      automatic_payment_methods: { enabled: true },
      amount: amount,
      currency: "usd",
      metadata: {
        userId, // Serialize cartItems to a string
      },
    });
    res.send({ clientSecret: payment.client_secret });
  } catch (error) {
    res.status(400).send({ error: error.raw.message });
  }
};

const getPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Fetch the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Fetch the Charge using latest_charge from PaymentIntent
    if (paymentIntent.latest_charge) {
      const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
      // console.log("Charge retrieved:", charge);

      const userId = paymentIntent.metadata.userId;
      console.log("User Recieved:", userId);

      res.send({
        paymentIntent,
        charge,
        userId, // Card details here
      });
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

module.exports = {
  getPayment,
  PaymentPost,
};
