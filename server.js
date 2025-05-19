const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const USERS = 20; // Total users
const GRID_SIZE = 16; // Size of each user's grid
const MAIN_GRID_SIZE = GRID_SIZE * USERS; // Size of the main canvas grid (320x320)

let mainCanvasData = Array(MAIN_GRID_SIZE)
    .fill(null)
    .map(() => Array(MAIN_GRID_SIZE).fill("#ffffff")); // Initialize white grid

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("A user connected");

    // Send the initial canvas state to the newly connected user
    socket.emit("initCanvas", mainCanvasData);

    // Update pixel and broadcast
    socket.on("pixelUpdate", ({ x, y, color }) => {
        const userIndex = Math.floor(y / GRID_SIZE) * USERS + Math.floor(x / GRID_SIZE);
        const localX = x % GRID_SIZE;
        const localY = y % GRID_SIZE;

        const mappedX = (userIndex % USERS) * GRID_SIZE + localX;
        const mappedY = Math.floor(userIndex / USERS) * GRID_SIZE + localY;

        mainCanvasData[mappedY][mappedX] = color; // Update server-side grid
        io.emit("pixelUpdate", { x: mappedX, y: mappedY, color }); // Broadcast update
    });


    // Disconnect event
    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
