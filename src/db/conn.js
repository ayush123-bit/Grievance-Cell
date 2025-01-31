
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO)
  .then(() => {
    console.log("Connection Successful");
  })
  .catch((e) => {
    console.log(e);
  });
