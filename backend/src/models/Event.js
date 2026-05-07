const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  sport: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  locationName: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  participants: { type: Number, required: true, min: 1 },
  participantsList: [{ type: String, ref: "User" }],
  creator: { type: String, ref: "User", required: true },
});

module.exports = mongoose.model("Event", eventSchema);
