const route = require("express").Router();

route.get("/getExample", (req, res) => {
  res.send({ get: "example" });
});

route.post("/postExample", (req, res) => {
  console.log(req.body);
  res.send(req.body);
});

module.exports = route;
