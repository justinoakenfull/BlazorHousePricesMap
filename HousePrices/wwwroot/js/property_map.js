let map = null;
let markersLayer = null;
let heatmapLayer = null;
let currentMarkers = [];
let currentHeatmapPoints = [];

// Regional center coordinates
const regionCenters = {
    'Sydney': [-33.8688, 151.2093],
    'Melbourne': [-37.8136, 144.9631],
    'Brisbane': [-27.4698, 153.0251],
    'Perth': [-31.9505, 115.8605],
    'Adelaide': [-34.9285, 138.6007]
};

// Auto-initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
    const mapElement = document.getElementById('map');
    if (mapElement) {
        initializePropertyMap();
    }
});

function initializePropertyMap() {
    // Initialize map centered on Sydney
    map = L.map('map').setView([-33.8688, 151.2093], 10);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Initialize layers
    markersLayer = L.layerGroup().addTo(map);
    heatmapLayer = L.layerGroup();

    // Handle container resize
    const container = document.getElementById('map').parentElement;
    const resizeObserver = new ResizeObserver(() => {
        console.log('Map container resized');
        map.invalidateSize();
    });
    resizeObserver.observe(container);
}

function updateMapData(markers, heatmapPoints, region) {
    console.log(`Updating map with ${markers.length} markers for ${region}`);

    // Clear existing markers
    markersLayer.clearLayers();
    heatmapLayer.clearLayers();

    // Store data for future use
    currentMarkers = markers;
    currentHeatmapPoints = heatmapPoints;

    // Set map view to region center
    if (regionCenters[region]) {
        map.setView(regionCenters[region], 10);
    }

    // Add property markers
    markers.forEach(marker => {
        const markerIcon = createCustomMarker(marker.colour);
        const mapMarker = L.marker([marker.lat, marker.lng], { icon: markerIcon })
            .bindPopup(marker.popupText);

        markersLayer.addLayer(mapMarker);
    });

    // Create heatmap points but don't add to map yet
    createHeatmapLayer(heatmapPoints);

    console.log(`Added ${markers.length} markers to map`);
}

function createCustomMarker(color) {
    // Create custom colored markers
    const colorMap = {
        'green': '#28a745',
        'blue': '#007bff',
        'orange': '#fd7e14',
        'red': '#dc3545',
        'gray': '#6c757d'
    };

    const markerColor = colorMap[color] || '#6c757d';

    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background-color: ${markerColor};
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
}

function createHeatmapLayer(heatmapPoints) {
    // Simple heatmap using circles with varying opacity
    heatmapPoints.forEach(point => {
        const circle = L.circle([point.lat, point.lng], {
            radius: 200,
            fillColor: '#ff0000',
            color: 'transparent',
            fillOpacity: point.intensity * 0.3,
            weight: 0
        });

        heatmapLayer.addLayer(circle);
    });
}

function toggleHeatmap(show) {
    if (show) {
        map.addLayer(heatmapLayer);
        console.log('Heatmap layer added');
    } else {
        map.removeLayer(heatmapLayer);
        console.log('Heatmap layer removed');
    }
}

function maxMapSize() {
    console.log("Resized.")
    const mapContainer = document.getElementById('map').parentElement;
    const containerWidth = mapContainer.getBoundingClientRect().width;

    mapContainer.style.width = '100%';
    console.log(mapContainer.style.width);
    mapContainer.style.height = containerWidth + 'px';


    if (map) {
        map.invalidateSize();
    } else {
        console.error("Map not found!");
    }
}

// Helper function to get marker statistics
function getMarkerStats() {
    const stats = {
        total: currentMarkers.length,
        byColor: {}
    };

    currentMarkers.forEach(marker => {
        stats.byColor[marker.colour] = (stats.byColor[marker.colour] || 0) + 1;
    });

    console.log('Marker statistics:', stats);
    return stats;
}

// Add click handler for map
function onMapClick(e) {
    console.log("Clicked at " + e.latlng);
}

// Initialize map click handler when map is ready
document.addEventListener('DOMContentLoaded', function () {
    if (map) {
        map.on('click', onMapClick);
    }
});