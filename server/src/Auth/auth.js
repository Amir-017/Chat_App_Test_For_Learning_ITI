const jwt = require("jsonwebtoken");
 const auth = (req, res, next) => {
const { authorization } = req.headers;
console.log("Authorization Header:", authorization);
console.log("Secret Key:", process.env.SECRET_KEY);
  if (!authorization) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(authorization, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
exports.auth = auth;