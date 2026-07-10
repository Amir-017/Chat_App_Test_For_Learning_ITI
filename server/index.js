// require modules
const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./src/routes/users.routes");

const app = express();

// all the middlewares
dotenv.config();
app.use(cors());
app.use(express.json());


// routes
app.use("/api/users", userRoutes);


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


        io.to(receiver).emit("receive-message", { message, sender, receiver });

    });

    socket.on("disconnect", () => {
        console.log("User Disconnected");
    });

});

// connect to mongodb
mongoose.connect("mongodb://localhost:27017/chat-app").then(() => {
    console.log("MongoDB Connected");
})

// start the server
server.listen(3000, () => {
    console.log("Server Running at Port 3000");
});

