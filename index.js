const app = require("./app");
const connectWithDb = require("./config/db");

// Insert this to Use the env variables from .env file
require("dotenv").config();

// Connect with Database
connectWithDb();

app.listen(process.env.PORT, () => {
  console.log(`Server is running at port: ${process.env.PORT}`);
});
