const User = require('../models/user.model');

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

exports.updateAccountStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'banned', 'suspended'].includes(status)) {
            throwUserFriendlyError('Trạng thái không hợp lệ. Hệ thống chỉ chấp nhận: Đang hoạt động, Bị khóa hoặc Đình chỉ.', 400);
        }

        const user = await User.findById(id);
        if (!user) {
            throwUserFriendlyError('Không tìm thấy tài khoản này. Có thể tài khoản đã bị xóa.', 404);
        }
        
        // Chống Admin tự khoá mình hoặc khoá admin khác (bảo vệ an toàn cơ bản)
        if (user.role === 'admin' && status !== 'active') {
             throwUserFriendlyError('Bạn không thể khóa tài khoản của một Quản trị viên khác.', 403);
        }

        user.status = status;
        await user.save();

        const message = status === 'active' 
            ? 'Tài khoản đã được mở khóa và có thể đăng nhập bình thường.' 
            : 'Tài khoản đã bị khóa. Người dùng sẽ không thể đăng nhập.';

        return res.json({
            message,
            user
        });
    } catch (error) {
        next(error);
    }
};

exports.updateAccountRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['admin', 'staff', 'barber', 'customer'].includes(role)) {
            throwUserFriendlyError('Chức vụ được chọn không tồn tại trong hệ thống.', 400);
        }

        const user = await User.findById(id);
        if (!user) {
            throwUserFriendlyError('Không tìm thấy tài khoản này.', 404);
        }

        user.role = role;
        await user.save();

        return res.json({
            message: 'Đã thay đổi chức vụ của tài khoản thành công.',
            user
        });
    } catch (error) {
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
