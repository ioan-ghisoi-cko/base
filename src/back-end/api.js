const route = require("express").Router();
const { Checkout } = require("checkout-sdk-node");
const cko = new Checkout("sk_test_0b9b5db6-f223-49d0-b68f-f6643dd4f808");

route.post("/payWithToken", async (req, res) => {
  const payment = await cko.payments.request({
    source: {
      token: req.body.token,
    },
    currency: "EUR",
    amount: 1000, // cents
    reference: "ORDER123",
  });
  res.send(payment);
});

module.exports = route;
