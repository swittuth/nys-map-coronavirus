mapboxgl.accessToken = 'pk.eyJ1Ijoic3dpdHR1dGgiLCJhIjoiY2t6aGZzcjZ1MDNucjJ1bnlpbGVjMHozNSJ9.wP4jf_xQ5-IDXtzRc2ECpA';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-75.690308,42.682435],
    zoom: 5.6
});
let hoveredStateId = null;

map.on('load', () => {
    map.addSource('nys-counties', {
        type: "geojson",
        data: "./nys_counties.geojson"
    });


    console.log("./nys_counties.geojson");

    map.addLayer({
        'id': 'nys-counties-fill-layer',
        'type': 'fill',
        'source': 'nys-counties',
        'layout': {},
        'paint': {
            'fill-color': '#627BC1',
            'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false], 
                1, 
                0.2
            ]
        },
    });

    map.addLayer({
        'id': 'nys-counties-line-layer',
        'type': 'line', 
        'source': 'nys-counties',
        'layout': {},
        'paint': {
            'line-color': '#627BC1',
            'line-width': 0.5
        },
    });

    map.addLayer({
        'id': 'nys-counties-name-layer',
        'type': 'symbol',
        'source': 'nys-counties',
        'layout': {
            'text-field': ['get', 'ABBREV'],

        }
    })

    map.on("mousemove", 'nys-counties-fill-layer', (e) => {
        if (e.features.length > 0) {
            if (hoveredStateId !== null) {
                map.setFeatureState(
                    { source: 'nys-counties', id: hoveredStateId },
                    { hover: false }
                );
            }
            hoveredStateId = parseInt(e.features[0].properties['GNIS_ID']);
            console.log(hoveredStateId)
            map.setFeatureState(
                { source: 'nys-counties', id: hoveredStateId },
                { hover: true },
            );
        }
    })

    map.on('mouseleave', 'nys-counties-fill-layer', () => {
        if (hoveredStateId !== null) {
            map.setFeatureState(
                { source: 'nys-counties', id: hoveredStateId },
                { hover: false }
            );
        }
        hoveredStateId = null;
    });

});

// ["point", "lngLat", "originalEvent", 
// "features", "type", "_defaultPrevented", "target"]

//["NAME", "ABBREV", "GNIS_ID", "FIPS_CODE", 
// "SWIS", "NYSP_ZONE", "NYC", "CALC_SQ_MI", "Shape_Leng", "Shape_Area"]