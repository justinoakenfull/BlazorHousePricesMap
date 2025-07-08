let map = null;

// Auto-initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
    const mapElement = document.getElementById('map');
    if (mapElement) {
        initializeMap();
    }
});

function initializeMap() {
    // Initialize map centered on Sydney
    map = L.map('map').setView([-33.8688, 151.2093], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add sample marker
    L.marker([-33.8688, 151.2093]).addTo(map)
        .bindPopup('Sydney CBD');

    // Handle container resize
    const container = document.getElementById('map').parentElement;
    const resizeObserver = new ResizeObserver(() => {
        console.log('Map container resized');
        map.invalidateSize();
    });
    resizeObserver.observe(container);
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