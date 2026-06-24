const User = require('../models/user.model');
const Barber = require('../models/barber.model');
const BarberSchedule = require('../models/barber-schedule.model');
const { uploadAvatar } = require('../services/cloudStorage.service');

const isString = (value) => typeof value === 'string' && value.trim().length > 0;

const normalizeDateString = (date) => {
    const iso = new Date(date).toISOString();
    return iso.split('T')[0];
};

const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const getUpcomingWeekdays = (days = 14) => {
    const dates = [];
    const now = new Date();
    for (let index = 0; index < days; index += 1) {
        const nextDate = new Date(now);
        nextDate.setDate(now.getDate() + index);
        const weekday = nextDate.getDay();
        if (weekday === 0 || weekday === 6) {
            continue; // Skip weekends by default
        }
        dates.push(normalizeDateString(nextDate));
    }
    return dates;
};

const createDefaultSchedules = async (barberId) => {
    const scheduleDates = getUpcomingWeekdays(14);
    const schedules = scheduleDates.map((date) => {
        const schedule = new BarberSchedule({
            barberId,
            date,
            workingHours: { start: '08:00', end: '20:00' },
            slotDuration: 30,
            breakTimes: [],
            isOffDay: false,
        });
        schedule.generateDefaultSlots();
        return schedule;
    });

    if (schedules.length > 0) {
        await BarberSchedule.insertMany(schedules);
    }
};

