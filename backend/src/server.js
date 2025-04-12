const dotenv = require("dotenv");
dotenv.config(); // Load environment variables

const connectDB = require("./config/db");
connectDB(); // Connect to MongoDB

const app = require("./app");

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});