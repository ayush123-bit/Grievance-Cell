const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  teacherId: {
    type: Number
  },
  name: {
    type: String
  },
  phonenumber: {
    type: Number
  },
  password: {
    type: String
  },
  category: {
    type: String
  },
  email: {
    type: String
  },
  branch: {
    type: String  // Adding the branch field
  }
});

const UCER2 = mongoose.model("teachers1", teacherSchema);

module.exports = UCER2;
