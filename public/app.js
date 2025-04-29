const drawingCanvas = document.getElementById("drawingCanvas");
const mainCanvas = document.getElementById("mainCanvas");
const title = document.getElementById("title");
const drawingCtx = drawingCanvas.getContext("2d");
const mainCtx = mainCanvas.getContext("2d");

const socket = io();

// Set canvas size dynamically based on the current view
function resizeCanvas() {
    if (window.innerWidth <= 1024) {
        // Mobile or tablet: Show drawing canvas
        drawingCanvas.width = window.innerWidth * 0.8;
        drawingCanvas.height = window.innerHeight * 0.6;
        title.textContent = "Zeichnen Sie Ihr Kunstwerk!";
    } else {
        // Laptop or larger: Show main canvas
        mainCanvas.width = window.innerWidth * 0.8;
        mainCanvas.height = window.innerHeight * 0.6;
        title.textContent = "Kollaborative Hauptleinwand";
    }
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Drawing state
let drawing = false;
let currentColor = document.getElementById("color").value;
let currentShape = document.getElementById("shape").value;
let lastX = null;
let lastY = null;
let positionSelected = false; // Track whether a position has been selected

// Update color and shape from input
document.getElementById("color").addEventListener("input", (e) => {
    currentColor = e.target.value;
});

document.getElementById("shape").addEventListener("change", (e) => {
    currentShape = e.target.value;
});

// Clear button functionality
document.getElementById("clear").addEventListener("click", () => {
    clearDrawingCanvas();
});

// Confirm button functionality
document.getElementById("confirm").addEventListener("click", () => {
    if (positionSelected) {
        confirmDrawing();
    } else {
        alert("Bitte wählen Sie einen Bereich auf der Hauptleinwand aus, bevor Sie bestätigen.");
    }
});

// Handle touch events for drawing or placing shapes
drawingCanvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const { x, y } = getTouchCoordinates(e, drawingCanvas);

    if (!positionSelected) {
        selectPosition(x, y);
    } else {
        if (currentShape === "free") {
            drawing = true;
            lastX = x;
            lastY = y;
            drawFree(x, y);
        } else {
            placeShape(x, y, currentShape);
        }
    }
});

drawingCanvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!drawing || currentShape !== "free") return;

    const { x, y } = getTouchCoordinates(e, drawingCanvas);
    drawLine(lastX, lastY, x, y); // Draw a line between the last position and the current position
    lastX = x;
    lastY = y;
});

drawingCanvas.addEventListener("touchend", () => {
    if (drawing && currentShape === "free") {
        drawing = false;
        lastX = null;
        lastY = null;
    }
});

// Draw freehand on the drawing canvas
function drawFree(x, y) {
    drawingCtx.fillStyle = currentColor;
    drawingCtx.beginPath();
    drawingCtx.arc(x, y, 5, 0, Math.PI * 2);
    drawingCtx.fill();
}

// Draw a line between two points
function drawLine(x1, y1, x2, y2) {
    drawingCtx.strokeStyle = currentColor;
    drawingCtx.lineWidth = 5;
    drawingCtx.beginPath();
    drawingCtx.moveTo(x1, y1);
    drawingCtx.lineTo(x2, y2);
    drawingCtx.stroke();
}

// Place shapes on the drawing canvas
function placeShape(x, y, shape) {
    drawingCtx.fillStyle = currentColor;

    if (shape === "circle") {
        drawingCtx.beginPath();
        drawingCtx.arc(x, y, 30, 0, Math.PI * 2);
        drawingCtx.fill();
    } else if (shape === "square") {
        drawingCtx.fillRect(x - 20, y - 20, 40, 40);
    } else if (shape === "triangle") {
        drawingCtx.beginPath();
        drawingCtx.moveTo(x, y - 30);
        drawingCtx.lineTo(x - 25, y + 20);
        drawingCtx.lineTo(x + 25, y + 20);
        drawingCtx.closePath();
        drawingCtx.fill();
    }
}

// Select position on the main canvas where the drawing will be placed
function selectPosition(x, y) {
    positionSelected = true;
    socket.emit("setPosition", { x, y });
    alert("Bereich ausgewählt! Beginnen Sie jetzt mit dem Zeichnen.");
}

// Confirm the drawing and lock it in place
function confirmDrawing() {
    const imageData = drawingCanvas.toDataURL();
    socket.emit("confirmDrawing", { imageData });
    alert("Zeichnung bestätigt! Sie kann nun nicht mehr verändert werden.");
}

// Clear the drawing canvas
function clearDrawingCanvas() {
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
}

// Correctly map touch coordinates to canvas coordinates
function getTouchCoordinates(event, canvas) {
    const rect = canvas.getBoundingClientRect(); // Get the position and size of the canvas
    const touch = event.touches[0]; // Get the first touch point

    // Map touch position to canvas coordinates
    const x = ((touch.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((touch.clientY - rect.top) / rect.height) * canvas.height;

    return { x, y };
}

// Listen for updates to the main canvas from the server
socket.on("updateMainCanvas", (data) => {
    const img = new Image();
    img.onload = () => {
        mainCtx.drawImage(img, data.x, data.y);
    };
    img.src = data.imageData;
});
