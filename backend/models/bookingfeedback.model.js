const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookingFeedbackSchema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true, // Một booking chỉ có 1 feedback tổng
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BookingFeedback", bookingFeedbackSchema);
