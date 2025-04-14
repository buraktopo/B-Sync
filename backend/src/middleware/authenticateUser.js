const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateUser = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Authentication token is missing." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "Invalid authentication token." });
    }

    req.userId = user._id;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Failed to authenticate user." });
  }
};

module.exports = authenticateUser;