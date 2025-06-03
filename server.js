const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const USERS_PER_ROW = 7; // Max number of users per row
const GRID_SIZE = 16; // Size of each user's grid
const TOTAL_USERS = 21; // Total users that can be connected
const MAIN_GRID_WIDTH = USERS_PER_ROW * GRID_SIZE; // Main canvas width
const MAIN_GRID_HEIGHT = Math.ceil(TOTAL_USERS / USERS_PER_ROW) * GRID_SIZE; // Main canvas height

let mainCanvasData = Array(MAIN_GRID_HEIGHT)
    .fill(null)
    .map(() => Array(MAIN_GRID_WIDTH).fill("#ffffff")); // Initialize white grid

const userAssignments = new Map(); // Map of socket.id to assigned grid index
let nextUserIndex = 0; // Index for the next available grid section

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("A user connected");

    // Listen for the device type (mobile or not)
    socket.on("deviceType", (deviceType) => {
        if (deviceType === "mobile") {
            if (nextUserIndex < TOTAL_USERS) {
                userAssignments.set(socket.id, nextUserIndex);
                const assignedIndex = nextUserIndex;
                nextUserIndex++;

                // Calculate startX and startY
                const rowIndex = Math.floor(assignedIndex / USERS_PER_ROW);
                const colIndex = assignedIndex % USERS_PER_ROW;
                const startX = colIndex * GRID_SIZE;
                const startY = rowIndex * GRID_SIZE;

                // Inform the user of their assigned grid
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
        } else {
            // Handle non-mobile connections (e.g., main canvas viewers)
            socket.emit("initCanvas", mainCanvasData);

            // Disconnect immediately as they don't require an assignment
            socket.on("disconnect", () => {
                console.log("A viewer disconnected");
            });
        }
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
