require("dotenv").config();
const mongoose = require("mongoose");
const Booking = require("../models/booking.model");
const Barber = require("../models/barber.model");
const User = require("../models/user.model");

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for migration");

    // Lấy tất cả Booking
    const bookings = await Booking.find({});
    console.log(`Found ${bookings.length} bookings to inspect.`);

    let migratedCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;

    // Cache cho barber mapping (userId -> barberId)
    const mappingCache = {};

    for (const booking of bookings) {
      if (!booking.barberId) {
        skippedCount++;
        continue;
      }

      const barberIdStr = booking.barberId.toString();

      // Kiểm tra xem ID hiện tại có nằm trong bảng Barber hay không
      const isBarberId = await Barber.findById(barberIdStr);
      
      if (isBarberId) {
        // ID này đã là Barber._id hợp lệ
        skippedCount++;
        continue;
      }

      // Nếu không, khả năng cao ID này là User._id
      // Kiểm tra xem User này có phải là thợ không
      const user = await User.findById(barberIdStr);
      if (user && user.role === 'barber') {
        // ID này chính là userId của thợ!
        // Tìm Barber profile của thợ này
        let barberProfileId = mappingCache[barberIdStr];

        if (!barberProfileId) {
          const barberProfile = await Barber.findOne({ userId: barberIdStr });
          if (barberProfile) {
            barberProfileId = barberProfile._id.toString();
            mappingCache[barberIdStr] = barberProfileId;
          }
        }

        if (barberProfileId) {
          // Cập nhật lại booking.barberId thành Barber._id
          await Booking.findByIdAndUpdate(booking._id, { barberId: barberProfileId });
          console.log(`Migrated booking ${booking._id}: ${barberIdStr} -> ${barberProfileId}`);
          migratedCount++;
        } else {
          console.log(`Warning: Booking ${booking._id} points to Barber User ${barberIdStr} but no Barber profile found.`);
          notFoundCount++;
        }
      } else {
        console.log(`Warning: Booking ${booking._id} has invalid barberId ${barberIdStr} (Not a Barber profile and not a Barber User)`);
        notFoundCount++;
      }
    }

    console.log("\nMigration Summary:");
    console.log(`Total Bookings Processed: ${bookings.length}`);
    console.log(`Skipped (Already correct or null): ${skippedCount}`);
    console.log(`Migrated successfully: ${migratedCount}`);
    console.log(`Warning / Not found: ${notFoundCount}`);

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
