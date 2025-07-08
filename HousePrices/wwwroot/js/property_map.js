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

    // Handle container resize
    const container = document.getElementById('map').parentElement;
    const resizeObserver = new ResizeObserver(() => {
        console.log('Map container resized');
        map.invalidateSize();
    });
    resizeObserver.observe(container);
    // Function to adjust heatmap intensity based on zoom
    map.on('zoomend', function () {
        if (heatmapLayer && map.hasLayer(heatmapLayer)) {
            const currentZoom = map.getZoom();
            const baseRadius = heatmapLayer._baseRadius || 25;
            const baseBlur = heatmapLayer._baseBlur || 15;

            // Adjust radius based on zoom level
            let radiusMultiplier;
            if (currentZoom < 10) {
                radiusMultiplier = 2;
            } else if (currentZoom < 12) {
                radiusMultiplier = 1.8;
            } else if (currentZoom < 14) {
                radiusMultiplier = 1.6;
            } else {
                radiusMultiplier = 1.4;
            }

            heatmapLayer.setOptions({
                radius: baseRadius * radiusMultiplier,
                blur: baseBlur * radiusMultiplier
            });
        }
    });
}

function updateMapData(markers, heatmapPoints, region) {
    console.log(`Updating map with ${markers.length} markers for ${region}`);

    // Clear existing markers and heatmap
    markersLayer.clearLayers();
    if (heatmapLayer) {
        map.removeLayer(heatmapLayer);
        heatmapLayer = null;
    }

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

    // Create heatmap layer
    createHeatmapLayer(markers);

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

function createHeatmapLayer(markers) {
    // Find min and max prices to normalize the data
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    markers.forEach(marker => {
        if (marker.price < minPrice) minPrice = marker.price;
        if (marker.price > maxPrice) maxPrice = marker.price;
    });

    console.log(`Price range: ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`);
    console.log(`Creating heatmap with ${markers.length} properties`);

    // Calculate price thresholds for better distribution
    const priceRange = maxPrice - minPrice;
    const midPrice = minPrice + (priceRange * 0.5);

    // Convert markers to heatmap data format with weighted intensities
    const heatData = [];

    markers.forEach(marker => {
        // Calculate base intensity from price
        let intensity = (marker.price - minPrice) / priceRange || 0.5;

        // Apply non-linear scaling to create more variation
        // This creates more distinct hot and cold spots
        if (intensity < 0.3) {
            intensity = intensity * 0.5; // Make cheap properties cooler
        } else if (intensity > 0.7) {
            intensity = 0.7 + (intensity - 0.7) * 1.5; // Make expensive properties hotter
            intensity = Math.min(intensity, 1.0);
        }

        // Add the main point with full intensity
        heatData.push([marker.lat, marker.lng, intensity]);

        // Add surrounding points to create better coverage
        // More points = more continuous heatmap
        const surroundingPoints = markers.length < 50 ? 8 : markers.length < 200 ? 5 : 3;
        const spread = markers.length < 50 ? 0.015 : markers.length < 200 ? 0.01 : 0.007;

        for (let i = 0; i < surroundingPoints; i++) {
            const angle = (i / surroundingPoints) * 2 * Math.PI;
            const distance = spread * (0.5 + Math.random() * 0.5);
            const offsetLat = marker.lat + Math.cos(angle) * distance;
            const offsetLng = marker.lng + Math.sin(angle) * distance * 1.2; // Slightly more spread on longitude
            const offsetIntensity = intensity * (0.4 + Math.random() * 0.3);
            heatData.push([offsetLat, offsetLng, offsetIntensity]);
        }
    });

    // Dynamically adjust radius and blur based on number of properties
    let radius, blur, maxIntensity;

    if (markers.length < 10) {
        radius = 80;
        blur = 60;
        maxIntensity = 0.4;
    } else if (markers.length < 25) {
        radius = 70;
        blur = 50;
        maxIntensity = 0.5;
    } else if (markers.length < 50) {
        radius = 60;
        blur = 40;
        maxIntensity = 0.6;
    } else if (markers.length < 100) {
        radius = 50;
        blur = 35;
        maxIntensity = 0.7;
    } else if (markers.length < 250) {
        radius = 40;
        blur = 30;
        maxIntensity = 0.8;
    } else {
        radius = 35;
        blur = 25;
        maxIntensity = 0.9;
    }

    // Create the heatmap layer with custom options
    heatmapLayer = L.heatLayer(heatData, {
        radius: radius,
        blur: blur,
        maxZoom: 16,
        max: maxIntensity,
        gradient: {
            0.0: '#0000ff',   // Pure blue for coldest
            0.1: '#0040ff',
            0.2: '#0080ff',
            0.3: '#00bfff',
            0.4: '#00ffff',   // Cyan
            0.5: '#00ff80',   // Green-cyan
            0.6: '#80ff00',   // Yellow-green
            0.7: '#ffff00',   // Yellow
            0.8: '#ff8000',   // Orange
            0.9: '#ff4000',   // Red-orange
            1.0: '#ff0000'    // Pure red for hottest
        },
        minOpacity: 0.2   // Lower min opacity for better blending
    });

    // Store the base radius for zoom adjustments
    heatmapLayer._baseRadius = radius;
    heatmapLayer._baseBlur = blur;

    // Don't add to map yet - wait for toggle
    console.log(`Heatmap created: radius=${radius}, blur=${blur}, maxIntensity=${maxIntensity}, points=${heatData.length}`);
}

function toggleHeatmap(show) {
    if (!heatmapLayer) {
        console.log('No heatmap layer available');
        return;
    }

    if (show) {
        map.addLayer(heatmapLayer);
        // Optionally reduce marker opacity when showing heatmap
        markersLayer.eachLayer(function (layer) {
            if (layer.setOpacity) {
                layer.setOpacity(0.6);
            }
        });
        console.log('Heatmap layer added');
    } else {
        map.removeLayer(heatmapLayer);
        // Restore full marker opacity
        markersLayer.eachLayer(function (layer) {
            if (layer.setOpacity) {
                layer.setOpacity(1.0);
            }
        });
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

