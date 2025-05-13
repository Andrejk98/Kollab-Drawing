const socket = io();

// Mobile Canvas
const mobileCanvas = document.getElementById("mobileCanvas");
const mobileCtx = mobileCanvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");

const PIXEL_ROWS = 16;
const PIXEL_COLS = 16;

// Aktuelle Farbe
let currentColor = colorPicker.value;

// Farbe ändern
colorPicker.addEventListener("input", (e) => {
    currentColor = e.target.value;
});

// Dynamically resize the mobile canvas to fit the viewport
function resizeMobileCanvas() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const pixelSize = Math.min(viewportWidth / PIXEL_COLS, viewportHeight / PIXEL_ROWS);
    mobileCanvas.width = pixelSize * PIXEL_COLS;
    mobileCanvas.height = pixelSize * PIXEL_ROWS;

    drawPixelGrid(pixelSize);
}

// Draw the pixel grid
function drawPixelGrid(pixelSize) {
    mobileCtx.clearRect(0, 0, mobileCanvas.width, mobileCanvas.height);

    for (let row = 0; row < PIXEL_ROWS; row++) {
        for (let col = 0; col < PIXEL_COLS; col++) {
            mobileCtx.strokeStyle = "#ccc";
            mobileCtx.strokeRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
        }
    }
}

// Handle touch interactions
mobileCanvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const { x, y } = getCanvasCoordinates(touch);
    fillPixel(x, y);
});

// Get pixel coordinates from touch
function getCanvasCoordinates(touch) {
    const rect = mobileCanvas.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * mobileCanvas.width;
    const y = ((touch.clientY - rect.top) / rect.height) * mobileCanvas.height;
    return { x, y };
}

// Fill a pixel and notify the server
function fillPixel(x, y) {
    const pixelWidth = mobileCanvas.width / PIXEL_COLS;
    const pixelHeight = mobileCanvas.height / PIXEL_ROWS;

    const col = Math.floor(x / pixelWidth);
    const row = Math.floor(y / pixelHeight);

    mobileCtx.fillStyle = currentColor;
    mobileCtx.fillRect(col * pixelWidth, row * pixelHeight, pixelWidth, pixelHeight);

    socket.emit("drawPixel", { row, col, color: currentColor });
}

// Resize on window resize
window.addEventListener("resize", resizeMobileCanvas);
resizeMobileCanvas();
