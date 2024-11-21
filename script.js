Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4MDc1NzZkZi1mNzc1LTRhYmEtYmMwZi01MjE0NzQ0ZjdhZWIiLCJpZCI6MjU0NzEzLCJpYXQiOjE3MzE0MTYyOTZ9.IbhV6cYW_PlSq7T5nLlPPDVEC8jGY7l51WHvkw7AHjc';

const viewer = new Cesium.Viewer('cesiumContainer', {
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    shadows: true
});

viewer.scene.globe.show = false;

const MOON_RADIUS = 1737100;
const MOON_ELLIPSOID = new Cesium.Ellipsoid(MOON_RADIUS, MOON_RADIUS, MOON_RADIUS);

function setMaximumLevelOfDetail(tileset) {
    tileset.maximumScreenSpaceError = 2;
    viewer.scene.globe.maximumScreenSpaceError = 2;
}

async function loadMoonTileset() {
    try {
        const moonTileset = await Cesium.Cesium3DTileset.fromIonAssetId(2684829);
        setMaximumLevelOfDetail(moonTileset);
        viewer.scene.primitives.add(moonTileset);
    } catch (error) {
        console.error('Error loading moon tileset:', error);
        alert('Failed to load Moon tileset. Please check your internet connection and try again.');
    }
}

function createCartesianPoint(latitude, longitude) {
    const latRad = Cesium.Math.toRadians(latitude);
    const lonRad = Cesium.Math.toRadians(longitude);
    const cartographic = new Cesium.Cartographic(lonRad, latRad, 0);
    return MOON_ELLIPSOID.cartographicToCartesian(cartographic);
}

function createStartingPoint(latitude, longitude) {
    const position = createCartesianPoint(latitude, longitude);
    
    // Add a larger, red point for the starting position
    viewer.entities.add({
        position: position,
        point: {
            pixelSize: 16,
            color: Cesium.Color.RED,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
    });

    // Add a label for the starting point
    viewer.entities.add({
        position: position,
        label: {
            text: 'Starting Point',
            font: '14pt sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -20),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
    });

    return position;
}

function plotPath(coordinates) {
    // Create the starting point (85.28°S, 31.20°E)
    const startingPosition = createStartingPoint(-85.28, 31.20);

    // Create positions array starting with the hardcoded starting point
    const positions = [startingPosition, ...coordinates.map(coord => createCartesianPoint(coord.latitude, coord.longitude))];

    // Add points (skipping the starting point as it's already added)
    coordinates.forEach((coord, index) => {
        viewer.entities.add({
            position: positions[index + 1], // +1 because the starting point is at index 0
            point: {
                pixelSize: 8,
                color: Cesium.Color.YELLOW,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 1,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
        });
    });

    // Add path
    viewer.entities.add({
        polyline: {
            positions: positions,
            width: 2,
            material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.2,
                color: Cesium.Color.CYAN
            }),
            clampToGround: true
        }
    });

    // Set view to encompass the entire path
    viewer.zoomTo(viewer.entities);
}

async function loadJSONAndPlotPath() {
    try {
        const response = await fetch('lunar_path.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const coordinatesData = await response.json();
        plotPath(coordinatesData);
    } catch (error) {
        console.error('Error loading or parsing JSON:', error);
        alert('Failed to load path data. Please check if the lunar_path.json file exists and is correctly formatted.');
    } finally {
        document.getElementById('loadingOverlay').style.display = 'none';
    }
}

async function initializeViewer() {
    await loadMoonTileset();
    await loadJSONAndPlotPath();
}

initializeViewer();