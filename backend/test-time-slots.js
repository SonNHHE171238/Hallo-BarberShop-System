require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('./models/user.model');
const Barber = require('./models/barber.model');
const BarberSchedule = require('./models/barber-schedule.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/HalloBarberShop';

async function runTests() {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected.');

    try {
        // 1. CLEAN UP test data
        console.log('🔄 Cleaning up test database...');
        await User.deleteMany({ email: 'test_barber@test.com' });
        await Barber.deleteMany({ bio: 'Test Barber for Slot Algorithm' });
        await BarberSchedule.deleteMany({});

        // 2. CREATE test barber
        console.log('🔄 Seeding test barber...');
        const barberUser = await User.create({
            name: 'Test Barber',
            email: 'test_barber@test.com',
            password: 'password123',
            role: 'barber',
            phone: '0333333333'
        });

        const barber = await Barber.create({
            userId: barberUser._id,
            bio: 'Test Barber for Slot Algorithm',
            experienceYears: 3,
            specialties: ['Classic'],
            workingSince: new Date(),
            maxDailyBookings: 15
        });

        const dateStr = '2026-06-21';

        // Helper to setup/reset barber schedule
        const setupBarberSchedule = async (breakTimes = []) => {
            await BarberSchedule.deleteMany({ barberId: barber._id, date: dateStr });
            const schedule = new BarberSchedule({
                barberId: barber._id,
                date: dateStr,
                workingHours: { start: "09:00", end: "18:00" },
                slotDuration: 30,
                breakTimes: breakTimes
            });
            schedule.generateDefaultSlots();
            await schedule.save();
            return schedule;
        };

        console.log('\n--- TIME SLOT SPLIT ALGORITHM TESTS ---');

        // Test 2.1: Default schedule slot generation (30 min service)
        console.log('▶️ Test 2.1: Simple 30-minute service start times (Default Schedule)');
        await setupBarberSchedule();
        let slotsData = await BarberSchedule.generateAvailableStartTimes(barber._id, dateStr, 30);
        
        // Expected slots: 09:00, 09:30, ..., 17:30 (total 18 slots)
        if (slotsData.available && slotsData.slots.length === 18) {
            console.log(`✅ Success: Generated ${slotsData.slots.length} available slots.`);
            console.log(`   First slot: ${slotsData.slots[0].startTime} - ${slotsData.slots[0].endTime}`);
            console.log(`   Last slot: ${slotsData.slots[slotsData.slots.length - 1].startTime} - ${slotsData.slots[slotsData.slots.length - 1].endTime}`);
        } else {
            console.error('❌ Fail: Default 30-min slot generation failed.', slotsData);
        }

        // Test 2.2: Contiguous slot requirements (60 min service)
        console.log('▶️ Test 2.2: 60-minute service start times (Needs 2 contiguous 30-min slots)');
        slotsData = await BarberSchedule.generateAvailableStartTimes(barber._id, dateStr, 60);
        // Expected slots: 09:00, 09:30, ..., 17:00 (total 17 slots, since 17:30 requires till 18:30 which is past workingHours end 18:00)
        if (slotsData.available && slotsData.slots.length === 17) {
            console.log(`✅ Success: Generated ${slotsData.slots.length} available start times.`);
            console.log(`   First slot: ${slotsData.slots[0].startTime} - ${slotsData.slots[0].endTime}`); // 09:00 - 10:00
            console.log(`   Last slot: ${slotsData.slots[slotsData.slots.length - 1].startTime} - ${slotsData.slots[slotsData.slots.length - 1].endTime}`); // 17:00 - 18:00
            
            // Check if first slot end time is correct
            if (slotsData.slots[0].endTime === '10:00') {
                console.log('   First slot end time is correct (10:00).');
            } else {
                console.error('   Incorrect end time for 60-min service:', slotsData.slots[0]);
            }
        } else {
            console.error('❌ Fail: 60-min slot generation failed.', slotsData);
        }

        // Test 2.3: Booking conflicts in between slots
        console.log('▶️ Test 2.3: Booked slot check (Book 10:00 slot, check if 60-min service handles it)');
        const schedule = await setupBarberSchedule();
        
        // Find 10:00 slot and mark as booked
        const idx = schedule.availableSlots.findIndex(s => s.time === '10:00');
        schedule.availableSlots[idx].isBooked = true;
        schedule.availableSlots[idx].bookingId = new mongoose.Types.ObjectId();
        await schedule.save();

        slotsData = await BarberSchedule.generateAvailableStartTimes(barber._id, dateStr, 60);
        
        // A 60-min service starting at 09:30 needs 09:30 & 10:00. 10:00 is booked, so 09:30 should NOT be available.
        // A 60-min service starting at 10:00 needs 10:00 & 10:30. 10:00 is booked, so 10:00 should NOT be available.
        // Let's search if 09:30 or 10:00 are in the list.
        const suggestedStarts = slotsData.slots.map(s => s.startTime);
        const hasOverlapConflict = suggestedStarts.includes('09:30') || suggestedStarts.includes('10:00');
        
        if (slotsData.available && !hasOverlapConflict) {
            console.log('✅ Success: The algorithm correctly avoided booked slots and overlap ranges.');
            console.log('   Suggested starts around conflict:', suggestedStarts.filter(t => t >= '09:00' && t <= '11:00'));
        } else {
            console.error('❌ Fail: Overlapping booked slots were incorrectly included in start times.', suggestedStarts);
        }

        // Test 2.4: Break times non-contiguity check
        console.log('▶️ Test 2.4: Schedule break check (Break 12:00 - 13:00, check 60-min service)');
        // 12:00 - 13:00 has break, meaning 12:00 and 12:30 slots are NOT created.
        // A 60-min service starting at 11:30 would need 11:30 & 12:00. But 12:00 is a break, so 11:30 should NOT be available.
        await setupBarberSchedule([
            { start: '12:00', end: '13:00', reason: 'Lunch' }
        ]);

        slotsData = await BarberSchedule.generateAvailableStartTimes(barber._id, dateStr, 60);
        const startsWithBreak = slotsData.slots.map(s => s.startTime);
        
        // 11:30 needs 11:30 and 12:00 (break) -> should be excluded
        // 12:00 is break -> should be excluded
        // 12:30 is break -> should be excluded
        // 13:00 is working hour -> 13:00 & 13:30 are working hours -> 13:00 should be included
        const check1130Excluded = !startsWithBreak.includes('11:30');
        const check1200Excluded = !startsWithBreak.includes('12:00');
        const check1230Excluded = !startsWithBreak.includes('12:30');
        const check1300Included = startsWithBreak.includes('13:00');

        if (check1130Excluded && check1200Excluded && check1230Excluded && check1300Included) {
            console.log('✅ Success: The algorithm correctly handles schedule breaks as non-contiguous gaps.');
            console.log('   Suggested starts around lunch break:', startsWithBreak.filter(t => t >= '11:00' && t <= '14:00'));
        } else {
            console.error('❌ Fail: The algorithm failed to handle schedule breaks correctly.', {
                startsWithBreak,
                check1130Excluded,
                check1200Excluded,
                check1230Excluded,
                check1300Included
            });
        }

        // Test 2.5: fromTime parameter filter check
        console.log('▶️ Test 2.5: Filter start times by fromTime ("15:00")');
        slotsData = await BarberSchedule.generateAvailableStartTimes(barber._id, dateStr, 30, '15:00');
        const startsWithFromTime = slotsData.slots.map(s => s.startTime);
        const hasBefore1500 = startsWithFromTime.some(t => t < '15:00');
        const has1500 = startsWithFromTime.includes('15:00');

        if (slotsData.available && !hasBefore1500 && has1500) {
            console.log('✅ Success: Filter by fromTime works correctly.');
            console.log('   Suggested starts:', startsWithFromTime);
        } else {
            console.error('❌ Fail: fromTime filter test failed.', {
                startsWithFromTime,
                hasBefore1500,
                has1500
            });
        }

    } catch (err) {
        console.error('❌ System Error during testing:', err);
    } finally {
        // Disconnect DB
        console.log('🔄 Disconnecting from MongoDB...');
        await mongoose.disconnect();
        console.log('✅ Disconnected.');
        console.log('\n🏁 Time Slot Algorithm Tests Completed.');
    }
}

runTests();
