const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Serve static files
app.use(express.static("public"));

// Canvas state
let mainCanvasDrawings = [];
const MAX_DRAWINGS = 10; // Save and reset after 10 drawings

io.on("connection", (socket) => {
    console.log("Ein Benutzer hat sich verbunden.");

    socket.on("submitDrawing", (data) => {
        mainCanvasDrawings.push(data.imageData);

        if (mainCanvasDrawings.length >= MAX_DRAWINGS) {
            saveAndResetMainCanvas();
        } else {
            io.emit("updateMainCanvas", { imageData: data.imageData, x: 0, y: 0 });
        }
    });
});

function saveAndResetMainCanvas() {
    const timestamp = Date.now();
    const filename = `mainCanvas_${timestamp}.png`;
    const base64Data = mainCanvasDrawings[mainCanvasDrawings.length - 1].replace(/^data:image\/png;base64,/, "");

    fs.writeFile(`./saved/${filename}`, base64Data, "base64", (err) => {
        if (err) console.error("Fehler beim Speichern:", err);
        console.log("Hauptleinwand gespeichert als:", filename);
    });

    mainCanvasDrawings = [];
    io.emit("resetMainCanvas");
}

server.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
