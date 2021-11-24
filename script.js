let url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
let req = new XMLHttpRequest();

let baseTemp
let values = [];

let minYear
let maxYear

let xScale
let yScale

let xAxis
let yAxis

const width = 1200;
const height = 600;
const padding = 60;

const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"]

let svg = d3.select('svg');
let tooltip = d3.select('#tooltip');

let generateScales = () => {

    minYear = d3.min(values, (item) => {
        return item['year']
    })
    maxYear = d3.max(values, (item) => {
        return item['year']
    })
    

    xScale = d3.scaleLinear()
                .domain([minYear, maxYear + 1])
                .range([padding, width - padding]);

    yScale = d3.scaleTime()
                .domain([new Date(0,0,0,0, 0, 0, 0), new Date(0,12,0,0,0,0,0)])
                .range([padding, height - padding]);

};

let drawCanvas = () => {
    svg.attr('width', width);
    svg.attr('height', height);
};

let drawCells = () => {

    let yearCount = maxYear - minYear;

    svg.selectAll('rect')
        .data(values)
        .enter()
        .append('rect')
        .attr('class','cell')
        .attr('fill', (item) => {
            let variance = item['variance'];
            if(variance <= -1){
                return '#00b0ff';
            }else if(variance <= 0){
                return '#80d8ff';
            }else if(variance <= 1){
                return '#ffd180';
            }else{
                return '#ff6d00';
            }
        })
        .attr('data-year', (item) => {
            return item["year"];
        })
        .attr('data-month', (item) => {
            return item["month"] - 1;
        })
        .attr('data-temp', (item) => {
            return baseTemp + item["variance"];
        })
        .attr('height', (item)=> {
            return (height - (2 * padding)) / 12
        })
        .attr('y', (item) => {
            return yScale(new Date(0, item['month']-1, 0, 0, 0, 0, 0))
        })
        .attr('width', (item) => {
            return (width - (2 * padding)) / yearCount;
        })
        .attr("x", item => xScale(item["year"]))
        .on('mouseover', (item) => {
            tooltip.attr('data-year', item['year']);

            tooltip.transition()
                .style('visibility', 'visible');

            tooltip.text(item['year'] + ' ' + monthNames[item['month'] -1 ] + ' : ' + item['variance']);
        })
        .on('mouseout', (item) => {
            tooltip.transition()
                .style('visibility', 'hidden')
        })
        
};

let generateAxes = () => {

    xAxis = d3.axisBottom(xScale)
                .tickFormat(d3.format('d'));

    svg.append('g')
        .call(xAxis)
        .attr('id','x-axis')
        .attr('transform', 'translate(0, ' + (height-padding) + ')');

    yAxis = d3.axisLeft(yScale)
                .tickFormat(d3.timeFormat('%B'));

	svg.append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', 'translate(' + padding + ', 0)');
    
};

req.open('GET', url, true);
req.onload = () => {
    let data = JSON.parse(req.responseText);
    baseTemp = data.baseTemperature;
    values = data.monthlyVariance;
    drawCanvas();
    generateScales();
    drawCells();
    generateAxes();
}
req.send();