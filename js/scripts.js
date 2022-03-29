const slider = document.getElementById('slider');
const title = document.getElementById('title');
const date = document.getElementById('date');
const div_data_area = document.getElementById("data-area");

const total_positive_cases = document.getElementById('total-positive-cases');

const total_fatal_cases = document.getElementById('total-fatal-cases');

const total_hospitalization_cases = document.getElementById('total-hospitalization-cases');
const total_icu_cases = document.getElementById('total-icu-patients');
const group_age = document.getElementById('group-age');
const vaccinated = document.getElementById('vaccination-record');

const svg_age_group = d3.select("#patient-age-pie-chart");

mapboxgl.accessToken = 'pk.eyJ1Ijoic3dpdHR1dGgiLCJhIjoiY2t6aGZzcjZ1MDNucjJ1bnlpbGVjMHozNSJ9.wP4jf_xQ5-IDXtzRc2ECpA';
const map = new mapboxgl.Map({
    container: 'map',
    // https://docs.mapbox.com/api/maps/styles/ - for other styles
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-75.796266,43.425341],
    maxBounds: [[-82.712159,40.170840],[-68.880372,46.513840]],
    zoom: 5.7
});
map.scrollZoom.disable();

let hoveredStateId = null;

// promise that contains data on covid
const covid_positive_data_promise = fetch("./data_files/nys_covid_positive_data_adjusted.json").then(e => e.json());
const covid_fatality_data_promise = fetch("./data_files/nys_covid_fatal_data_adjusted.json").then(e => e.json());
const covid_hospitalization_data_promise = fetch("./data_files/nys_hospitalization_age_group_by_county_adjusted_v2.json").then(e => e.json());
const covid_vaccination_data_promise = fetch("./data_files/nys_county_vaccination_record.json").then(e => e.json());

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


// render map for TOTAL POSITIVE CASES
let county_year_positive_cases = {}
const date_virus = [];
const total_virus_on_date = [];

