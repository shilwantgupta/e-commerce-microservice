const express = require("express");
const mongoose = require("mongoose");
const amqp = require("amqplib");
const app = express();
const OrderModel = require("./order.model");
const PORT = process.env_PORT || 8003;
app.use(express.json());

var channel, connection;
mongoose
  .connect("mongodb://localhost:27017/order-service", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Order-service DB connected");
  })
  .catch((err) => console.log(err));

async function connect() {
  const amqpServer = "amqp://localhost:5672";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue("ORDER");
}
function createOrder(products, userEmail) {
  let total = 0;
  for (let i = 0; i < products.length; i++) {
    total += products[i].price;
  }

  const newOrder = new OrderModel({
    products,
    user: userEmail,
    total_price: total,
  });
  newOrder.save();
  return newOrder;
}
connect().then(() => {
  channel.consume("ORDER", (data) => {
    const { products, userEmail } = JSON.parse(data.content);
    console.log("Consuming order");
    // console.log(products, userEmail);
    const newOrder = createOrder(products, userEmail);
    channel.ack(data);
    channel.sendToQueue("PRODUCT", Buffer.from(JSON.stringify({ newOrder })));
  });
});

app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});
