// require modules
const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const Message = require("./src/models/messages.models");
const userRoutes = require("./src/routes/users.routes");
const messageRouter = require("./src/routes/messages.routes");
const { deleteMessage } = require("./src/controller/messages.controller");
const app = express();

// all the middlewares
dotenv.config();
app.use(cors());
app.use(express.json());


// routes
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRouter);


const server = http.createServer(app);

// socket.io
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
    },
});

io.on("connection", (socket) => {

    console.log("User Connected:", socket.id);
    socket.on("join-room", (roomId) => {
        socket.join(roomId);
    });
   socket.on("send-message", async ({ message, receiver, sender }) => {
    try {
        const messageCreate = await Message.create({
            sender,
            receiver,
            message,
        });

        if (sender === receiver) {
            io.to(sender).emit("receive-message", { message, sender });
        } else {
            io.to(receiver).emit("receive-message", { message, sender, receiver });
        }
    } catch (error) {
        console.error("Error in send-message:", error.message);
        socket.emit("message-error", { error: "حصل خطأ أثناء إرسال الرسالة" });
    }
});

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

