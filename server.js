const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let position = null; // Store the selected position
let drawings = []; // Store all confirmed drawings

io.on("connection", (socket) => {
    console.log("A user connected");

    // Send current position and confirmed drawings to the new user
    if (position) {
        socket.emit("setPosition", position);
    }
    drawings.forEach((drawing) => {
        socket.emit("updateMainCanvas", drawing);
    });

    // Listen for the position where the user wants to draw
    socket.on("setPosition", (newPosition) => {
        position = newPosition;
        io.emit("setPosition", position); // Broadcast to all clients
    });

    // Listen for the confirmed drawing and place it on the main canvas
    socket.on("confirmDrawing", (data) => {
        drawings.push({ imageData: data.imageData, x: position.x, y: position.y });
        io.emit("updateMainCanvas", { imageData: data.imageData, x: position.x, y: position.y });
        position = null; // Reset position after confirmation
        io.emit("clearCanvas");
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
