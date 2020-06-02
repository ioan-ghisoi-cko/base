const route = require("express").Router();
const { Checkout } = require("checkout-sdk-node");
const cko = new Checkout("sk_test_07fa5e52-3971-4bab-ae6b-a8e26007fccc");

route.post("/payWithToken", async (req, res) => {
  console.log(req.body.token);
  const payment = await cko.payments.request({
    source: {
      token: req.body.token,
    },
    currency: "GBP",
    amount: 400, // pence
    reference: "TEST-ORDER",
  });
  res.send(payment);
});

module.exports = route;
