// require modules
const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const Message = require("./src/models/messages.models");
const Group = require("./src/models/groups.models");
const userRoutes = require("./src/routes/users.routes");
const messageRouter = require("./src/routes/messages.routes");
const groupRouter = require("./src/routes/groups.routes");
const { deleteMessage, editMessage } = require("./src/controller/messages.controller");
const app = express();

// all the middlewares
dotenv.config();
app.use(cors());
app.use(express.json());


// routes
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRouter);
app.use("/api/groups", groupRouter);


const server = http.createServer(app);

// socket.io
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
    },
});

app.set("io", io);

io.on("connection", (socket) => {

    console.log("User Connected:", socket.id);
    socket.on("join-room", (roomId) => {
        socket.join(roomId);
    });
    socket.on("join-group", (groupId) => {
        socket.join(groupId);
    });

    socket.on("leave-group", (groupId) => {
        socket.leave(groupId);
    });

    socket.on("send-message", async ({ message, receiver, sender }) => {
        try {
            const messageCreate = await Message.create({
                sender,
                receiver,
                message,
                conversationType: "direct",
            });
            if (sender === receiver) {
                io.to(String(sender)).emit("receive-message", messageCreate);
            } else {
                io.to(String(sender)).emit("receive-message", messageCreate);
                io.to(String(receiver)).emit("receive-message", messageCreate);
            }

        } catch (error) {
            console.error("Error in send-message:", error.message);
            socket.emit("message-error", { error: "حصل خطأ أثناء إرسال الرسالة" });
        }
    }
    );

    socket.on("send-group-message", async ({ message, groupId, sender }) => {
        try {
            const group = await Group.findById(groupId);

            if (!group) {
                socket.emit("message-error", { error: "Group not found" });
                return;
            }

            const isMember = group.members.some((member) => String(member) === String(sender));
            if (!isMember) {
                socket.emit("message-error", { error: "You are not a member of this group" });
                return;
            }

            const messageCreate = await Message.create({
                sender,
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
    socket.on("disconnect", () => {
        console.log("User Disconnected");
    });

});

// connect to mongodb
mongoose.connect("mongodb://localhost:27017/chat-app").then(() => {
    console.log("MongoDB Connected");
})

// start the server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server Running at Port ${PORT}`);
});