map.on('load', () => {
    map.addSource('nys-counties', {
        type: "geojson",
        data: "./data_files/nys_counties_id.geojson"
    });

    // render initial map
    render_positive_map(1, 3, 2020);
    
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
            // scroll up the date
            if (slider.value <= 711){
                slider.value = (parseInt(slider.value) + 1).toString();
                start_date.setDate(start_date.getDate() + parseInt(slider.value)); // added days to date to render map correctly
                let current_month = start_date.getMonth() + 1;
                let current_day = start_date.getDate();
                let current_year = start_date.getFullYear();
                date.innerHTML = `Date: ${start_date.toLocaleString('default', {month: 'long'})} ${current_day}, ${current_year}`;
                map.removeLayer('nys-counties-fill-layer');
                render_positive_map(current_day, current_month, current_year);
                increase = true;
            }
        }
        else {
            // scroll down
            if (slider.value >= 0){
                slider.value -= 1;
                start_date.setDate(start_date.getDate() + parseInt(slider.value)); // added days to date to render map correctly
                let current_month = start_date.getMonth() + 1;
                let current_day = start_date.getDate();
                let current_year = start_date.getFullYear();
                date.innerHTML = `Date: ${start_date.toLocaleString('default', {month: 'long'})} ${current_day}, ${current_year}`;

                map.removeLayer('nys-counties-fill-layer');
                render_positive_map(current_day, current_month, current_year);
                increase = false;

                if (date_virus.length > 0){
                        date_virus.pop();
                        total_virus_on_date.pop();
                }
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
        render_positive_map(current_day, current_month, current_year);

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

    // render map on that particular day, month and year 
    function render_positive_map(chosen_day, chosen_month, chosen_year) {
        covid_positive_data_promise.then(data => { // array of of objects with time 
            county_year_positive_cases = {};
    
            let current_county = '';
            let last_county = data[0]['County'];

            // reset value everytime a data changes 
            if (slider_event){
                total_number_cases = 0;
            }

            for (let i = 0; i < data.length; i++){
                let current_date = data[i]["Test Date"].split(' ')[0]; // get date to display in line chart
                let string_date = current_date.split('/');
                let month = parseInt(string_date[0]);
                let day = parseInt(string_date[1]);
                let year = parseInt(string_date[2]);
                let total_county_positive = 0;
                

                if (month === chosen_month && day === chosen_day && year === chosen_year){
                    if (!date_virus.includes(current_date)){
                        date_virus.push(current_date);
                    }

                    current_county = data[i]['County'];
                    
                    if (current_county !== last_county){ // detect for total cumulative cases for another county to register 
                        county_year_positive_cases[last_county] = total_county_positive;
                        total_county_positive = 0;
                    };
                    total_county_positive += data[i]["Cumulative Number of Positives"];
                    if (wheel_event){
                        if (increase){
                            total_number_cases += data[i]["New Positives"];
                        }
                        else{
                            total_number_cases -= data[i + 1]["New Positives"];
                        }

                        total_positive_cases.innerHTML = 'Cumulative Positive Cases: ' + total_number_cases.toLocaleString();
                    }
                    else if (slider_event){
                        total_number_cases += total_county_positive;
                        total_positive_cases.innerHTML = 'Cumulative Positive Cases: ' + total_number_cases.toLocaleString();
                    };

                }
                else {
                    continue;
                }
                county_year_positive_cases[current_county] = total_county_positive; // to account for the last county: Yates
            }
            // to avoid adding points when the dates don't exist 
            if (total_virus_on_date.length < date_virus.length){
                total_virus_on_date.push(total_number_cases);
            }

            generate_positive_chart(date_virus, total_virus_on_date);

            extract_fatal_data(chosen_day, chosen_month, chosen_year);
            extract_hospitalization_data(chosen_month, chosen_day, chosen_year);
            extract_vaccination_data(chosen_month, chosen_day, chosen_year);
    
            // most dense - concetrated range for TOTAL POSITIVE CASES of virus is around 100,000 (use 150 colors for this)
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
            for (const key in county_year_positive_cases){
                
                let color;
                let cases = county_year_positive_cases[key];

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

            // need to add interaction when an area is clicked on
            map.on('click', 'nys-counties-fill-layer', e => {
                
                
            });

            // reset all events flag value
            wheel_event = false;
            slider_event = false;
        });
    }
    // end rendering for TOTAL POSITIVE CASES


    function generate_positive_chart(date_array, cases_array) {
        // range is the output range to output the map

        let svg = d3.select("#total-positive-chart").append("svg").attr("width", 200).attr("height", 200).attr("padding", 20);

        //let width = (parseFloat(svg_total_positive_cases.attr("width")) / 100)  * div_data_area.clientWidth; 
        let scale = d3.scaleLinear().domain([d3.min(date_array), d3.max(date_array)]).range([0, 200]);
        let x_axis = d3.axisBottom().scale(scale);

        svg.append("g").call(x_axis);
    }

    //render map for TOTAL FATALITY CASES
    let county_fatal_cases = {} // NEED TO UPATE AND INCLUDE DATA INTO OBJECT OF COUNTIES AND FATAL CASES
    function extract_fatal_data(chosen_day, chosen_month, chosen_year){
        covid_fatality_data_promise.then(data => {
            county_year_fatal_cases = {};
            let current_total_fatal_cases = 0;

            
            for (let i = 0; i < data.length; i++){
                current_county = data[i]['County'];
                let date = data[i]['Report Date'].split('/');
                let month = parseInt(date[0]);
                let day = parseInt(date[1]);
                let year = parseInt(date[2]);
                
                
                if (chosen_year === year && chosen_month === month && chosen_day === day){

                    county_fatal_cases[current_county] = data[i]['Place of Fatality'];

                    // to account for an error on the data of April 15th, 2020 where the number of cases doubled more than it should have 
                    if (chosen_year === 2020 && chosen_day === 15 && chosen_month === 4 && data[i]['County'] === 'Statewide Total'){
                        current_total_fatal_cases = data[i]['Place of Fatality'];
                        break;
                    }
                    else{
                        if (data[i]['County'] !== 'Statewide Total'){
                            current_total_fatal_cases += data[i]['Place of Fatality'];
                        }

                    }
                }
            }

            

            total_fatal_cases.innerHTML = `Total Fatality: ${current_total_fatal_cases.toLocaleString()}`;
        });
    }
    // end of extract data for fatal-cases on map

    
    // start to extract data for hospitalization rate
    const hospital_cases = {}
    function extract_hospitalization_data(chosen_month, chosen_day, chosen_year) {
        covid_hospitalization_data_promise.then(data => {
            let hospitalization_cases = 0;
            let icu_cases = 0;
            let patient_1_4 = 0;
            let patient_5_19 = 0;
            let patient_20_44 = 0;
            let patient_45_54 = 0;
            let patient_55_64 = 0;
            let patient_65_74 = 0;
            let patient_75_84 = 0;
            let patient_over_85 = 0;

            for (let i = 0; i < data.length; i++){
                const date_array = data[i]['As of Date'].split('/');
                const month = parseInt(date_array[0]);
                const day = parseInt(date_array[1]);
                const year = parseInt(date_array[2]);

                if (chosen_month === month && chosen_day === day && chosen_year === year){
                    hospital_cases[data[i]['Facility County']] = data[i]['Patients Currently Hospitalized'];
                    hospitalization_cases += data[i]['Patients Currently Hospitalized'];
                    icu_cases += data[i]["Patients Currently in ICU"];
                    patient_1_4 += data[i]["Patients Age Less Than 1 Year"];
                    patient_5_19 += data[i]["Patients Age 1 To 4 Years"];
                    patient_20_44 += data[i]["Patients Age 5 to 19 Years"];
                    patient_45_54 += data[i]["Patients Age 45 to 54 Years"];
                    patient_55_64 += data[i]["Patients Age 55 to 64 Years"];
                    patient_65_74 += data[i]["Patients Age 65 to 74 Years"];
                    patient_75_84 += data[i]["Patients Age 75 to 84 Years"];
                    patient_over_85 += data[i]["Patients Age Greater Than 85 Years"];
                }

                // fix error in data since there are strings instead of number
            }

            total_hospitalization_cases.innerHTML = `Total Hostpitalization: ${hospitalization_cases.toLocaleString()}`;
            total_icu_cases.innerHTML = `Total Patients in ICU: ${icu_cases.toLocaleString()}`;
            group_age.innerHTML = `
            Patients Age 1 to 4 Years: ${patient_1_4.toLocaleString()} <br>
            Patients Age 5 to 19 Years: ${patient_5_19.toLocaleString()} <br>
            Patients Age 20 to 44 Years: ${patient_20_44.toLocaleString()} <br>
            Patients Age 45 to 54 Years: ${patient_45_54.toLocaleString()} <br>
            Patients Age 55 to 64 Years: ${patient_55_64.toLocaleString()} <br>
            Patients Age 65 to 74 Years: ${patient_65_74.toLocaleString()} <br>
            Patients Age 75 to 84 Years: ${patient_75_84.toLocaleString()} <br>
            Patients Age Greater Than Years: ${patient_over_85.toLocaleString()} <br>`

            // preparing data for the pie-chart
            const age_group_data = [patient_1_4, patient_5_19, patient_20_44, patient_45_54, patient_55_64, patient_65_74, patient_over_85];

            // creating the pie-chart
            // finds the width height because width height is based on percentage: convert to decimal first then multiply by the width of the div box
            let width = (parseFloat(svg_age_group.attr("width")) / 100)  * div_data_area.clientWidth; 
            let height = (parseFloat(svg_age_group.attr("height")) / 100) * div_data_area.clientHeight;
            let radius = Math.min(width, height) / 2;
            let g = svg_age_group.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
            let color = d3.scaleOrdinal(['#5C4B51','#8CBEB2','#F2EBBF','#F3B562','#F06060', '#F26601', '#66CBDF', '#886F61']);
            let pie = d3.pie();

            let arc = d3.arc().innerRadius(0).outerRadius(radius); 
            let arcs = g.selectAll("arc").data(pie(age_group_data)).enter().append("g").attr("class", "arc");
            arcs.append("path").attr("fill", function(d, i){
                return color(i);
            }).attr("d", arc);
        });
    }

    const county_first_dose = {}
    const county_full_dose = {}
    function extract_vaccination_data (chosen_month, chosen_day, chosen_year) {
        covid_vaccination_data_promise.then(data => {
            let first_dose = 0;
            let full_dose = 0;

            for (let i = 0; i < data.length; i++){
                const date_array = data[i]["Report as of"].split('/');
                const month = parseInt(date_array[0]);
                const day = parseInt(date_array[1]);
                const year = parseInt(date_array[2]);

                // get total of vaccination record by calculating when day is passed  
                if (chosen_month === month && chosen_day === day && chosen_year === year){
                    county_first_dose[data[i]["County"]] = data[i]["First Dose"];
                    county_full_dose[data[i]["County"]] = data[i]["Series Complete"];
                    first_dose += data[i]["First Dose"];
                    full_dose += data[i]["Series Complete"];
                }

            }

            vaccinated.innerHTML = `First Dose Received: ${first_dose.toLocaleString()} <br>
                    Full Dose Received: ${full_dose.toLocaleString()}`;


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

        // total positive cases
        let coordinates = e.lngLat
        let county_name = e.features[0].properties['NAME'];
        let cases_popup = county_year_positive_cases[county_name].toLocaleString();
        let fatal_popup;
        let first_dose_popup;
        let full_dose_popup;
        try{
            fatal_popup = county_fatal_cases[county_name].toLocaleString();
        }
        catch (e){
            fatal_popup = 0;
        }
        let hospitalize_popup;
        try{
            // need to adjust the name for New York in json file for hospitalization cases 
            hospitalize_popup = hospital_cases[county_name].toLocaleString();
        }
        catch (e){
            hospitalize_popup = 0;
        }
        try {
            first_dose_popup = county_first_dose[county_name].toLocaleString();
            full_dose_popup = county_full_dose[county_name].toLocaleString();
        }
        catch (e){
            first_dose_popup = 0;
            full_dose_popup = 0;
        }

        let description = `<h1>${county_name}</h1>
        <h3>Total Cases: ${cases_popup}</h3><br>
        <h3>Total Hospitalization: ${hospitalize_popup}</h3><br>
        <h3>Total Fatality: ${fatal_popup}</h3><br>
        <h3>Total First Dose: ${first_dose_popup}</h3><br>
        <h3>Total Full Dose: ${full_dose_popup}</h3>`

        
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

// ADD VACCINATION DATA INTO THE MAP
// DOUBLE CHECK DATA AGAIN BECAUSE HOSPITALIZATION AND FATALITY CASES ALREADY BEGIN ON MARCH 2ND AND 3RD OF 2020 

// AFTER ADDING VACINATION DATA SHOULD WORK ON INCOPORATING D3.js into the map to display data