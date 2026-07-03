const mongoose = require("mongoose");
const { Schema } = mongoose;

const feedbackBarberSchema = new Schema(
  {
    barberId: {
      type: Schema.Types.ObjectId,
      ref: "Barber", // Trỏ tới model Barber
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // Guest thì không có userId
      default: null,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FeedbackBarber", feedbackBarberSchema);
