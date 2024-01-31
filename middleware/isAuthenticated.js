const jwt = require("jsonwebtoken");

module.exports = async function isAuthenticated(req, res, next) {
  if (req.headers["authorization"]) {
    const token = req.headers["authorization"].split(" ")[1];

    jwt.verify(token, "secret", (err, user) => {
      if (err) return res.json({ message: "invalid token" });
      else {
        (req.user = user), next();
      }
    });
  } else {
    return res.json({ message: "invalid token" });
  }
};
