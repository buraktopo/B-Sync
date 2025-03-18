const app = require("./app");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
connectDB() // Connect MongoDB before starting the server
  .then(() => {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to the database", err);
    process.exit(1); // Exit the process with failure
  });