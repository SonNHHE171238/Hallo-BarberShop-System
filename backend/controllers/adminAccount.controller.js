const User = require('../models/user.model');
const cloudStorageService = require('../services/cloudStorage.service');

// Hàm tiện ích ném lỗi thân thiện với người dùng (tiếng Việt)
const throwUserFriendlyError = (msg, statusCode = 400) => {
    const error = new Error(msg);
    error.statusCode = statusCode;
    error.isOperational = true;
    throw error;
};

exports.getAllAccounts = async (req, res, next) => {
    try {
        const users = await User.find({ isDeleted: { $ne: true } })
            .select('-passwordHash -otpHash -resetTokenHash')
            .sort({ createdAt: -1 });
        return res.json({ users });
    } catch (error) {
        next(error);
    }
};

exports.createAccount = async (req, res, next) => {
    try {
        const { name, email, phone, password, role } = req.body;
        
        if (!name || !email || !password || !role) {
            throwUserFriendlyError('Vui lòng điền đầy đủ các thông tin: Tên, Email, Mật khẩu và Chức vụ.', 400);
        }

        if (!['admin', 'staff', 'barber', 'customer'].includes(role)) {
            throwUserFriendlyError('Chức vụ không hợp lệ. Vui lòng chọn Quản trị viên, Nhân viên, Thợ cắt hoặc Khách hàng.', 400);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throwUserFriendlyError('Địa chỉ email này đã tồn tại trong hệ thống. Vui lòng sử dụng một email khác.', 409);
        }

        const newUser = new User({
            name,
            email,
            phone: phone || '',
            passwordHash: password, // Mongoose schema có pre('save') để tự băm (hash) mật khẩu này
            role,
            status: 'active',
            isVerified: true, // Tài khoản do Admin tạo thì mặc định đã xác thực
        });

        const savedUser = await newUser.save();
        
        const responseUser = savedUser.toObject();
        delete responseUser.passwordHash;

        return res.status(201).json({
            message: 'Tạo tài khoản mới thành công!',
            user: responseUser
        });
    } catch (error) {
        // Dự phòng: Bắt lỗi trùng lặp (Duplicate Key) từ MongoDB nếu có race condition
        if (error.code === 11000) {
            error.message = 'Địa chỉ email này đã tồn tại trong hệ thống. Vui lòng sử dụng một email khác.';
            error.statusCode = 409;
            error.isOperational = true;
        }
        next(error);
    }
};


exports.deleteAccount = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            throwUserFriendlyError('Không tìm thấy tài khoản này.', 404);
        }

        if (user.role === 'admin') {
            throwUserFriendlyError('Bạn không thể xóa tài khoản của Quản trị viên. Hãy hạ cấp họ xuống trước.', 403);
        }

        // Soft delete
        user.isDeleted = true;
        user.status = 'banned'; // Đảm bảo không thể đăng nhập
        await user.save();

        return res.json({
            message: 'Đã xóa tài khoản thành công (Khóa mềm).',
            user
        });
    } catch (error) {
        next(error);
    }
};
