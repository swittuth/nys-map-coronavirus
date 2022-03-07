const button_2020 = document.getElementById("2020");
const button_2021 = document.getElementById("2021");
const button_2022 = document.getElementById("2022");

mapboxgl.accessToken = 'pk.eyJ1Ijoic3dpdHR1dGgiLCJhIjoiY2t6aGZzcjZ1MDNucjJ1bnlpbGVjMHozNSJ9.wP4jf_xQ5-IDXtzRc2ECpA';
const map = new mapboxgl.Map({
    container: 'map',
    // https://docs.mapbox.com/api/maps/styles/ - for other styles
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-75.690308,42.682435],
    zoom: 5.8
});
let hoveredStateId = null;

// promise that contains data on covid
const covid_data_promise = fetch("covid_data_adjusted.json").then(e => e.json());


const state_list = ['Albany', 'Allegany', 'Bronx', 'Broome', 'Cattaraugus', 'Cayuga', 'Chautauqua', 'Chemung', 'Chenango', 
                    'Clinton', 'Columbia', 'Cortland', 'Delaware', 'Dutchess', 'Erie', 'Essex', 'Franklin', 'Fulton', 'Genesee', 
                    'Greene', 'Hamilton', 'Herkimer', 'Jefferson', 'Kings', 'Lewis', 'Livingston', 'Madison', 'Monroe', 'Montgomery', 
                    'Nassau', 'New', 'Niagara', 'Oneida', 'Onondaga', 'Ontario', 'Orange', 'Orleans', 'Oswego', 'Otsego', 
                    'Putnam', 'Queens', 'Rensselaer', 'Richmond', 'Rockland', 'St Lawrence', 'Saratoga', 'Schenectady', 'Schoharie', 
                    'Schuyler', 'Seneca', 'Steuben', 'Suffolk', 'Sullivan', 'Tioga', 'Tompkins', 'Ulster', 'Warren', 'Washington', 
                    'Wayne', 'Westchester', 'Wyoming', 'Yates']


map.on('load', () => {
    map.addSource('nys-counties', {
        type: "geojson",
        data: "./nys_counties_id.geojson"
    });

    // for (let i = 0; i < state_list.length; i++){
    //     matchExpression.push(state_list[i], `rgba(${Math.floor(Math.random() * 257)}, ${Math.floor(Math.random() * 257)}, ${Math.floor(Math.random() * 257)}, ${Math.floor(Math.random() * 257)})`)
    // }

    // load data to adjust color
    // basically get data and match each cases with the data on the map with counties name matched
    // 1st goal: render the number of tested coronavirus in each year

    button_2020.addEventListener('click', () => {
        map.removeLayer('nys-counties-fill-layer');
        render_map(2020);
    })

    button_2021.addEventListener('click', () => {
        map.removeLayer('nys-counties-fill-layer');
        render_map(2021);
    })

    button_2022.addEventListener('click', () => {
        map.removeLayer('nys-counties-fill-layer');
        render_map(2022);
    })

    function render_map(year) {
        covid_data_promise.then(data => { // array of of objects with time 
            const county_year_cases = {};
    
            let current_county = '';
            let total_positive = 0;
            let last_county = data[0]['County'];
            let selected_year = year;
    
            for (let i = 0; i < data.length; i++){
                let year = parseInt(data[i]["Test Date"].split('/')[2]);
                if (year === selected_year){
                    current_county = data[i]['County'];
                    
                    if (i > 0){
                        last_county = data[i - 1]['County'];
                    }
                    if (current_county !== last_county){
                        county_year_cases[last_county] = total_positive;
                        total_positive = 0;
                    }
    
                    total_positive += data[i]["New Positives"];
                }
                else {
                    continue;
                }
                county_year_cases[current_county] = total_positive; // to account for the last county: Yates
            }
    
            const matchExpression = ['match', ['get', 'NAME']];
            for (const key in county_year_cases){
                let redness;
    
                if (county_year_cases[key] < 30){
                    redness = 0;
                }
                else if (county_year_cases[key] < 10000){
                    redness = 50;
                }
                else if (county_year_cases[key] < 30000){
                    redness = 80;
                }
                else if (county_year_cases[key] < 80000){
                    redness = 120;
                }
                else if (county_year_cases[key] < 120000){
                    redness = 180;
                }
                else {
                    redness = 250;
                }
                let color = `rgba(${redness}, ${10}, ${10}, ${0.5})`
                matchExpression.push(key, color)
            }
            matchExpression.push('rgba(0, 0, 0, 0)');
    
            map.addLayer({
                'id': 'nys-counties-fill-layer',
                'type': 'fill',
                'source': 'nys-counties',
                'layout': {},
                'paint': {
                    'fill-color': matchExpression,
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false], 
                        1, 
                        0.7
                    ],
                    'fill-outline-color': 'coral'
                },
    
            });
        });
    }

    map.addLayer({
        'id': 'nys-counties-line-layer',
        'type': 'line', 
        'source': 'nys-counties',
        'layout': {},
        'paint': {
            'line-color': '#627BC1',
            'line-width': 1,
            'line-dasharray': [1, 1],
            'line-opacity': 0.5,

        },
    });

    map.addLayer({
        'id': 'nys-counties-name-layer',
        'type': 'symbol',
        'source': 'nys-counties',
        'layout': {
            'text-field': ['format', ['upcase',['get', 'ABBREV']], {'font-scale': 0.6}],
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        },
        'paint':{
            'text-color': 'black'
        }

    });

    map.on("mousemove", 'nys-counties-fill-layer', (e) => {
        if (e.features.length > 0) {
            if (hoveredStateId !== null) {
                map.setFeatureState(
                    { source: 'nys-counties', id: hoveredStateId },
                    { hover: false }
                );
            }
            hoveredStateId = e.features[0].id;
            map.setFeatureState(
                { source: 'nys-counties', id: hoveredStateId },
                { hover: true },
            );
        }
    });

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