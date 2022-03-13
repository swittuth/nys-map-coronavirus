const slider = document.getElementById('slider');
const title = document.getElementById('title');
const date = document.getElementById('date');
const total_cases = document.getElementById('total-cases');

mapboxgl.accessToken = 'pk.eyJ1Ijoic3dpdHR1dGgiLCJhIjoiY2t6aGZzcjZ1MDNucjJ1bnlpbGVjMHozNSJ9.wP4jf_xQ5-IDXtzRc2ECpA';
const map = new mapboxgl.Map({
    container: 'map',
    // https://docs.mapbox.com/api/maps/styles/ - for other styles
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-77.025146,42.350425],
    // maxBounds: [[-81.287842,40.195659],
    //     [-67.829590,45.158801]],
    zoom: 5.7
});
map.scrollZoom.disable();

let hoveredStateId = null;

// promise that contains data on covid
const covid_data_promise = fetch("./data_files/covid_data_adjusted.json").then(e => e.json());


const state_list = ['Albany', 'Allegany', 'Bronx', 'Broome', 'Cattaraugus', 'Cayuga', 'Chautauqua', 'Chemung', 'Chenango', 
                    'Clinton', 'Columbia', 'Cortland', 'Delaware', 'Dutchess', 'Erie', 'Essex', 'Franklin', 'Fulton', 'Genesee', 
                    'Greene', 'Hamilton', 'Herkimer', 'Jefferson', 'Kings', 'Lewis', 'Livingston', 'Madison', 'Monroe', 'Montgomery', 
                    'Nassau', 'New', 'Niagara', 'Oneida', 'Onondaga', 'Ontario', 'Orange', 'Orleans', 'Oswego', 'Otsego', 
                    'Putnam', 'Queens', 'Rensselaer', 'Richmond', 'Rockland', 'St Lawrence', 'Saratoga', 'Schenectady', 'Schoharie', 
                    'Schuyler', 'Seneca', 'Steuben', 'Suffolk', 'Sullivan', 'Tioga', 'Tompkins', 'Ulster', 'Warren', 'Washington', 
                    'Wayne', 'Westchester', 'Wyoming', 'Yates']

const tints_array = ['#faf3ed', '#faf1eb', '#f9efe8', '#f8eee6', '#f8ece3', '#f7eae1', '#f6e8de', '#f6e7dc', '#f5e5d9', '#f4e3d7', 
                    '#f4e1d4', '#f3e0d2', '#f2decf', '#f2dccd', '#f1daca', '#f0d9c8', '#f0d7c5', '#efd5c3', '#eed4c0', '#eed2be', 
                    '#edd0bb', '#ecceb9', '#eccdb6', '#ebcbb4', '#eac9b1', '#eac7af', '#e9c6ac', '#e8c4aa', '#e8c2a7', '#e7c0a5', 
                    '#e6bfa2', '#e6bda0', '#e5bb9d', '#e4b99b', '#e4b898', '#e3b696', '#e2b493', '#e2b291', '#e1b18e', '#e0af8c', 
                    '#e0ad89', '#dfab87', '#deaa84', '#dea882', '#dda67f', '#dca57c', '#dba37a', '#dba177', '#da9f75', '#d99e72', 
                    '#d99c70', '#d89a6d', '#d7986b', '#d79768', '#d69566', '#d59363', '#d59161', '#d4905e', '#d38e5c', '#d38c59', 
                    '#d28a57', '#d18954', '#d18752', '#d0854f', '#cf834d', '#cf824a', '#ce8048', '#cd7e45', '#cd7d43', '#cc7b40', 
                    '#cb793e', '#cb773b', '#ca7639', '#c97436', '#c97234', '#c87031', '#c76f2f', '#c76d2c', '#c66b2a', '#c56927', 
                    '#c56825', '#c46622', '#c36420', '#c3621d', '#c2611b', '#c15f18', '#c15d16', '#c05b13', '#bf5a11', '#bf580e', 
                    '#be560c', '#bd5409', '#bd5307', '#bc5104', '#ba5004', '#b84f04', '#b64f04', '#b44e04', '#b34d04', '#b14c04', 
                    '#af4b04', '#ad4b04', '#ab4a04', '#a94904', '#a74804', '#a54704', '#a44603', '#a24603', '#a04503', '#9e4403', 
                    '#9c4303', '#9a4203', '#984203', '#964103', '#954003', '#933f03', '#913e03', '#8f3e03', '#8d3d03', '#8b3c03', 
                    '#893b03', '#873a03', '#853a03', '#843903', '#823803', '#803703', '#7e3603', '#7c3503', '#7a3503', '#783403', 
                    '#763303', '#753202', '#733102', '#713102', '#6f3002', '#6d2f02', '#6b2e02', '#692d02', '#672d02', '#662c02', 
                    '#642b02', '#622a02', '#602902', '#5e2902', '#5c2802', '#5a2702', '#582602', '#562502', '#552402', '#532402', 
                    '#512302', '#4f2202', '#4d2102', '#4b2002', '#492002', '#471f02', '#461e01', '#441d01', '#421c01', '#401c01', 
                    '#3e1b01', '#3c1a01', '#3a1901', '#381801', '#371701', '#351701', '#331601', '#311501', '#2f1401', '#2d1301', 
                    '#2b1301', '#291201', '#271101', '#261001', '#240f01', '#220f01', '#200e01', '#1e0d01', '#1c0c01', '#1a0b01', 
                    '#180b01', '#170a00', '#150900']


