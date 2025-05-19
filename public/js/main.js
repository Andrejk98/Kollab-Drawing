const socket = io();

const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");

const USERS = 20;
const GRID_SIZE = 16; // Size of the grid for each user
const MAIN_GRID_SIZE = GRID_SIZE * USERS; // Total grid size (320 for 20 users)
let pixelSize; // Dynamically calculated based on canvas size

// Resize and recalculate pixel size
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.9;
    pixelSize = Math.min(canvas.width, canvas.height) / MAIN_GRID_SIZE;
    drawGrid();
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Draw grid
function drawGrid() {
    for (let x = 0; x < MAIN_GRID_SIZE; x++) {
        for (let y = 0; y < MAIN_GRID_SIZE; y++) {
            ctx.strokeStyle = "#ccc";
            ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
    }
}

// Update pixel without distortion
function updatePixel(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    ctx.strokeStyle = "#ccc";
    ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
}

// Initialize main canvas
socket.on("initMainCanvas", (data) => {
    for (let y = 0; y < data.length; y++) {
        for (let x = 0; x < data[y].length; x++) {
            updatePixel(x, y, data[y][x]);
        }
    }
});


// Receive updates from the server
socket.on("pixelUpdate", ({ x, y, color }) => {
    updatePixel(x, y, color);
});
