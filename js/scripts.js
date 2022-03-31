const slider = document.getElementById('slider');
slider.disabled = true;
const title = document.getElementById('title');
const date = document.getElementById('date');
const div_data_area = document.getElementById("left-data-area");

const total_positive_cases = document.getElementById('total-positive-cases');
const total_fatal_cases = document.getElementById('total-fatal-cases');
const total_hospitalization_cases = document.getElementById('total-hospitalization-cases');
// const total_icu_cases = document.getElementById('total-icu-patients');
// const group_age = document.getElementById('group-age');
const vaccinated = document.getElementById('vaccination-record');

const svg_age_group = d3.select("#patient-age-pie-chart");

mapboxgl.accessToken = 'pk.eyJ1Ijoic3dpdHR1dGgiLCJhIjoiY2t6aGZzcjZ1MDNucjJ1bnlpbGVjMHozNSJ9.wP4jf_xQ5-IDXtzRc2ECpA';
const map = new mapboxgl.Map({
    container: 'map',
    // https://docs.mapbox.com/api/maps/styles/ - for other styles
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-75.744123,42.920355],
    maxBounds: [[-82.313948,39.686186],[-69.174299,45.993265]],
    zoom: 5.9
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

const tints_array = ['#ffffff', '#fffdfd', '#fffcfc', '#fefafa', '#fef9f9', '#fef7f7', 
                     '#fce6e6', '#fce5e5', '#fce3e3', '#fbe2e2', '#fbe0e0', '#fbdede', 
                    '#fbdddd', '#fbdbdb', '#fadada', '#fad8d8', '#fad7d7', '#fad5d5', '#fad4d4', '#f9d2d2', '#f9d1d1', '#f9cfcf', 
                    '#f9cdcd', '#f9cccc', '#f9caca', '#f8c9c9', '#f8c7c7', '#f8c6c6', '#f8c4c4', '#f8c3c3', '#f7c1c1', '#f7bfbf', 
                    '#f7bebe', '#f7bcbc', '#f7bbbb', '#f6b9b9', '#f6b8b8', '#f6b6b6', '#f6b5b5', '#f6b3b3', '#f6b2b2', '#f5b0b0', 
                    '#f5aeae', '#f5adad', '#f5abab', '#f5aaaa', '#f4a8a8', '#f4a7a7', '#f4a5a5', '#f4a4a4', '#f4a2a2', '#f3a0a0', 
                    '#f39f9f', '#f39d9d', '#f39c9c', '#f39a9a', '#f29999', '#f29797', '#f29696', '#f29494', '#f29393', '#f29191', 
                    '#f18f8f', '#f18e8e', '#f18c8c', '#f18b8b', '#f18989', '#f08888', '#f08686', '#f08585', '#f08383', '#f08181', 
                    '#ef8080', '#ef7e7e', '#ef7d7d', '#ef7b7b', '#ef7a7a', '#ee7878', '#ee7777', '#ee7575', '#ee7474', '#ee7272', 
                    '#ee7070', '#ed6f6f', '#ed6d6d', '#ed6c6c', '#ed6a6a', '#ed6969', '#ec6767', '#ec6666', '#ec6464', '#ea6363', 
                    '#e76262', '#e56161', '#e36060', '#e05f5f', '#de5e5e', '#db5d5d', '#d95c5c', '#d75b5b', '#d45a5a', '#d25959', 
                    '#d05858', '#cd5757', '#cb5656', '#c95555', '#c65454', '#c45353', '#c25252', '#bf5151', '#bd5050', '#ba4f4f', 
                    '#b84e4e', '#b64d4d', '#b34c4c', '#b14b4b', '#af4a4a', '#ac4949', '#aa4848', '#a84747', '#a54646', '#a34545', 
                    '#a04444', '#9e4343', '#9c4242', '#994141', '#974040', '#953f3f', '#923e3e', '#903d3d', '#8e3c3c', '#8b3b3b', 
                    '#893a3a', '#873939', '#843838', '#823737', '#7f3636', '#7d3535', '#7b3434', '#783333', '#763232', '#743131', 
                    '#713030', '#6f2f2f', '#6d2e2e', '#6a2d2d', '#682c2c', '#652b2b', '#632a2a', '#612929', '#5e2828', '#5c2727', 
                    '#5a2626', '#572525', '#552424', '#532323', '#502222', '#4e2121', '#4c2020', '#491f1f', '#471e1e', '#441d1d', 
                    '#421c1c', '#401b1b', '#3d1a1a', '#3b1919', '#391818', '#361717', '#341616', '#321515', '#2f1414', '#2d1313', 
                    '#2a1212', '#281111', '#261010', '#230f0f', '#210e0e', '#1f0d0d', '#1c0c0c', '#1a0b0b', '#180a0a'];


// variable to keep track of total positive cases for each county
let county_year_positive_cases = {}


// variables created to render line chart
const date_virus = [];
const total_virus_on_date = [];
const date_fatal = [];
const total_fatal_on_date = [];
const date_hospitalization = [];
const total_hospitalization_on_date = []

// variables created to render stack chart
const date_vaccination = [];
const first_dose_on_date = [];
const second_dose_on_date = [];

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
                date.innerHTML = `~ ${start_date.toLocaleString('default', {month: 'long'})} ${current_day}, ${current_year} ~`;
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

                if (date_virus.length >= 0){
                    date_virus.pop();
                    total_virus_on_date.pop();
                }

                if (date_fatal.length > 0){
                    date_fatal.pop();
                    total_fatal_on_date.pop();
                }

                if (date_hospitalization.length > 0){
                    date_hospitalization.pop();
                    total_hospitalization_on_date.pop();
                }

                if (date_vaccination.length > 0){
                    date_vaccination.pop();
                    first_dose_on_date.pop();
                    second_dose_on_date.pop();
                }
            }
        }
    }, {passive:false});

    // slider.addEventListener('input', event => {
        
    //     slider_event = true;
    //     wheel_event = false;
    //     let start_date = new Date("03/01/2020");
    //     let days_to_add = event.target.value - 1;
    //     start_date.setDate(start_date.getDate() + days_to_add); // added days to date to render map correctly
    //     let current_month = start_date.getMonth() + 1;
    //     let current_day = start_date.getDate();
    //     let current_year = start_date.getFullYear();
    //     date.innerHTML = `Date: ${start_date.toLocaleString('default', {month: 'long'})} ${current_day}, ${current_year}`;

    //     map.removeLayer('nys-counties-fill-layer');
    //     render_positive_map(current_day, current_month, current_year);

    // });

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

                        total_positive_cases.innerHTML = 'Total Positive Cases: ' + total_number_cases.toLocaleString();
                    }
                    else if (slider_event){
                        total_number_cases += total_county_positive;
                        total_positive_cases.innerHTML = 'Total Positive Cases: ' + total_number_cases.toLocaleString();
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

            generate_line_chart(date_virus, total_virus_on_date, '#total-positive-chart', 'purple');

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
                    'fill-outline-color': '#ec6464'
                },
            }, 'nys-counties-name-layer');

            // reset all events flag value
            wheel_event = false;
            slider_event = false;
        });
    }
    // end rendering for TOTAL POSITIVE CASES


    function generate_positive_chart(date_array, cases_array) {
        const data_array = [];

        for (let i = 0; i < date_array.length; i++){
            let new_data = {}
            new_data.rel_date = date_array[i];
            new_data.rel_case = cases_array[i];

            data_array.push(new_data)
        }

        // created date parser for x-axis
        const yAccessor = d => d.rel_case;
        const dateParser = d3.timeParse("%m/%d/%Y");
        const xAccessor = (d) => dateParser(d.rel_date);

        const wrapper = d3.select("#total-positive-chart");
        
        let dimensions = {
            height:  (parseFloat(d3.select("#total-positive-chart").attr('height').replace("%","")) / 100) * div_data_area.clientHeight,
            width: (parseFloat(d3.select("#total-positive-chart").attr('width').replace("%","")) / 100) * div_data_area.clientWidth,
            margin: {
                top: 5,
                right: 5,
                bottom: 5,
                left: 5
            }
        };
        dimensions.bounded_width = dimensions.width - dimensions.margin.left - dimensions.margin.right;
        dimensions.bounded_height = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;
        wrapper.selectAll('g').remove();
        const bounds = wrapper.append('g').style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`);
    
        const yScale = d3.scaleLinear().domain(d3.extent(data_array, yAccessor)).range([dimensions.bounded_height, 0]);
        const xScale = d3.scaleTime().domain(d3.extent(data_array, xAccessor)).range([0, dimensions.bounded_width]);
        
        const lineGenerator = d3.line().x((d) => xScale(xAccessor(d))).y((d)=> yScale(yAccessor(d))).curve(d3.curveBasis);

        const line = bounds.append("path").attr("d", lineGenerator(data_array))
        .attr("fill", "none").attr("stroke", "purple").attr("stroke-width", 2);
        
    }


    //render map for TOTAL FATALITY CASES
    // and call on function to generate fatal chart 
    let county_fatal_cases = {} // NEED TO UPATE AND INCLUDE DATA INTO OBJECT OF COUNTIES AND FATAL CASES
    function extract_fatal_data(chosen_day, chosen_month, chosen_year){
        covid_fatality_data_promise.then(data => {
            county_year_fatal_cases = {};
            let current_total_fatal_cases = 0;

            
            for (let i = 0; i < data.length; i++){
                current_county = data[i]['County'];
                let current_date = data[i]['Report Date'];
                let date = current_date.split('/');
                let month = parseInt(date[0]);
                let day = parseInt(date[1]);
                let year = parseInt(date[2]);
                
                
                if (chosen_year === year && chosen_month === month && chosen_day === day){
                    if (!date_fatal.includes(current_date)){
                        date_fatal.push(current_date);
                    }

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
            if (total_fatal_on_date.length < date_fatal.length){
                total_fatal_on_date.push(current_total_fatal_cases);
            }

            generate_line_chart(date_fatal, total_fatal_on_date, '#total-fatality-chart', 'red');
            total_fatal_cases.innerHTML = `Total Fatal Cases: ${current_total_fatal_cases.toLocaleString()}`;
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
                const current_date = data[i]['As of Date'];
                const date_array = current_date.split('/');
                const month = parseInt(date_array[0]);
                const day = parseInt(date_array[1]);
                const year = parseInt(date_array[2]);

                if (chosen_month === month && chosen_day === day && chosen_year === year){
                    if (!date_hospitalization.includes(current_date)){
                        date_hospitalization.push(current_date);
                    }

                    hospital_cases[data[i]['Facility County']] = data[i]['Patients Currently Hospitalized']; // total hospitalization
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

            if (total_hospitalization_on_date.length < date_hospitalization.length){
                total_hospitalization_on_date.push(hospitalization_cases);
            }

            generate_line_chart(date_hospitalization, total_hospitalization_on_date, '#total-hospitalization-chart', 'aqua');

            total_hospitalization_cases.innerHTML = `Total Hostpitalization: ${hospitalization_cases.toLocaleString()}`;
            //total_icu_cases.innerHTML = `Total Patients in ICU: ${icu_cases.toLocaleString()}`;
            // group_age.innerHTML = `
            // Patients Age 1 to 4 Years: ${patient_1_4.toLocaleString()} <br>
            // Patients Age 5 to 19 Years: ${patient_5_19.toLocaleString()} <br>
            // Patients Age 20 to 44 Years: ${patient_20_44.toLocaleString()} <br>
            // Patients Age 45 to 54 Years: ${patient_45_54.toLocaleString()} <br>
            // Patients Age 55 to 64 Years: ${patient_55_64.toLocaleString()} <br>
            // Patients Age 65 to 74 Years: ${patient_65_74.toLocaleString()} <br>
            // Patients Age 75 to 84 Years: ${patient_75_84.toLocaleString()} <br>
            // Patients Age Greater Than Years: ${patient_over_85.toLocaleString()} <br>`

            // preparing data for the pie-chart
            const age_group_data = [patient_1_4, patient_5_19, patient_20_44, patient_45_54, patient_55_64, patient_65_74, patient_over_85];

            // creating the pie-chart
            // finds the width height because width height is based on percentage: convert to decimal first then multiply by the width of the div box
            let width = (parseFloat(svg_age_group.attr("width")) / 100)  * div_data_area.clientWidth; 
            let height = (parseFloat(svg_age_group.attr("height")) / 100) * div_data_area.clientHeight;
            let radius = Math.min(width, height) / 2;
            svg_age_group.selectAll('g').remove();
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

    function generate_line_chart(date_array, cases_array, elementID, color){
        const data_array = [];

        for (let i = 0; i < date_array.length; i++){
            let new_data = {}
            new_data.rel_date = date_array[i];
            new_data.rel_case = cases_array[i];

            data_array.push(new_data)
        }

        // created date parser for x-axis
        const yAccessor = d => d.rel_case;
        const dateParser = d3.timeParse("%m/%d/%Y");
        const xAccessor = (d) => dateParser(d.rel_date);

        const wrapper = d3.select(elementID);
        
        let dimensions = {
            height:  (parseFloat(d3.select(elementID).attr('height').replace("%","")) / 100) * div_data_area.clientHeight,
            width: (parseFloat(d3.select(elementID).attr('width').replace("%","")) / 100) * div_data_area.clientWidth,
            margin: {
                top: 5,
                right: 5,
                bottom: 5,
                left: 5
            }
        };
        dimensions.bounded_width = dimensions.width - dimensions.margin.left - dimensions.margin.right;
        dimensions.bounded_height = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;
        wrapper.selectAll('g').remove();
        const bounds = wrapper.append('g').style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`);
    
        const yScale = d3.scaleLinear().domain(d3.extent(data_array, yAccessor)).range([dimensions.bounded_height, 0]);
        const xScale = d3.scaleTime().domain(d3.extent(data_array, xAccessor)).range([0, dimensions.bounded_width]);
        
        const lineGenerator = d3.line().x((d) => xScale(xAccessor(d))).y((d)=> yScale(yAccessor(d))).curve(d3.curveBasis);

        const line = bounds.append("path").attr("d", lineGenerator(data_array))
        .attr("fill", "none").attr("stroke", color).attr("stroke-width", 2);
    }

    const county_first_dose = {}
    const county_full_dose = {}
    function extract_vaccination_data (chosen_month, chosen_day, chosen_year) {
        covid_vaccination_data_promise.then(data => {
            let first_dose = 0;
            let full_dose = 0;

            for (let i = 0; i < data.length; i++){
                const current_date = data[i]["Report as of"];
                const date_array = current_date.split('/');
                const month = parseInt(date_array[0]);
                const day = parseInt(date_array[1]);
                const year = parseInt(date_array[2]);

                // get total of vaccination record by calculating when day is passed  
                if (chosen_month === month && chosen_day === day && chosen_year === year){
                    if (!date_vaccination.includes(current_date)){
                        date_vaccination.push(current_date);
                    }
                    county_first_dose[data[i]["County"]] = data[i]["First Dose"];
                    county_full_dose[data[i]["County"]] = data[i]["Series Complete"];
                    first_dose += data[i]["First Dose"];
                    full_dose += data[i]["Series Complete"];
                }
            }

            if (first_dose_on_date.length < date_vaccination.length && second_dose_on_date.length < date_vaccination.length){
                first_dose_on_date.push(first_dose);
                second_dose_on_date.push(full_dose);
            }

            generate_line_chart(date_vaccination, first_dose_on_date, '#vaccination-line-chart', 'green');

            //generate_stack_chart_vaccination(date_vaccination, first_dose_on_date, second_dose_on_date, '#vaccination-stacked-chart');

            vaccinated.innerHTML = `Total Vaccinated: ${first_dose.toLocaleString()}`;

        });
    }

    // FIX TO WORK WITH STACK CHART
    // function generate_stack_chart_vaccination(date_array, data_array1, data_array2, elementID){
    //     const data_array = [];
    //     // data preparation
    //     for (let i = 0; i < date_array.length; i++){
    //         const new_data = {};
    //         new_data.rel_date = date_array[i];
    //         new_data.first_dose = data_array1[i];
    //         new_data.second_dose = data_array2[i];

    //         data_array.push(new_data);
    //     }

    //     const stack = d3.stack().keys(['first_dose', 'second_dose']);
    //     const stackedValues = stack(data_array);


    //     let stackedData = [];
    //     stackedValues.forEach(layer => {
    //         const currentStack = [];
    //         layer.forEach((d, i) => {
    //             currentStack.push({
    //                 values: d,
    //                 year: data_array[i].rel_date
    //             })
    //         });

    //         stackedData = stackedData.concat(currentStack);
    //     });

    //     //console.log(stackedData);
        
    //     const color = ['lightgreen', 'lightblue'];
    //     const wrapper = d3.select(elementID);
    //     const stroke_width = 2;
        
    //     let dimensions = {
    //         height:  (parseFloat(d3.select(elementID).attr('height').replace("%","")) / 100) * div_data_area.clientHeight,
    //         width: (parseFloat(d3.select(elementID).attr('width').replace("%","")) / 100) * div_data_area.clientWidth,
    //         margin: {
    //             top: 5,
    //             right: 5,
    //             bottom: 5,
    //             left: 5
    //         }
    //     };
    //     dimensions.bounded_width = dimensions.width - dimensions.margin.left - dimensions.margin.right;
    //     dimensions.bounded_height = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    //     // displaying stacked chart data 
    //     wrapper.selectAll('g').remove();
    //     const chart = wrapper.append('g').attr("transform", `translate(${dimensions.margin.left}, 0)`);
    //     const grp = chart
    //     .append("g")
    //     .attr("transform", `translate(-${dimensions.margin.left - stroke_width},-${dimensions.margin.top})`);

        
    //     const dateParser = d3.timeParse("%m/%d/%Y");
    //     const xAccessor = (d) => dateParser(d.rel_date);

    //     // Create scales
    //     const yScale = d3
    //     .scaleLinear()
    //     .domain([0, d3.max(stackedValues[stackedValues.length - 1], dp => dp[1])])
    //     .range([dimensions.bounded_height, 0]);

    //     const xScale = d3
    //     .scaleTime()
    //     .domain(d3.extent(data_array, xAccessor))
    //     .range([0, dimensions.bounded_width]);

    //     // defining the function to create area of stacked chart
    //     const area = d3
    //     .area()
    //     .x(dataPoint => xScale(dataPoint.year))
    //     .y0(dataPoint => yScale(dataPoint.values[0]))
    //     .y1(dataPoint => yScale(dataPoint.values[1]));


    //     const series = grp
    //     .data(stackedData)
    //     .enter()
    //     .append("g");

    //     series
    //     .append("path")
    //     .attr("d", d => area(d))
    //     .attr("transform", `translate(${dimensions.margin.left},0)`)
    //     .style("fill", (d, i) => color[i])
    //     .attr("stroke", "steelblue")
    //     .attr("stroke-linejoin", "round")
    //     .attr("stroke-linecap", "round")
    //     .attr("stroke-width", stroke_width);

        

    //     //Add the X Axis
    //     chart
    //     .append("g")
    //     .attr("transform", `translate(0,${dimensions.bounded_height})`)
    //     .call(d3.axisBottom(xScale).ticks(data_array.length));

    //     // Add the Y Axis
    //     chart
    //     .append("g")
    //     .attr("transform", `translate(0, 0)`)
    //     .call(d3.axisLeft(yScale));
    // }

    map.addLayer({
        'id': 'nys-counties-line-layer',
        'type': 'line', 
        'source': 'nys-counties',
        'layout': {},
        'paint': {
            'line-color': '#ec6464',
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


/* Display pop up for the about section */
const about_modal_trigger = document.getElementById('about-pop-up');
const modal = document.getElementById("myModal");
const span = document.getElementsByClassName("close")[0];

about_modal_trigger.addEventListener('click', () => {
    modal.style.display = 'block';
});

span.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});