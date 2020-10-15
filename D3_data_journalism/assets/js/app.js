var svgWidth = 690;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 40
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("assets/data/data.csv").then(healthData => {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    healthData.forEach(data => {
      data.obesity = +data.obesity;
      data.poverty = +data.poverty;
    });

    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear()
      .domain([20, d3.max(healthData, d => d.obesity)])
      .range([0, width])
      .nice();

    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(healthData, d => d.poverty)])
      .range([height, 0])
      .nice();

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .join("circle")
    .attr("cx", d => xLinearScale(d.obesity))
    .attr("cy", d => yLinearScale(d.poverty))
    .attr("r", "15")
    .attr("class", "stateCircle")
    .attr("opacity", 0.5)
    .attr("stroke-width", 1);

    //Add text to circles
    circlesGroup.append("g")
      .selectAll("text")
      .data(healthData)
      .join("text")
      .append("text")
      .attr("x", d => xLinearScale(d.obesity))
      .attr("y", d => yLinearScale(d.poverty))
      .attr("class", "stateText")
      .style("font-weight", "bold")
      .attr("font-size", "10px")
      .attr("font-color", "blue")
      .text(d => d.abbr);
      
    // Step 6: Initialize tool tip
    // ==============================
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(d => `${d.state}<br>Obesity: ${d.obesity}<br>Poverty: ${d.poverty}`);

    // Step 7: Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup.on("click", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data) {
        toolTip.hide(data);
      });

    // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "aText")
      .text("Poverty");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "aText")
      .text("Obesity");

  }).catch(error => console.log(error));
