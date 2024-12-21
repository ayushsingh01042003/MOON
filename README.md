# Route Planner for 3D Moon Surface

This project is a **3D route planner** for plotting paths on the moon's surface, using **CesiumJS** to render a realistic lunar environment. You can visualize and plot a rover's route based on given coordinates.

---

## Features
- **3D Moon Surface Rendering**: Utilizes **CesiumJS** to display the moon in a realistic 3D environment.
- **Custom Path Plotting**: Load and visualize a path by providing a JSON file with coordinates.
- **Interactive Navigation**: Pan, zoom, and rotate around the rendered moon to analyze the path from multiple perspectives.
- **Lightweight**: Requires no additional backend setup, runs directly in the browser.

---

## Project Structure
The key components of the project are:
- **index.html**: Entry point for the application.
- **styles.css**: Styling for the interface.
- **app.js**: JavaScript logic for loading and rendering the path.
- **coordinates.json**: JSON file containing coordinates for the rover's path.

---

## Prerequisites
To run this project, ensure you have:
- **Live Server** (e.g., VS Code's Live Server extension) or any local development server to serve the HTML file.
- A modern browser with WebGL support.

---

## How to Run
1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/Route-Planner.git
   ```
2. **Navigate to the project folder**:
   ```bash
   cd Route-Planner
   ```
3. **Run with Live Server**:
   - Open `index.html` with a live server (e.g., via VS Code).
   - Alternatively, serve the project using any static file server.
4. **Visualize the Path**:
   - The moon's surface and the path will render automatically based on the `coordinates.json` file.

---

## JSON Format for Coordinates
Ensure your `coordinates.json` follows this format:
```json
[
  { "latitude": 0.0, "longitude": 0.0, "height": 0.0 },
  { "latitude": 10.0, "longitude": 15.0, "height": 100.0 },
  { "latitude": -5.0, "longitude": 20.0, "height": 200.0 }
]
```
- `latitude`: Latitude of the point in degrees.
- `longitude`: Longitude of the point in degrees.
- `height`: Elevation of the point.

---

## Technologies Used
- **CesiumJS**: For 3D visualization of the moon's surface.
- **HTML, CSS, JavaScript**: Core technologies for building the web application.
- **JSON**: Data format for providing coordinates.

---
## 🔗 Live Demo
[Live Demo of Route Planner](https://bhardwajarjit.github.io/Route-Planner/)

