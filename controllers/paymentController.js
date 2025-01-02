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
    const { amount } = req.body;
    const payment = await stripe.paymentIntents.create({
      automatic_payment_methods: { enabled: true },
      amount: amount,
      currency: "usd",
    });
    res.send({ clientSecret: payment.client_secret });
  } catch (error) {
    res.status(400).send({ error: error.raw.message });
  }
};

const getPayment = async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

  res.send({
    status: session.status,
    customer_email: session.customer_details.email,
  });
};

module.exports = {
  getPayment,
  PaymentPost,
};
