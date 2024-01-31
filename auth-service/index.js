const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env_PORT || 8001;
const {register,login} = require("./user.controller")
app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/auth-service", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Auth-service DB connected");
  })
  .catch((err) => console.log(err));

app.post('/auth/register',register)
app.post('/auth/login',login)


app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
