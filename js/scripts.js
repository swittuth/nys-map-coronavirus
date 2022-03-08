const slider = document.getElementById('slider');
const title = document.getElementById('title');

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
    
            const matchExpression = ['match', ['get', 'NAME']];
            for (const key in county_year_cases){
                // let redness;
    
                // if (county_year_cases[key] < 30){
                //     redness = 0;
                // }
                // else if (county_year_cases[key] < 10000){
                //     redness = 50;
                // }
                // else if (county_year_cases[key] < 30000){
                //     redness = 80;
                // }
                // else if (county_year_cases[key] < 80000){
                //     redness = 120;
                // }
                // else if (county_year_cases[key] < 120000){
                //     redness = 180;
                // }
                // else {
                //     redness = 250;
                // }
                // let color_red = `rgba(${redness}, ${10}, ${10}, ${0.5})`

                let color;
                let cases = county_year_cases[key];

                if (cases === 0){
                    color = '#ffffff';
                }
                else if (cases <= 50){
                    color = '#fefcff';
                }
                else if (cases <= 100){
                    color = '#fefaff';
                }
                else if (cases <= 200){
                    color = '#fdf7ff';
                }
                else if (cases <= 500){
                    color = '#fcf5ff';
                }
                else if (cases <= 750){
                    color = '#fcf2ff';
                }
                else if (cases <= 800){
                    color = '#fbf0ff';
                }
                else if (cases <= 950){
                    color = '#faedff';
                }
                else if (cases <= 1050){
                    color = '#f9ebff';
                }
                else if (cases <= 1500){
                    color = '#f9e8ff';
                }
                else if (cases <= 2500){
                    color = '#f8e6ff';
                }
                else if (cases <= 4000){
                    color = '#f7e3ff';
                }
                else if (cases <= 4200){
                    color = '#f7e0ff';
                }
                else if (cases <= 4800){
                    color = '#f6deff';
                }
                else if (cases <= 5500){
                    color = '#f5dbff';
                }
                else if (cases <= 6800){
                    color = '#f5d9ff';
                }
                else if (cases <= 7200){
                    color = '#f4d6ff';
                }
                else if (cases <= 7600){
                    color = '#f3d4ff';
                }
                else if (cases <= 8500){
                    color = '#f3d1ff';
                }
                else if (cases <= 8800){
                    color = '#f2cfff'
                }
                else if (cases <= 9500){
                    color = '#f1ccff';
                }
                else if (cases <= 12000){
                    color = '#f1c9ff';
                }
                else if (cases <= 12500){
                    color = '#f0c7ff';
                }
                else if (cases <= 17500){
                    color = '#efc4ff';
                }
                else if (cases <= 23000){
                    color = '#eec2ff';
                }
                else if (cases <= 25000){
                    color = '#eebfff';
                }
                else if (cases <= 27500){
                    color = '#edbdff';
                }
                else if (cases <= 30000){
                    color = '#ecbaff';
                }
                else if (cases <= 35000){
                    color = '#ecb8ff';
                }
                else if (cases <= 45000){
                    color = '#ebb5ff';
                }
                else if (cases <= 55000){
                    color = '#eab3ff';
                }
                else if (cases <= 75000){
                    color = '#eab0ff';
                }
                else if (cases <= 82000){
                    color = '#e9adff';
                }
                else if (cases <= 85000){
                    color = '#e8abff';
                }
                else if (cases <= 90000){
                    color = '#e8a8ff';
                }
                else if (cases <= 93000){
                    color = '#e7a6ff';
                }
                else if (cases <= 100000){
                    color = '#e6a3ff';
                }
                else if (cases <= 105000){
                    color = '#e5a1ff';
                }
                else if (cases <= 108000){
                    color = '#e59eff';
                }
                else if (cases <= 112000){
                    color = '#e49cff';
                }
                else if (cases <= 115000){
                    color = '#e399ff';
                }
                else if (cases <= 117000){
                    color = '#e396ff';
                }
                else if (cases <= 120000){
                    color = '#e294ff';
                }
                else if (cases <= 122000){
                    color = '#e191ff';
                }
                else if (cases <= 125000){
                    color = '#e18fff';
                }
                else if (cases <= 127000){
                    color = '#e08cff';
                }
                else if (cases <= 129000){
                    color = '#df8aff';
                }
                else if (cases <= 136000){
                    color = '#df87ff'
                }
                else if (cases <= 138000){
                    color = '#de85ff';
                }
                else if (cases <= 145000){
                    color = '#dd82ff';
                }
                else if (cases <= 150000){
                    color = '#dd80ff';
                }
                else if (cases <= 153000){
                    color = '#dc7dff';
                }
                else if (cases <= 156000){
                    color = '#db7aff';
                }
                else if (cases <= 165000){
                    color = '#da78ff';
                }
                else if (cases <= 182000){
                    color = '#da75ff';
                }
                else if (cases <= 188000){
                    color = '#d973ff';
                }
                else if (cases <= 195000){
                    color = '#d870ff';
                }
                else if (cases <= 202000){
                    color = '#d86eff';
                }
                else if (cases <= 204000){
                    color = '#d76bff';
                }
                else if (cases <= 205000){
                    color = '#d669ff';
                }
                else if (cases <= 208000){
                    color = '#d666ff';
                }
                else if (cases <= 212000){
                    color = '#d563ff';
                }
                else if (cases <= 215000){
                    color = '#d461ff';
                }
                else if (cases <= 217000){
                    color = '#d45eff';
                }
                else if (cases <= 220000){
                    color = '#d35cff';
                }
                else if (cases <= 222000){
                    color = '#d259ff';
                }
                else if (cases <= 225000){
                    color = '#d157ff';
                }
                else if (cases <= 228000){
                    color = '#d154ff';
                }
                else if (cases <= 235000){
                    color = '#d052ff';
                }
                else if (cases <= 238000){
                    color = '#cf4fff';
                }
                else if (cases <= 242000){
                    color = '#cf4dff';
                }
                else if (cases <= 244000){
                    color = '#ce4aff';
                }
                else if (cases <= 247000){
                    color = '#cd47ff';
                }
                else if (cases <= 250000){
                    color = '#cd45ff';
                }
                else if (cases <= 252000){
                    color = '#cc42ff';
                }
                else if (cases <= 254000){
                    color = '#cb40ff';
                }
                else if (cases <= 257000){
                    color = '#cb3dff';
                }
                else if (cases <= 260000){
                    color = '#ca3bff';
                }
                else if (cases <= 262000){
                    color = '#c938ff';
                }
                else if (cases <= 265000){
                    color = '#c836ff';
                }
                else if (cases <= 272000){
                    color = '#c833ff';
                }
                else if (cases <= 278000){
                    color = '#c730ff';
                }
                else if (cases <= 282000){
                    color = '#c62eff';
                }
                else if (cases <= 285000){
                    color = '#c62bff';
                }
                else{
                    color = '#000000';
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