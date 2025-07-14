# Kollab Drawing

## Ein kollaborativer Pixel-Canvas, auf dem bis zu 27 mobile Nutzer gleichzeitig in ihrem eigenen 16x16 Bereich pixeln können, während alle Änderungen live auf einer Gesamtübersicht angezeigt werden.

## ✅ Features
- 🖼️ Gemeinsames Zeichnen in Echtzeit für akutell bis zu 27 mobile Nutzer

- 📱 Mobile Clients erhalten einen eigenen, exklusiven 16x16 Bereich

- 👀 Desktop Clients können als Viewer die gesamte Leinwand live sehen

- 💾 Automatisches Speichern des Gesamt-Canvas als PNG, wenn alle Nutzer einmal verbunden waren

- ⏱️ Inaktivitäts-Timeout (5 Minuten) für mobile Nutzer

- 🔗 Synchronisierung per Socket.io

- ⚡ Optimiert für geringe Latenzen und stabile Verbindungen

## 🚀 Technologien
- Node.js mit Express.js für den Server

- Socket.io für WebSockets (Echtzeit-Kommunikation)

- HTML5 Canvas für die Zeichenoberfläche

- Vanilla JavaScript im Frontend

- Node Canvas für das serverseitige Rendern und Speichern des Gesamtbildes


Lokale IP herausfinden:
Windows:
```bash ifconfig ```

Mac/Linux:
```bash ifconfig ```


Dann z.B. im Handy-Browser:
http://192.168.0.xxx:3000

Wichtige Parameter in der server.js
| Parameter | Bedeutung|
|----------|----------|
| TOTAL_USERS | Maximale Anzahl mobiler Nutzer |
| GRID_SIZE | Größe jedes Nutzerbereichs (Pixel) |
| USERS_PER_ROW | Nutzer pro Zeile im Gesamtcanvas |
| INACTIVITY_TIMEOUT | Zeit bis zur automatischen Abmeldung bei Inaktivität |

## ⚙️ Installation & Setup
Repository klonen
```bash git clone <repository-url>cd <projektordner> ```

Abhängigkeiten installieren
```bash npm install ```

Server starten
```bash node server.js ```




## 🛠️ Fehlerbehebung
- Handy kann die Seite nicht erreichen:
    - Stelle sicher, dass der Laptop im gleichen WLAN ist und auf Port 3000 Verbindungen erlaubt.

- Verbindung bricht ab:
    - Prüfe dein WLAN auf Stabilität. Socket.io versucht allerdings automatisch zu reconnecten.

- Canvas wird nicht gespeichert:
    - Nur wenn alle Nutzer einmal verbunden waren, wird gespeichert. Prüfe auch das Verzeichnis /saved_images.


## 🗺️ Roadmap & Ideen
- Erweiterung auf mehr Nutzer

- Canvas speichern manuell auslösen

- Undo funktion

- Farbpalette erweitern

- Änderungen um seite nicht nur Lokal nutzbar zu machen