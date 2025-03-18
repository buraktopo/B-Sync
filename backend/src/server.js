const dotenv = require("dotenv");
dotenv.config(); // Load environment variables

const connectDB = require("./config/db");
connectDB(); // Connect to MongoDB