const socket = io();

const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");

const USERS = 20; // Anzahl der Nutzer
const GRID_SIZE = 16; // Größe des Rasters pro Nutzer
let ROWS, COLUMNS; // Dynamisch berechnete Reihen und Spalten
let pixelSize; // Dynamisch berechnete Pixelgröße

// Dynamische Berechnung von Reihen und Spalten
function calculateGridDimensions() {
    // Seitenverhältnis des Canvas
    const canvasAspectRatio = canvas.width / canvas.height;

    // Starte mit einer Annahme für die Spaltenzahl
    COLUMNS = Math.ceil(Math.sqrt(USERS * canvasAspectRatio));
    ROWS = Math.ceil(USERS / COLUMNS);
}

// Canvas-Größe anpassen und Pixel berechnen
function resizeCanvas() {
    // Dynamische Berechnung der Anzahl von Spalten und Reihen
    calculateGridDimensions();

    // Berechne die Pixelgröße
    pixelSize = Math.min(
        window.innerWidth * 0.9 / (COLUMNS * GRID_SIZE),
        window.innerHeight * 0.9 / (ROWS * GRID_SIZE)
    );

    // Berechne die tatsächliche Canvas-Breite und -Höhe basierend auf den Pixeln
    canvas.width = COLUMNS * GRID_SIZE * pixelSize;
    canvas.height = ROWS * GRID_SIZE * pixelSize;

    drawGrid();
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Gitter zeichnen
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvas löschen
    for (let col = 0; col < COLUMNS * GRID_SIZE; col++) {
        for (let row = 0; row < ROWS * GRID_SIZE; row++) {
            ctx.strokeStyle = "#ccc";
            ctx.strokeRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
        }
    }
}

// Pixel aktualisieren
function updatePixel(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    ctx.strokeStyle = "#ccc";
    ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
}

// Haupt-Canvas initialisieren
socket.on("initMainCanvas", (data) => {
    for (let y = 0; y < data.length; y++) {
        for (let x = 0; x < data[y].length; x++) {
            updatePixel(x, y, data[y][x]);
        }
    }
});

// Updates vom Server empfangen
socket.on("pixelUpdate", ({ x, y, color }) => {
    updatePixel(x, y, color);
});

// Notify the server about the device type
socket.emit("deviceType", "viewer");
