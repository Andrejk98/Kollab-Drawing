const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Statische Dateien bereitstellen
app.use(express.static(path.join(__dirname, "public")));

// Grid-Konfiguration für den Main Canvas
const gridCols = 5; // Spaltenanzahl
const gridRows = 4; // Reihenanzahl
let drawingIndex = 0; // Index für das nächste Bild

io.on("connection", (socket) => {
    console.log("Ein Benutzer hat sich verbunden.");

    // Zeichnung von einem mobilen Gerät empfangen
    socket.on("submitDrawing", (data) => {
        console.log("Zeichnung erhalten, senden an Main Canvas.");

        // Zeichnung mit Index und Bilddaten an alle Clients senden
        io.emit("updateMainCanvas", { ...data, index: drawingIndex });

        // Nächste freie Position im Grid berechnen
        drawingIndex = (drawingIndex + 1) % (gridCols * gridRows);

        // Wenn der Main Canvas voll ist, kann hier ein Bild generiert oder eine Aktion ausgelöst werden
        if (drawingIndex === 0) {
            console.log("Main Canvas ist voll. Aktionen könnten hier ausgelöst werden.");
        }
    });

    socket.on("disconnect", () => {
        console.log("Ein Benutzer hat die Verbindung getrennt.");
    });
});

// Server starten
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
