mapboxgl.accessToken = 'pk.eyJ1Ijoic3dpdHR1dGgiLCJhIjoiY2t6aGZzcjZ1MDNucjJ1bnlpbGVjMHozNSJ9.wP4jf_xQ5-IDXtzRc2ECpA';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-96, 37.8],
    zoom: 3
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
            'fill-opacity': 0.8
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
    })
});