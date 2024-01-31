const express = require("express");
const mongoose = require("mongoose");
const amqp = require("amqplib");
const isAuthenticated = require("./../middleware/isAuthenticated");
const ProductModel = require("./product.model");
const app = express();

const PORT = process.env_PORT || 8002;
app.use(express.json());

var channel, connection;
mongoose
  .connect("mongodb://localhost:27017/product-service", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Product-service DB connected");
  })
  .catch((err) => console.log(err));

async function connect() {
  const amqpServer = "amqp://localhost:5672";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue("PRODUCT");
}

connect();

app.post("/product/create", isAuthenticated, (req, res) => {
  const { name, description, price } = req.body;
  const newProduct = new ProductModel({ name, description, price });
  newProduct.save();
  return res.json(newProduct);
});
app.post("/product/buy", isAuthenticated, async (req, res) => {
  const { ids } = req.body;
  const products = await ProductModel.find({ _id: { $in: ids } });
  channel.sendToQueue(
    "ORDER",
    Buffer.from(JSON.stringify({ products, userEmail: req.user.email }))
  );
  channel.consume("PRODUCT", (data) => {
    console.log("Consuming PRODUCT queue");
    var order = JSON.parse(data.content);
    channel.ack(data);
    return res.json(order);
  });
});
app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});
