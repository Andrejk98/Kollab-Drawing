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

const userAssignments = new Map(); // Map of socket.id to assigned grid index
let nextUserIndex = 0; // Index for the next available grid section

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("A user connected");

    // Assign a grid area to the new user
    if (nextUserIndex < USERS) {
        userAssignments.set(socket.id, nextUserIndex);
        const assignedIndex = nextUserIndex;
        nextUserIndex++;

        // Inform the user of their assigned grid
        const startX = (assignedIndex % USERS) * GRID_SIZE;
        const startY = Math.floor(assignedIndex / USERS) * GRID_SIZE;
        socket.emit("assignGrid", { startX, startY, GRID_SIZE });

        // Send the initial canvas state to the newly connected user
        socket.emit("initCanvas", mainCanvasData);

        // Listen for pixel updates from the user
        socket.on("pixelUpdate", ({ x, y, color }) => {
            const mappedX = startX + x;
            const mappedY = startY + y;

            mainCanvasData[mappedY][mappedX] = color; // Update server-side grid
            io.emit("pixelUpdate", { x: mappedX, y: mappedY, color }); // Broadcast update
        });

        // Handle disconnect
        socket.on("disconnect", () => {
            console.log("A user disconnected");
            userAssignments.delete(socket.id);
        });
    } else {
        // If the canvas is full
        socket.emit("canvasFull");
        socket.disconnect();
    }
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
