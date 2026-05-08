const mongoose = require("mongoose");

const EVENT_BASE_STATUSES = ["open", "cancelled"];

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    sport: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    locationName: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    participants: { type: Number, required: true, min: 1 },
    participantsList: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: EVENT_BASE_STATUSES,
      default: "open",
      required: true,
    },
    dismissedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

eventSchema.index({ status: 1, date: 1, _id: 1 });
eventSchema.index({ date: 1, _id: 1 });
eventSchema.index({ city: 1, sport: 1, status: 1, date: 1, _id: 1 });
eventSchema.index({ creator: 1, date: 1, _id: 1 });
eventSchema.index({ dismissedBy: 1, status: 1, date: 1 });

module.exports = mongoose.model("Event", eventSchema);
