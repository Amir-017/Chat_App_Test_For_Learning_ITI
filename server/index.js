// require modules
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger");
const Message = require("./src/models/messages.models");
const Group = require("./src/models/groups.models");
const User = require("./src/models/users.models");
const userRoutes = require("./src/routes/users.routes");
const messageRouter = require("./src/routes/messages.routes");
const groupRouter = require("./src/routes/groups.routes");
const { deleteMessage, editMessage, clearChat } = require("./src/controller/messages.controller");
const { clerkMiddleware, verifySocketToken, getOrCreateLocalUser } = require("./src/Auth/auth");
const app = express();

// all the middlewares
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());


// api docs (swagger)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

// routes
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRouter);
app.use("/api/groups", groupRouter);

// Catches multer/cloudinary upload errors (bad file type, too large, etc.) and returns JSON instead of an HTML error page
app.use((error, req, res, next) => {
    if (error) {
        return res.status(400).json({ message: error.message });
    }
    next();
});

const server = http.createServer(app);

// socket.io
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
    },
});

app.set("io", io);

// Verifies the Clerk session token sent in the handshake and attaches the resolved local user id to the socket, so every event below trusts socket.data.userId instead of whatever the client claims
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(new Error("Authentication required"));
        }

        const clerkId = await verifySocketToken(token);

        if (!clerkId) {
            return next(new Error("Invalid session"));
        }

        const user = await getOrCreateLocalUser(clerkId);
        socket.data.userId = String(user._id);
        next();
    } catch (error) {
        console.error("Socket auth error:", error.message);
        next(new Error("Authentication failed"));
    }
});

// Tracks every socket id currently open per user (a user can have multiple tabs/devices), so we
// only flip them offline once their last connection actually drops
const onlineSockets = new Map();

io.on("connection", (socket) => {
    const currentUserId = socket.data.userId;

    console.log("User Connected:", socket.id, currentUserId);
    socket.join(currentUserId);

    const wasOffline = !onlineSockets.has(currentUserId);
    if (wasOffline) {
        onlineSockets.set(currentUserId, new Set());
    }
    onlineSockets.get(currentUserId).add(socket.id);

    if (wasOffline) {
        User.findByIdAndUpdate(currentUserId, { isOnline: true })
            .then(() => io.emit("user-status-changed", { userId: currentUserId, isOnline: true }))
            .catch((error) => console.error("Error setting user online:", error.message));
    }

    socket.on("join-group", async (groupId) => {
        const group = await Group.findById(groupId);
        const isMember = group?.members.some((member) => String(member) === currentUserId);

        if (isMember) {
            socket.join(groupId);
        }
    });

    socket.on("leave-group", (groupId) => {
        socket.leave(groupId);
    });

    socket.on("send-message", async ({ message, receiver }) => {
        try {
            const messageCreate = await Message.create({
                sender: currentUserId,
                receiver,
                message,
                conversationType: "direct",
            });
            if (currentUserId === String(receiver)) {
                io.to(currentUserId).emit("receive-message", messageCreate);
            } else {
                io.to(currentUserId).emit("receive-message", messageCreate);
                io.to(String(receiver)).emit("receive-message", messageCreate);
            }

        } catch (error) {
            console.error("Error in send-message:", error.message);
            socket.emit("message-error", { error: "حصل خطأ أثناء إرسال الرسالة" });
        }
    }
    );

    socket.on("send-group-message", async ({ message, groupId }) => {
        try {
            const group = await Group.findById(groupId);

            if (!group) {
                socket.emit("message-error", { error: "Group not found" });
                return;
            }

            const isMember = group.members.some((member) => String(member) === currentUserId);
            if (!isMember) {
                socket.emit("message-error", { error: "You are not a member of this group" });
                return;
            }

            const messageCreate = await Message.create({
                sender: currentUserId,
                group: groupId,
                message,
                conversationType: "group",
            });
             
            io.to(String(groupId)).emit("group-message", messageCreate);
        } catch (error) {
            console.error("Error in send-group-message:", error.message);
            socket.emit("message-error", { error: "حصل خطأ أثناء إرسال رسالة الجروب" });
        }
    });

    ///////// edit message ///////////
    editMessage(io, socket);

    ///////// delete message ///////////
    deleteMessage(io, socket);

    ///////// clear chat ///////////
    clearChat(io, socket);
    socket.on("disconnect", () => {
        console.log("User Disconnected:", socket.id, currentUserId);

        const sockets = onlineSockets.get(currentUserId);
        sockets?.delete(socket.id);

        if (sockets && sockets.size === 0) {
            onlineSockets.delete(currentUserId);
            const lastSeen = new Date();

            User.findByIdAndUpdate(currentUserId, { isOnline: false, lastSeen })
                .then(() => io.emit("user-status-changed", { userId: currentUserId, isOnline: false, lastSeen }))
                .catch((error) => console.error("Error setting user offline:", error.message));
        }
    });

});

// connect to mongodb
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("MongoDB Connected");
})

// start the server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server Running at Port ${PORT}`);
});

