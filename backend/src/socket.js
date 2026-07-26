const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        callback(null, true);
      },
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      let token = socket.handshake.auth.token || socket.handshake.headers.token;
      
      // If token not found in auth/headers, try parsing from cookies (since it is HttpOnly)
      if (!token && socket.handshake.headers.cookie) {
        const cookieStr = socket.handshake.headers.cookie;
        const cookies = cookieStr.split(';').reduce((acc, curr) => {
          const parts = curr.split('=');
          if (parts.length === 2) acc[parts[0].trim()] = parts[1].trim();
          return acc;
        }, {});
        token = cookies.accessToken;
      }
      
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId || decoded.id;
      socket.role = decoded.role;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 User connected to Socket: ${socket.userId} (Role: ${socket.role})`);

    // Join specific room for this user
    socket.join(`room_user_${socket.userId}`);

    // Join specific room for role (if admin/staff)
    if (socket.role === "admin" || socket.role === "staff") {
      socket.join(`room_role_admin`);
    }

    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = {
  initSocket,
  getIO,
};
