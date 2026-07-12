const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const User = require('./models/user.model');
const Barber = require('./models/barber.model');
const BarberSchedule = require('./models/barber-schedule.model');

async function test() {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGO_URI_LOCAL || 'mongodb://localhost:27017/hallobarbershop');
    
    // Find a barber
    const barber = await Barber.findOne({});
    const normalizeDateString = (date) => {
        const iso = new Date(date).toISOString();
        return iso.split('T')[0];
    };
    const today = normalizeDateString(new Date());
    
    try {
        await BarberSchedule.updateMany(
            { barberId: barber._id, date: { $gte: today } },
            {
                $set: {
                    'availableSlots.$[slot].isBlocked': true,
                    'availableSlots.$[slot].blockReason': 'barber_deleted',
                    isOffDay: true,
                    offReason: 'other',
                },
            },
            {
                arrayFilters: [{ 'slot.isBooked': false }],
            }
        );
        console.log("Success updateMany");
    } catch (e) {
        console.log("Error updateMany:", e.message);
    }
    process.exit(0);
}

test();
