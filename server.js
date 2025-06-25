const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");
const { createCanvas } = require("canvas");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const USERS_PER_ROW = 7; // Max number of users per row
const GRID_SIZE = 16; // Size of each user's grid
const TOTAL_USERS = 21; // Total users that can be connected
const MAIN_GRID_WIDTH = USERS_PER_ROW * GRID_SIZE; // Main canvas width
const MAIN_GRID_HEIGHT = Math.ceil(TOTAL_USERS / USERS_PER_ROW) * GRID_SIZE; // Main canvas height
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

let mainCanvasData = Array(MAIN_GRID_HEIGHT)
    .fill(null)
    .map(() => Array(MAIN_GRID_WIDTH).fill("#ffffff")); // Initialize white grid

const userAssignments = new Map(); // Map of socket.id to assigned grid index
const userTimeouts = new Map(); // Map to store timeout for each user
let nextUserIndex = 0; // Index for the next available grid section

// Directory for saved images
const imageDir = path.join(__dirname, "saved_images");
if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir);
}

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("A user connected");

    // Reset timeout on any activity from the user
    function resetUserTimeout() {
        if (userTimeouts.has(socket.id)) {
            clearTimeout(userTimeouts.get(socket.id));
        }
        userTimeouts.set(
            socket.id,
            setTimeout(() => {
                console.log(`User ${socket.id} timed out due to inactivity.`);
                handleUserDisconnect();
                socket.disconnect();
            }, INACTIVITY_TIMEOUT)
        );
    }

    function handleUserDisconnect() {
        if (userAssignments.has(socket.id)) {
            const assignedIndex = userAssignments.get(socket.id);
            userAssignments.delete(socket.id);
            userTimeouts.delete(socket.id);

            // Only save if all sections were used and no users are left
            if (userAssignments.size === 0 && nextUserIndex >= TOTAL_USERS) {
                saveCanvasAndReset();
            }
        }
    }

    // Save the current canvas and reset it
    function saveCanvasAndReset() {
        const canvas = createCanvas(MAIN_GRID_WIDTH, MAIN_GRID_HEIGHT);
        const ctx = canvas.getContext("2d");

        for (let y = 0; y < MAIN_GRID_HEIGHT; y++) {
            for (let x = 0; x < MAIN_GRID_WIDTH; x++) {
                ctx.fillStyle = mainCanvasData[y][x];
                ctx.fillRect(x, y, 1, 1);
            }
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = path.join(imageDir, `canvas_${timestamp}.png`);
        const out = fs.createWriteStream(filename);
        const stream = canvas.createPNGStream();

        stream.pipe(out);
        out.on("finish", () => {
            console.log(`Canvas saved as ${filename}`);
            mainCanvasData = Array(MAIN_GRID_HEIGHT)
                .fill(null)
                .map(() => Array(MAIN_GRID_WIDTH).fill("#ffffff")); // Reset the canvas
            nextUserIndex = 0; // Reset user index for new session
        });
    }

    // Listen for device type
    socket.on("deviceType", (deviceType) => {
        if (deviceType === "mobile") {
            // Assign a grid to a new user
            if (nextUserIndex < TOTAL_USERS) {
                userAssignments.set(socket.id, nextUserIndex);
                const assignedIndex = nextUserIndex;
                nextUserIndex++;

                const rowIndex = Math.floor(assignedIndex / USERS_PER_ROW);
                const colIndex = assignedIndex % USERS_PER_ROW;
                const startX = colIndex * GRID_SIZE;
                const startY = rowIndex * GRID_SIZE;

                socket.emit("assignGrid", { startX, startY, GRID_SIZE });
                socket.emit("initCanvas", mainCanvasData);

                // Set an inactivity timeout
                resetUserTimeout();

                // Handle pixel updates
                socket.on("pixelUpdate", ({ x, y, color }) => {
                    resetUserTimeout();

                    const mappedX = startX + x;
                    const mappedY = startY + y;

                    mainCanvasData[mappedY][mappedX] = color; // Update server-side grid
                    io.emit("pixelUpdate", { x: mappedX, y: mappedY, color }); // Broadcast update
                });

                // Handle disconnect
                socket.on("disconnect", () => {
                    console.log(`User ${socket.id} disconnected.`);
                    handleUserDisconnect();
                });
            } else {
                socket.emit("canvasFull");
                socket.disconnect();
            }
        } else if (deviceType === "viewer") {
            // Viewer connections (main canvas)
            socket.emit("initCanvas", mainCanvasData);
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
