const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  userName: { type: String, required: true, unique: true, trim: true },
  city: String,
  email: { type: String, required: true, unique: true, trim: true },
  birthdate: Date,
  password: { type: String, required: true },
  joinedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
});

module.exports = mongoose.model("User", userSchema);
