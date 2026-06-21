const User = require('../models/user.model');
const Barber = require('../models/barber.model');
const BarberSchedule = require('../models/barber-schedule.model');
const { uploadAvatar } = require('../services/cloudStorage.service');
const ExcelJS = require('exceljs');

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

        return res.json({ barbers: result });
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

exports.exportAdminBarbersCSV = async (req, res) => {
    try {
        const barbers = await Barber.find().populate('userId', 'name email phone avatarUrl status');

        const header = [
            'Name',
            'Email',
            'Phone',
            'Status',
            'Specialties',
            'Certifications',
            'Languages',
            'WorkingSince',
            'MaxDailyBookings',
            'AutoAssignmentEligible',
            'ExperienceYears',
            'Rating',
            'Bio',
        ];

        const csvEscape = (v) => {
            if (v === null || v === undefined) return '';
            const s = String(v);
            return `"${s.replace(/"/g, '""')}"`;
        };

        const rows = [header.join(',')];

        barbers.forEach((barber) => {
            const user = barber.userId || {};
            const specialties = Array.isArray(barber.specialties) ? barber.specialties.join(';') : barber.specialties || '';
            const certifications = Array.isArray(barber.certifications) ? barber.certifications.join(';') : barber.certifications || '';
            const languages = Array.isArray(barber.languages) ? barber.languages.join(';') : barber.languages || '';

            const row = [
                csvEscape(user.name || barber.name || ''),
                csvEscape(user.email || ''),
                csvEscape(user.phone || ''),
                csvEscape(user.status || barber.status || ''),
                csvEscape(specialties),
                csvEscape(certifications),
                csvEscape(languages),
                csvEscape(barber.workingSince || ''),
                csvEscape(barber.maxDailyBookings || ''),
                csvEscape(barber.autoAssignmentEligible ? 'true' : 'false'),
                csvEscape(barber.experienceYears || ''),
                csvEscape(barber.averageRating || barber.rating || ''),
                csvEscape(barber.bio || ''),
            ];

            rows.push(row.join(','));
        });

        const csvContent = rows.join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="barbers.csv"');
        return res.send(csvContent);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

exports.exportAdminBarbersXLSX = async (req, res) => {
    try {
        const barbers = await Barber.find().populate('userId', 'name email phone avatarUrl status');

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Barbers');

        sheet.columns = [
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Phone', key: 'phone', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Specialties', key: 'specialties', width: 40 },
            { header: 'Certifications', key: 'certifications', width: 40 },
            { header: 'Languages', key: 'languages', width: 30 },
            { header: 'WorkingSince', key: 'workingSince', width: 20 },
            { header: 'MaxDailyBookings', key: 'maxDailyBookings', width: 15 },
            { header: 'AutoAssignmentEligible', key: 'autoAssignmentEligible', width: 10 },
            { header: 'ExperienceYears', key: 'experienceYears', width: 10 },
            { header: 'Rating', key: 'rating', width: 10 },
            { header: 'Bio', key: 'bio', width: 50 },
        ];

        barbers.forEach((barber) => {
            const user = barber.userId || {};
            sheet.addRow({
                name: user.name || barber.name || '',
                email: user.email || '',
                phone: user.phone || '',
                status: user.status || barber.status || '',
                specialties: Array.isArray(barber.specialties) ? barber.specialties.join('; ') : (barber.specialties || ''),
                certifications: Array.isArray(barber.certifications) ? barber.certifications.join('; ') : (barber.certifications || ''),
                languages: Array.isArray(barber.languages) ? barber.languages.join('; ') : (barber.languages || ''),
                workingSince: barber.workingSince || '',
                maxDailyBookings: barber.maxDailyBookings || '',
                autoAssignmentEligible: barber.autoAssignmentEligible ? 'true' : 'false',
                experienceYears: barber.experienceYears || '',
                rating: barber.averageRating || barber.rating || '',
                bio: barber.bio || '',
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="barbers.xlsx"');
        return res.send(Buffer.from(buffer));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};
