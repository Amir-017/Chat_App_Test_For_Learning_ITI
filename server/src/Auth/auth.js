const jwt = require("jsonwebtoken");
 const auth = (req, res, next) => {
const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : authorization;
    const secretKey = process.env.SECRET_KEY || "secret-key";
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
exports.auth = auth;