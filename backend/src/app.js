const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoute = require("../routes/auth.route");
const bookingRoute = require("../routes/booking.route");
const adminBarberRoute = require("../routes/adminBarber.route");
const adminAccountRoute = require("../routes/adminAccount.route");
const chatbotRoute = require("../routes/chatbot.route");
const customerRoute = require("../routes/customer.route");
const serviceRoute = require("../routes/service.route");
const barberRoute = require("../routes/barber.route");
const staffRoute = require("../routes/staff.route");
const rosterRoute = require("../routes/roster.route");
const errorHandler = require("../middlewares/error.middleware");

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, true); // Bỏ qua lỗi CORS khi truy cập từ thiết bị khác trong mạng LAN
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/admin/barbers", adminBarberRoute);
app.use("/api/admin/accounts", adminAccountRoute);
app.use("/api/chatbot", chatbotRoute);
app.use("/api/customer", customerRoute);
app.use("/api/services", serviceRoute);
app.use("/api/barbers", barberRoute);
app.use("/api/staff", staffRoute);
app.use("/api/payment", require("../routes/payment.route"));
app.use("/api/rosters", rosterRoute);

app.get("/", (req, res) => {
  res.send("Hallo BarberShop API is running");
});

// Error Handling Middleware (phải nằm cuối cùng)
app.use(errorHandler);

module.exports = app;
