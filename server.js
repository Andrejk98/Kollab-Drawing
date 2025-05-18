const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;
let mainCanvasData = []; // Store pixel data for main canvas

// Serve static files
app.use(express.static("public"));

// Initialize the main canvas with default (white) pixels
const GRID_SIZE = 16; // Grid size for mobile
const USERS = 20; // Number of users
const MAIN_CANVAS_GRID_SIZE = USERS * GRID_SIZE;

for (let y = 0; y < MAIN_CANVAS_GRID_SIZE; y++) {
    mainCanvasData[y] = Array(MAIN_CANVAS_GRID_SIZE).fill("#ffffff");
}

// Handle WebSocket connections
io.on("connection", (socket) => {
    console.log("A user connected");

    // Send initial main canvas data to new connections
    socket.emit("initMainCanvas", mainCanvasData);

    // Receive pixel updates from mobile clients
    socket.on("pixelUpdate", ({ x, y, color }) => {
        mainCanvasData[y][x] = color; // Update the pixel color on the server

        // Broadcast the update to all connected clients
        io.emit("pixelUpdate", { x, y, color });
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
