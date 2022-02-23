mapboxgl.accessToken = 'pk.eyJ1Ijoic3dpdHR1dGgiLCJhIjoiY2t6aGZzcjZ1MDNucjJ1bnlpbGVjMHozNSJ9.wP4jf_xQ5-IDXtzRc2ECpA';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-75.690308,42.682435],
    zoom: 5.6
});

map.on('load', () => {
    map.addSource('nys-counties', {
        type: "geojson",
        data: "./nys_counties.geojson"
    });

    map.addLayer({
        'id': 'nys-counties-fill-layer',
        'type': 'fill',
        'paint': {
            'fill-color': "grey",
            'fill-opacity': 0.3
        },
        'source': 'nys-counties'
    });

    map.addLayer({
        'id': 'nys-counties-line-layer',
        'type': 'line', 
        'paint': {
            'line-color': 'coral'
        },
        'source': 'nys-counties'
    });

    map.addLayer({
        'id': 'nys-counties-name-layer',
        'type': 'symbol',
        'source': 'nys-counties',
        'layout': {
            'text-field': ['get', 'NAME'],

        }
    })

    map.on('mousemove', 'nys-counties-fill-layer', (e) => {
        
    });

    map.on('mouseenter', 'nys-counties-fill-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseout', 'nys-counties-fill-layer', () => {
        map.getCanvas().style.cursor = 'grab';
    })

    map.on('mouseup', 'nys-counties-fill-layer', () => {
        map.getCanvas().style.cursor = 'grab';
    });

    map.on('mousedown', () => {
        map.getCanvas().style.cursor = 'grabbing';
    })
});

// ["point", "lngLat", "originalEvent", 
// "features", "type", "_defaultPrevented", "target"]

//["NAME", "ABBREV", "GNIS_ID", "FIPS_CODE", 
// "SWIS", "NYSP_ZONE", "NYC", "CALC_SQ_MI", "Shape_Leng", "Shape_Area"]