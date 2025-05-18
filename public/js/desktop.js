const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");
const socket = io();

// Main Canvas Grid-Konfiguration
const gridCols = 5;
const gridRows = 4;
const pixelSize = 16;
const drawingRows = 16;
const drawingCols = 16;

const drawingWidth = drawingCols * pixelSize;
const drawingHeight = drawingRows * pixelSize;

canvas.width = gridCols * drawingWidth;
canvas.height = gridRows * drawingHeight;

// Zeichnung auf dem Main Canvas platzieren
function placeDrawing(drawing, index) {
    const gridX = index % gridCols;
    const gridY = Math.floor(index / gridCols);

    const startX = gridX * drawingWidth;
    const startY = gridY * drawingHeight;

    for (let r = 0; r < drawingRows; r++) {
        for (let c = 0; c < drawingCols; c++) {
            ctx.fillStyle = drawing[r][c];
            ctx.fillRect(startX + c * pixelSize, startY + r * pixelSize, pixelSize, pixelSize);
        }
    }
}

// Zeichnung vom Server empfangen
socket.on("updateMainCanvas", (data) => {
    placeDrawing(data.drawing, data.index);
});
