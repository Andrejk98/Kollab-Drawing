const socket = io();

const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");

const GRID_SIZE = 320; // Total grid size (16x20)
let pixelSize; // Dynamically calculated based on canvas size

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.9;
    pixelSize = Math.min(canvas.width, canvas.height) / GRID_SIZE;
    drawGrid();
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Draw grid
function drawGrid() {
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            ctx.strokeStyle = "#ccc";
            ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
    }
}

// Update pixel color
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

// Update pixel in real time
socket.on("pixelUpdate", ({ x, y, color }) => {
    updatePixel(x, y, color);
});