exports.createAdminBarber = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password,
            bio,
            experienceYears,
            specialties,
            expertiseTags,
            hairTypeExpertise,
            styleExpertise,
            workingSince,
            autoAssignmentEligible,
            maxDailyBookings,
            preferredWorkingHours,
            certifications,
            languages,
            avatarUrl,
            avatarBase64,
        } = req.body;

        if (!isString(name) || !isString(email) || !isString(bio) || !experienceYears) {
            return res.status(400).json({ message: 'Tên, email, bio và số năm kinh nghiệm là bắt buộc.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email đã được sử dụng.' });
        }

        let uploadedAvatarUrl = null;
        if (avatarBase64 || avatarUrl) {
            uploadedAvatarUrl = await uploadAvatar({ avatarUrl, avatarBase64, filename: `barber-${name.replace(/\s+/g, '-').toLowerCase()}` });
        }

        const rawPassword = isString(password) ? password : generateRandomPassword();

        const newUser = new User({
            name,
            email,
            phone: phone || '',
            password: rawPassword,
            role: 'barber',
            status: 'active',
            avatarUrl: uploadedAvatarUrl || '',
            isVerified: false,
        });

        const savedUser = await newUser.save();

        const newBarber = new Barber({
            userId: savedUser._id,
            bio,
            experienceYears,
            specialties: Array.isArray(specialties) ? specialties : specialties ? [specialties] : [],
            expertiseTags: Array.isArray(expertiseTags) ? expertiseTags : expertiseTags ? [expertiseTags] : [],
            hairTypeExpertise: Array.isArray(hairTypeExpertise) ? hairTypeExpertise : hairTypeExpertise ? [hairTypeExpertise] : [],
            styleExpertise: Array.isArray(styleExpertise) ? styleExpertise : styleExpertise ? [styleExpertise] : [],
            workingSince: workingSince ? new Date(workingSince) : new Date(),
            autoAssignmentEligible: autoAssignmentEligible ?? true,
            maxDailyBookings: maxDailyBookings || 12,
            preferredWorkingHours: {
                start: preferredWorkingHours?.start || '08:00',
                end: preferredWorkingHours?.end || '20:00',
            },
            profileImageUrl: uploadedAvatarUrl || '',
            certifications: Array.isArray(certifications) ? certifications : certifications ? [certifications] : [],
            languages: Array.isArray(languages) ? languages : languages ? [languages] : ['Vietnamese'],
            isAvailable: true,
        });

        const savedBarber = await newBarber.save();
        await createDefaultSchedules(savedBarber._id);

        const responseUser = savedUser.toObject();
        delete responseUser.password;
        delete responseUser.otpHash;
        delete responseUser.resetTokenHash;

        return res.status(201).json({
            message: 'Barber mới đã được tạo và lịch mặc định đã được thiết lập.',
            barber: savedBarber,
            user: responseUser,
            tempPassword: !isString(password) ? rawPassword : undefined,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

exports.getAllAdminBarbers = async (req, res) => {
    try {
        const today = normalizeDateString(new Date());
        const nextWeek = new Date();
        nextWeek.setDate(new Date().getDate() + 7);
        const nextWeekStr = normalizeDateString(nextWeek);

        const barbers = await Barber.find().populate('userId', 'name email phone avatarUrl status');
        const barberIds = barbers.map((barber) => barber._id);

        const schedules = await BarberSchedule.find({
            barberId: { $in: barberIds },
            date: { $gte: today, $lte: nextWeekStr },
        }).sort({ date: 1 });

        const scheduleMap = schedules.reduce((acc, schedule) => {
            const id = schedule.barberId.toString();
            if (!acc[id]) acc[id] = [];
            acc[id].push(schedule);
            return acc;
        }, {});

        const result = barbers.map((barber) => {
            const summarySchedules = (scheduleMap[barber._id.toString()] || []).map((schedule) => {
                const available = schedule.availableSlots.filter((slot) => !slot.isBooked && !slot.isBlocked);
                const booked = schedule.availableSlots.filter((slot) => slot.isBooked);
                const blocked = schedule.availableSlots.filter((slot) => !slot.isBooked && slot.isBlocked);
                return {
                    date: schedule.date,
                    isOffDay: schedule.isOffDay,
                    offReason: schedule.offReason,
                    availableSlots: available.length,
                    bookedSlots: booked.length,
                    blockedSlots: blocked.length,
                };
            });

            const userData = barber.userId || {};
            return {
                barber,
                user: {
                    name: userData.name || '',
                    phone: userData.phone || '',
                    avatarUrl: userData.avatarUrl || '',
                    email: userData.email || '',
                    status: userData.status || '',
                },
                scheduleSummary: summarySchedules,
            };
        });

        const staffUsers = await User.find({ role: 'staff' }).select('-passwordHash -otpHash -resetTokenHash');

        return res.json({ barbers: result, staffs: staffUsers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

exports.getAdminBarberFull = async (req, res) => {
    try {
        const { barberId } = req.params;
        const barber = await Barber.findById(barberId);
        if (!barber) {
            return res.status(404).json({ message: 'Không tìm thấy barber.' });
        }

        const user = await User.findById(barber.userId).select('-password -otpHash -otpExpires -resetTokenHash -resetTokenExpires');
        const schedules = await BarberSchedule.find({ barberId: barber._id }).sort({ date: 1 });

        return res.json({
            barber,
            user,
            schedules,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

exports.getAdminBarberById = async (req, res) => {
    try {
        const { barberId } = req.params;
        const barber = await Barber.findById(barberId);
        if (!barber) {
            return res.status(404).json({ message: 'Không tìm thấy barber.' });
        }

        const user = await User.findById(barber.userId).select('-password -otpHash -otpExpires -resetTokenHash -resetTokenExpires');
        const schedules = await BarberSchedule.find({ barberId: barber._id }).sort({ date: 1 });

        return res.json({
            barber,
            user,
            schedules,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

exports.updateAdminBarber = async (req, res) => {
    try {
        const { barberId } = req.params;
        const {
            specialties,
            expertiseTags,
            hairTypeExpertise,
            styleExpertise,
            certifications,
            languages,
            workingSince,
            preferredWorkingHours,
            maxDailyBookings,
            autoAssignmentEligible,
        } = req.body;

        const barber = await Barber.findById(barberId);
        if (!barber) {
            return res.status(404).json({ message: 'Không tìm thấy barber.' });
        }

        if (specialties) barber.specialties = Array.isArray(specialties) ? specialties : [specialties];
        if (expertiseTags) barber.expertiseTags = Array.isArray(expertiseTags) ? expertiseTags : [expertiseTags];
        if (hairTypeExpertise) barber.hairTypeExpertise = Array.isArray(hairTypeExpertise) ? hairTypeExpertise : [hairTypeExpertise];
        if (styleExpertise) barber.styleExpertise = Array.isArray(styleExpertise) ? styleExpertise : [styleExpertise];
        if (certifications) barber.certifications = Array.isArray(certifications) ? certifications : [certifications];
        if (languages) barber.languages = Array.isArray(languages) ? languages : [languages];
        if (workingSince) barber.workingSince = new Date(workingSince);
        if (preferredWorkingHours?.start) barber.preferredWorkingHours.start = preferredWorkingHours.start;
        if (preferredWorkingHours?.end) barber.preferredWorkingHours.end = preferredWorkingHours.end;
        if (typeof maxDailyBookings === 'number' || (typeof maxDailyBookings === 'string' && maxDailyBookings.trim() !== '')) {
            barber.maxDailyBookings = Number(maxDailyBookings);
        }
        if (typeof autoAssignmentEligible === 'boolean') {
            barber.autoAssignmentEligible = autoAssignmentEligible;
        }

        const updatedBarber = await barber.save();

        return res.json({ message: 'Thông tin barber đã được cập nhật.', barber: updatedBarber });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

exports.deactivateAdminBarber = async (req, res) => {
    try {
        const { barberId } = req.params;
        const barber = await Barber.findById(barberId);
        if (!barber) {
            return res.status(404).json({ message: 'Không tìm thấy barber.' });
        }

        const user = await User.findById(barber.userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản người dùng tương ứng.' });
        }

        barber.isAvailable = false;
        await barber.save();

        user.status = 'suspended';
        await user.save();

        const today = normalizeDateString(new Date());
        await BarberSchedule.updateMany(
            { barberId: barber._id, date: { $gte: today } },
            {
                $set: {
                    'availableSlots.$[slot].isBlocked': true,
                    'availableSlots.$[slot].blockReason': 'barber_inactive',
                    isOffDay: true,
                    offReason: 'inactive',
                },
            },
            {
                arrayFilters: [{ 'slot.isBooked': false }],
            }
        );

        return res.json({ message: 'Barber đã được vô hiệu hóa và lịch trống từ hôm nay đã bị khóa.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

exports.activateAdminBarber = async (req, res) => {
    try {
        const { barberId } = req.params;
        const barber = await Barber.findById(barberId);
        if (!barber) {
            return res.status(404).json({ message: 'Không tìm thấy barber.' });
        }

        const user = await User.findById(barber.userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản người dùng tương ứng.' });
        }

        barber.isAvailable = true;
        await barber.save();

        user.status = 'active';
        await user.save();

        const today = normalizeDateString(new Date());
        await BarberSchedule.updateMany(
            { barberId: barber._id, date: { $gte: today }, offReason: 'inactive' },
            {
                $set: {
                    'availableSlots.$[slot].isBlocked': false,
                    'availableSlots.$[slot].blockReason': null,
                    isOffDay: false,
                    offReason: null,
                },
            },
            {
                arrayFilters: [{ 'slot.blockReason': 'barber_inactive' }],
            }
        );

        return res.json({ message: 'Barber đã được kích hoạt lại.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};
