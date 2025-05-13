const socket = io();

// Desktop Canvas
const mainCanvas = document.getElementById("mainCanvas");
const mainCtx = mainCanvas.getContext("2d");

const PIXEL_ROWS = 16;
const PIXEL_COLS = 16;

// Resize main canvas to fit
function resizeMainCanvas() {
    mainCanvas.width = mainCanvas.clientWidth;
    mainCanvas.height = mainCanvas.clientHeight;

    drawMainGrid();
}

// Draw the main grid
function drawMainGrid() {
    const pixelWidth = mainCanvas.width / PIXEL_COLS;
    const pixelHeight = mainCanvas.height / PIXEL_ROWS;

    mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    mainCtx.strokeStyle = "#ccc";

    for (let row = 0; row < PIXEL_ROWS; row++) {
        for (let col = 0; col < PIXEL_COLS; col++) {
            mainCtx.strokeRect(col * pixelWidth, row * pixelHeight, pixelWidth, pixelHeight);
        }
    }
}

// Update pixels based on server data
socket.on("updatePixel", (data) => {
    const { row, col, color } = data;

    const pixelWidth = mainCanvas.width / PIXEL_COLS;
    const pixelHeight = mainCanvas.height / PIXEL_ROWS;

    mainCtx.fillStyle = color;
    mainCtx.fillRect(col * pixelWidth, row * pixelHeight, pixelWidth, pixelHeight);
});

// Resize on window resize
window.addEventListener("resize", resizeMainCanvas);
resizeMainCanvas();
