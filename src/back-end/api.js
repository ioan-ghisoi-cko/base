const route = require("express").Router();
const { Checkout } = require("checkout-sdk-node");
const cko = new Checkout("sk_test_0b9b5db6-f223-49d0-b68f-f6643dd4f808");

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