map.on('load', () => {
    map.addSource('nys-counties', {
        type: "geojson",
        data: "./data_files/nys_counties_id.geojson"
    });

    // render initial map
    render_map(1, 3, 2020);
    
    // to display total number of cases when number of virus increase
    let total_number_cases = 0;
    let increase = true;
    let wheel_event = false;
    let slider_event = false;

    document.addEventListener("wheel", event => {
        wheel_event = true;
        slider_event = false;

        event.preventDefault();
        event.stopPropagation();
        let start_date = new Date("03/01/2020");

        if (event.wheelDelta < 0){
            if (slider.value <= 711){
                slider.value = (parseInt(slider.value) + 1).toString();
                start_date.setDate(start_date.getDate() + parseInt(slider.value)); // added days to date to render map correctly
                let current_month = start_date.getMonth() + 1;
                let current_day = start_date.getDate();
                let current_year = start_date.getFullYear();
                date.innerHTML = `Date: ${start_date.toLocaleString('default', {month: 'long'})} ${current_day}, ${current_year}`;
                map.removeLayer('nys-counties-fill-layer');
                render_map(current_day, current_month, current_year);
                increase = true;
            }
        }
        else {
            if (slider.value >= 0){
                slider.value -= 1;
                start_date.setDate(start_date.getDate() + parseInt(slider.value)); // added days to date to render map correctly
                let current_month = start_date.getMonth() + 1;
                let current_day = start_date.getDate();
                let current_year = start_date.getFullYear();
                date.innerHTML = `Date: ${start_date.toLocaleString('default', {month: 'long'})} ${current_day - 1}, ${current_year}`;

                map.removeLayer('nys-counties-fill-layer');
                render_map(current_day, current_month, current_year);
                increase = false;
            }
        }
    }, {passive:false});

    slider.addEventListener('input', event => {
        slider_event = true;
        wheel_event = false;
        let start_date = new Date("03/01/2020");
        let days_to_add = event.target.value - 1;
        start_date.setDate(start_date.getDate() + days_to_add); // added days to date to render map correctly
        let current_month = start_date.getMonth() + 1;
        let current_day = start_date.getDate();
        let current_year = start_date.getFullYear();
        date.innerHTML = `Date: ${start_date.toLocaleString('default', {month: 'long'})} ${current_day}, ${current_year}`;

        map.removeLayer('nys-counties-fill-layer');
        render_map(current_day, current_month, current_year);

    });

    map.addLayer({
        'id': 'nys-counties-name-layer',
        'type': 'symbol',
        'source': 'nys-counties',
        'layout': {
            'text-field': ['format', ['upcase',['get', 'ABBREV']], {'font-scale': 0.4}],
            'text-justify': 'center',
        },
        'paint':{
            'text-color': 'black',
            'text-opacity': 1,
        }

    });
    
    let county_year_cases = {}
    // render map on that particular day, month and year 
    function render_map(chosen_day, chosen_month, chosen_year) {
        covid_data_promise.then(data => { // array of of objects with time 
            county_year_cases = {};
    
            let current_county = '';
            let last_county = data[0]['County'];
    
            /*
            render by month and day by checking for month and day 
            find the total range in python
            */

            // reset value
            if (slider_event){
                total_number_cases = 0;
            }

            for (let i = 0; i < data.length; i++){
                let string_date = data[i]["Test Date"].split(' ')[0].split('/');
                let month = parseInt(string_date[0]);
                let day = parseInt(string_date[1]);
                let year = parseInt(string_date[2]);
                let total_county_positive = 0;
                
                if (month === chosen_month && day === chosen_day && year === chosen_year){
                    current_county = data[i]['County'];
                    
                    if (i > 0){
                        last_county = data[i - 1]['County'];
                    }
                    if (current_county !== last_county){
                        county_year_cases[last_county] = total_county_positive;
                        total_county_positive = 0;
                    }
                    total_county_positive += data[i]["Cumulative Number of Positives"];
                    if (wheel_event){
                        if (increase){
                            total_number_cases += data[i]["New Positives"];
                        }
                        else{
                            total_number_cases -= data[i + 1]["New Positives"];
                        }

                        total_cases.innerHTML = 'Cumulative Cases: ' + total_number_cases.toLocaleString();
                    }
                    else if (slider_event){
                        total_number_cases += total_county_positive;
                        total_cases.innerHTML = 'Cumulative Cases: ' + total_number_cases.toLocaleString();
                    }

                }
                else {
                    continue;
                }
                county_year_cases[current_county] = total_county_positive; // to account for the last county: Yates
            }
    
            // most dense - concetrated range of virus is around 100,000 (use 150 colors for this)
            // second shows arround 400,000 (35 colors)
            // highest is 680,000 (10 colors)
            const threshold_one = 100000;
            const threshold_two = 400000;
            const threshold_three = 676316;
            const first_num_colors = 140;
            const second_num_colors = 30;
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
                        0.85
                    ],
                    'fill-outline-color': 'coral'
                },
            }, 'nys-counties-name-layer');

            map.on('click', 'nys-counties-fill-layer', e => {
                
                
            });

            // reset all events flag value
            wheel_event = false;
            slider_event = false;
        });
    }

    map.addLayer({
        'id': 'nys-counties-line-layer',
        'type': 'line', 
        'source': 'nys-counties',
        'layout': {},
        'paint': {
            'line-color': 'coral',
            'line-width': [
                'case',
                ['boolean', ['feature-state', 'hover'], false], 
                3, 
                1
            ],
            'line-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false], 
                1, 
                0.9
            ],

        },
    });


    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    })
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
        let coordinates = e.lngLat
        let county_name = e.features[0].properties['NAME'];
        let cases_popup = county_year_cases[county_name].toLocaleString();
        let description = `<h1>${county_name}</h1><h3>${cases_popup}</h3>`
        
        popup.setLngLat(coordinates).setHTML(description).addTo(map);
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

        popup.remove();
    });

    map.on("mousemove", 'nys-counties-line-layer', (e) => {
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


    map.on('mouseleave', 'nys-counties-line-layer', () => {
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