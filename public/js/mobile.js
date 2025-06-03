const canvas = document.getElementById("mobileCanvas");
const ctx = canvas.getContext("2d");
const GRID_SIZE = 16;
const PIXEL_SIZE = 20; // Size of each pixel
const socket = io();

let color = "#000000"; // Default color
let startX = 0; // User's assigned grid start X
let startY = 0; // User's assigned grid start Y

// Resize the canvas to fit the viewport
function resizeCanvas() {
    canvas.width = GRID_SIZE * PIXEL_SIZE;
    canvas.height = GRID_SIZE * PIXEL_SIZE;
}
resizeCanvas();

// Draw the grid
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            ctx.strokeStyle = "#ccc";
            ctx.strokeRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
    }
}
drawGrid();

// Handle touch events
canvas.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((touch.clientX - rect.left) / PIXEL_SIZE);
    const y = Math.floor((touch.clientY - rect.top) / PIXEL_SIZE);

    updatePixel(x, y);
});

// Update pixel color locally and on the server
function updatePixel(x, y) {
    ctx.fillStyle = color;
    ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    socket.emit("pixelUpdate", { x, y, color });
}

// Handle color picker
document.getElementById("colorPicker").addEventListener("input", (e) => {
    color = e.target.value;
});

// Handle grid assignment from the server
socket.on("assignGrid", ({ startX: sx, startY: sy }) => {
    startX = sx;
    startY = sy;
});

// Show a message if the canvas is full
socket.on("canvasFull", () => {
    alert("The canvas is full. Please try again later.");
});

// Notify the server about the device type
socket.emit("deviceType", "mobile");

// Receive assigned grid coordinates
socket.on("assignGrid", ({ startX, startY, GRID_SIZE }) => {
    console.log("Assigned grid:", startX, startY, GRID_SIZE);
});