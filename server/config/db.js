const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
const connectWithDb = async () => {
  await mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log("DB GOT CONNECTED"))
    .catch((error) => {
      console.log("DB CONNECTION ISSUES");
      console.log(error);
      process.exit(1);
    });
};

module.exports = connectWithDb;
