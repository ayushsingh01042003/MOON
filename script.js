Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4MDc1NzZkZi1mNzc1LTRhYmEtYmMwZi01MjE0NzQ0ZjdhZWIiLCJpZCI6MjU0NzEzLCJpYXQiOjE3MzE0MTYyOTZ9.IbhV6cYW_PlSq7T5nLlPPDVEC8jGY7l51WHvkw7AHjc';

const viewer = new Cesium.Viewer('cesiumContainer', {
    baseLayerPicker: true,
    geocoder: false,
    homeButton: true,
    sceneModePicker: true,
    navigationHelpButton: true,
    animation: true,
    timeline: true,
    fullscreenButton: true,
    shadows: true,
    terrainProvider: Cesium.createWorldTerrain()
});

viewer.scene.globe.show = false;

const MOON_RADIUS = 1737100;
const MOON_ELLIPSOID = new Cesium.Ellipsoid(MOON_RADIUS, MOON_RADIUS, MOON_RADIUS);
const PATH_HEIGHT = 5000; // Lift the path 1km above the surface

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
    const cartographic = new Cesium.Cartographic(lonRad, latRad, PATH_HEIGHT);
    return MOON_ELLIPSOID.cartographicToCartesian(cartographic);
}

function createStartingPoint(latitude, longitude) {
    const position = createCartesianPoint(latitude, longitude);
    
    viewer.entities.add({
        position: position,
        point: {
            pixelSize: 16,
            color: Cesium.Color.RED,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
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
    const startingPosition = createStartingPoint(-85.28, 31.20);
    const positions = [startingPosition, ...coordinates.map(coord => createCartesianPoint(coord.latitude, coord.longitude))];

    coordinates.forEach((coord, index) => {
        const position = positions[index + 1];
        viewer.entities.add({
            position: position,
            point: {
                pixelSize: 8,
                color: Cesium.Color.YELLOW,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 1,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
            label: {
                text: `Point ${index + 1}`,
                font: '12pt sans-serif',
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -10),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                show: true
            }
        });
    });

    const pathEntity = viewer.entities.add({
        polyline: {
            positions: positions,
            width: 2,
            material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.2,
                color: Cesium.Color.CYAN
            }),
            clampToGround: false
        }
    });

    viewer.zoomTo(viewer.entities);
    return pathEntity;
}

async function loadJSONAndPlotPath() {
    try {
        const response = await fetch('lunar_path.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const coordinatesData = await response.json();
        const pathEntity = plotPath(coordinatesData);
        setupPathVisibilityControl(pathEntity);
    } catch (error) {
        console.error('Error loading or parsing JSON:', error);
        alert('Failed to load path data. Please check if the lunar_path.json file exists and is correctly formatted.');
    } finally {
        document.getElementById('loadingOverlay').style.display = 'none';
    }
}

function updateCameraInfo() {
    const camera = viewer.camera;
    const cartographic = camera.positionCartographic;
    const lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);
    const lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
    const height = (cartographic.height / 1000).toFixed(2);
    
    document.getElementById('cameraInfo').innerHTML = `
        Latitude: ${lat}°<br>
        Longitude: ${lon}°<br>
        Altitude: ${height} km
    `;
}

function setupPathVisibilityControl(pathEntity) {
    const pathVisibilitySlider = document.getElementById('pathVisibility');
    pathVisibilitySlider.addEventListener('input', (e) => {
        const visibility = parseFloat(e.target.value);
        pathEntity.polyline.material = new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.2,
            color: Cesium.Color.CYAN.withAlpha(visibility)
        });
    });
}

function setupEventListeners() {
    const dayNightCycleSlider = document.getElementById('dayNightCycle');
    dayNightCycleSlider.addEventListener('input', (e) => {
        const hour = parseFloat(e.target.value);
        const date = new Date();
        date.setUTCHours(hour);
        viewer.clock.currentTime = Cesium.JulianDate.fromDate(date);
    });

    const toggleLabelsButton = document.getElementById('toggleLabels');
    toggleLabelsButton.addEventListener('click', () => {
        viewer.entities.values.forEach(entity => {
            if (entity.label) {
                entity.label.show = !entity.label.show;
            }
        });
    });

    // Zoom controls
    document.getElementById('zoomIn').addEventListener('click', () => {
        viewer.camera.zoomIn(viewer.camera.defaultZoomAmount);
    });

    document.getElementById('zoomOut').addEventListener('click', () => {
        viewer.camera.zoomOut(viewer.camera.defaultZoomAmount);
    });

    document.getElementById('resetView').addEventListener('click', () => {
        viewer.zoomTo(viewer.entities);
    });

    // Pan controls
    const panAmount = 100000; // Adjust this value to change pan sensitivity
    document.getElementById('panLeft').addEventListener('click', () => {
        viewer.camera.moveRight(-panAmount);
    });

    document.getElementById('panRight').addEventListener('click', () => {
        viewer.camera.moveRight(panAmount);
    });

    document.getElementById('panUp').addEventListener('click', () => {
        viewer.camera.moveUp(panAmount);
    });

    document.getElementById('panDown').addEventListener('click', () => {
        viewer.camera.moveDown(panAmount);
    });

    const toggleControlsButton = document.getElementById('toggleControls');
    const controlsPanel = document.getElementById('controls');

    toggleControlsButton.addEventListener('click', () => {
        controlsPanel.classList.toggle('show');
    });

    viewer.camera.changed.addEventListener(updateCameraInfo);

    // Add click event listener for entity selection
    viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
        const pickedObject = viewer.scene.pick(movement.position);
        if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.position) {
            const cartographic = Cesium.Cartographic.fromCartesian(pickedObject.id.position.getValue());
            const latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);
            const longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
            alert(`Coordinates: Lat ${latitude}°, Lon ${longitude}°`);
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

async function initializeViewer() {
    await loadMoonTileset();
    await loadJSONAndPlotPath();
    setupEventListeners();
    updateCameraInfo();
}

initializeViewer();