const canvas = document.getElementById("mobileCanvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const submitButton = document.getElementById("submitDrawing");
const socket = io();

// Dynamische Anpassung der Canvas-Größe
function resizeCanvas() {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.8;
    canvas.width = size;
    canvas.height = size;
    drawGrid();
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Zeichnungsdaten
const pixelSize = 16;
const rows = 16;
const cols = 16;
let drawing = Array(rows)
    .fill()
    .map(() => Array(cols).fill("#FFFFFF"));

// Grid zeichnen
function drawGrid() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            ctx.fillStyle = drawing[r][c];
            ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
            ctx.strokeStyle = "#000000";
            ctx.strokeRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
        }
    }
}

// Farbwechsel bei Berührung
canvas.addEventListener("touchstart", (e) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const c = Math.floor(x / pixelSize);
    const r = Math.floor(y / pixelSize);

    if (c >= 0 && c < cols && r >= 0 && r < rows) {
        drawing[r][c] = colorPicker.value;
        drawGrid();
    }
});

// Zeichnung abschicken
submitButton.addEventListener("click", () => {
    socket.emit("submitDrawing", { drawing });
});
