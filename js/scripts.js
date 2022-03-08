const slider = document.getElementById('slider');
const title = document.getElementById('title');
const date = document.getElementById('date');

mapboxgl.accessToken = 'pk.eyJ1Ijoic3dpdHR1dGgiLCJhIjoiY2t6aGZzcjZ1MDNucjJ1bnlpbGVjMHozNSJ9.wP4jf_xQ5-IDXtzRc2ECpA';
const map = new mapboxgl.Map({
    container: 'map',
    // https://docs.mapbox.com/api/maps/styles/ - for other styles
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-74.553223,42.726839],
    maxBounds: [[-81.287842,40.195659],
        [-67.829590,45.158801]],
    zoom: 6
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

const tints_array = [
    '#ffffff',
    '#f6deff', '#f5dbff', '#f5d9ff', '#f4d6ff', '#f3d4ff', '#f3d1ff', '#f2cfff', '#f1ccff', '#f1c9ff', '#f0c7ff', '#efc4ff', '#eec2ff', '#eebfff', 
    '#edbdff', '#ecbaff', '#ecb8ff', '#ebb5ff', '#eab3ff', '#eab0ff', '#e9adff', '#e8abff', '#e8a8ff', '#e7a6ff', '#e6a3ff', '#e5a1ff', '#e59eff', 
    '#e49cff', '#e399ff', '#e396ff', '#e294ff', '#e191ff', '#e18fff', '#e08cff', '#df8aff', '#df87ff', '#de85ff', '#dd82ff', '#dd80ff', '#dc7dff', 
    '#db7aff', '#da78ff', '#da75ff', '#d973ff', '#d870ff', '#d86eff', '#d76bff', '#d669ff', '#d666ff', '#d563ff', '#d461ff', '#d45eff', '#d35cff', 
    '#d259ff', '#d157ff', '#d154ff', '#d052ff', '#cf4fff', '#cf4dff', '#ce4aff', '#cd47ff', '#cd45ff', '#cc42ff', '#cb40ff', '#cb3dff', '#ca3bff', 
    '#c938ff', '#c836ff', '#c833ff', '#c730ff', '#c62eff', '#c62bff', '#c529ff', '#c426ff', '#c424ff', '#c321ff', '#c21fff', '#c21cff', '#c119ff', 
    '#c017ff', '#c014ff', '#bf12ff', '#be0fff', '#bd0dff', '#bd0aff', '#bc08ff', '#bb05ff', '#bb03ff', '#ba00ff', '#b800fc', '#b600fa', '#b400f7', 
    '#b300f5', '#b100f2', '#af00f0', '#ad00ed', '#ab00eb', '#a900e8', '#a700e6', '#a600e3', '#a400e0', '#a200de', '#a000db', '#9e00d9', '#9c00d6', 
    '#9a00d4', '#9900d1', '#9700cf', '#9500cc', '#9300c9', '#9100c7', '#8f00c4', '#8d00c2', '#8c00bf', '#8a00bd', '#8800ba', '#8600b8', '#8400b5', 
    '#8200b3', '#8000b0', '#7e00ad', '#7d00ab', '#7b00a8', '#7900a6', '#7700a3', '#7500a1', '#73009e', '#71009c', '#700099', '#6e0096', '#6c0094', 
    '#6a0091', '#68008f', '#66008c', '#64008a', '#630087', '#610085', '#5f0082', '#5d0080', '#5b007d', '#59007a', '#570078', '#560075', '#540073', 
    '#520070', '#50006e', '#4e006b', '#4c0069', '#4a0066', '#490063', '#470061', '#45005e', '#43005c', '#410059', '#3f0057', '#3d0054', '#3c0052', 
    '#3a004f', '#38004d', '#36004a', '#340047', '#320045', '#300042', '#2f0040', '#2d003d', '#2b003b', '#290038', '#270036', '#250033', '#230030', 
    '#21002e', '#20002b', '#1e0029', '#1c0026', '#1a0024', '#180021', '#16001f', '#14001c', '#130019', '#110017', '#0f0014', '#0d0012', '#0b000f', 
    '#09000d', '#07000a', '#060008', '#040005', '#020003', '#000000'
]


map.on('load', () => {
    map.addSource('nys-counties', {
        type: "geojson",
        data: "./nys_counties_id.geojson"
    });

    // render initial map
    render_map(1, 3, 2020);

    slider.addEventListener('input', event => {
        let start_date = new Date("03/01/2020");
        let days_to_add = event.target.value - 1;
        start_date.setDate(start_date.getDate() + days_to_add); // added days to date to render map correctly
        let current_month = start_date.getMonth() + 1;
        let current_day = start_date.getDate();
        let current_year = start_date.getFullYear();
        date.innerHTML = `Date: ${current_month} ${current_day}, ${current_year}`;

        map.removeLayer('nys-counties-fill-layer');
        render_map(current_day, current_month, current_year);

    });

    // render map on that particular day, month and year 
    function render_map(chosen_day, chosen_month, chosen_year) {
        covid_data_promise.then(data => { // array of of objects with time 
            const county_year_cases = {};
    
            let current_county = '';
            let last_county = data[0]['County'];
    
            /*
            render by month and day by checking for month and day 
            find the total range in python
            */

            for (let i = 0; i < data.length; i++){
                let string_date = data[i]["Test Date"].split(' ')[0].split('/');
                let month = parseInt(string_date[0]);
                let day = parseInt(string_date[1]);
                let year = parseInt(string_date[2]);
                let total_positive = 0;
                
                if (month === chosen_month && day === chosen_day && year === chosen_year){
                    current_county = data[i]['County'];
                    
                    if (i > 0){
                        last_county = data[i - 1]['County'];
                    }
                    if (current_county !== last_county){
                        county_year_cases[last_county] = total_positive;
                        total_positive = 0;
                    }
    
                    total_positive += data[i]["Cumulative Number of Positives"];
                }
                else {
                    continue;
                }
                county_year_cases[current_county] = total_positive; // to account for the last county: Yates
            }
    
            // most dense - concetrated range of virus is around 100,000 (use 150 colors for this)
            // second shows arround 400,000 (35 colors)
            // highest is 680,000 (10 colors)
            const threshold_one = 100000;
            const threshold_two = 400000;
            const threshold_three = 676316;
            const first_num_colors = 150;
            const second_num_colors = 10;
            const third_num_colors = tints_array.length - first_num_colors - second_num_colors;
            const first_color_div = Math.floor(100000 / first_num_colors);
            const second_color_div = Math.floor((threshold_two - threshold_one) / second_num_colors);
            const third_color_div = Math.floor(threshold_three / third_num_colors);
            const matchExpression = ['match', ['get', 'NAME']];
            for (const key in county_year_cases){
                
                let color;
                let cases = county_year_cases[key];

                if (cases <= threshold_one){
                    color = tints_array[Math.floor(cases / first_color_div)];
                    
                }
                else if (cases <= threshold_two){
                    color = tints_array[first_num_colors + Math.floor(cases / second_color_div)];
                }
                else {
                    color = tints_array[first_num_colors + second_num_colors + Math.floor(cases / third_color_div)];
                }
                
                matchExpression.push(key, color)

            }
            matchExpression.push('#000000');
    
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

            map.on('click', 'nys-counties-fill-layer', e => {
                let name_clicked = e.features['0']['properties']["NAME"];
                let total_cases = county_year_cases[name_clicked];

                
                title.innerHTML = `${name_clicked}: ${total_cases}`;
                
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
        map.getCanvas().style.cursor = 'pointer';
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
        map.getCanvas().style.cursor = '';
        if (hoveredStateId !== null) {
            map.setFeatureState(
                { source: 'nys-counties', id: hoveredStateId },
                { hover: false }
            );
        }
        hoveredStateId = null;
    });

});