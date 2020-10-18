var svgWidth = 690;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 60
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


//*****************************

  // Initial Params
var chosenXAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width])
    .nice();

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderText(circlesText, newXScale, chosenXAxis) {

  circlesText.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));

  return circlesText;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "obesity") {
    label = "Obesity:";
  }
  else {
    label = "Smokes:";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([70, -50])
    .html(d => `${d.state}<br>${label} ${d[chosenXAxis]}`);

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Import Data
d3.csv("assets/data/data.csv").then(healthData => {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    healthData.forEach(data => {
      data.obesity = +data.obesity;
      data.poverty = +data.poverty;
      data.smokes = +data.smokes
    });

    // xLinearScale function above csv import
  var xLinearScale = xScale(healthData, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(healthData, d => d.poverty) *1.2])
    .range([height, 0])
    .nice();

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .join("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.poverty))
    .attr("r", 10)
    .attr("class", "stateCircle")
    .attr("opacity", .8);

  //   // append initial circles
  //   var circlesGroup = chartGroup.append("g")
  //   .selectAll("circle")
  //   .data(healthData)
  //   .join("circle")
  //   .attr("cx", d => xLinearScale(d[chosenXAxis]))
  //   .attr("cy", d => yLinearScale(d.poverty))
  //   .attr("r", 10)
  //   .attr("class", "stateCircle")
  //   .attr("opacity", .5);

    
  console.log(chosenXAxis);

  //   // // //Add text to circles
  //   var circlesText = chartGroup.append("g")
  //   .selectAll("text")
  //   .data(healthData)
  //   .join("text")
  //   .attr("x", d => xLinearScale(d[chosenXAxis]))
  //   .attr("y", d => yLinearScale(d.poverty))
  //   .attr("dy", 3)
  //   .attr("class", "stateText")
  //   .attr("font-size", "10px")
  //   .text(d => d.abbr)
  //   .attr("alignment-baseline", "middle");

      // // //Add text to circles
  var circlesText = circlesGroup.select("circle")
    .data(healthData)
    .join("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d.poverty))
    .attr("class", "stateText")
    .attr("font-size", "10px")
    .text(d => d.abbr)
    .attr("alignment-baseline", "middle");

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var obesityLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .attr("class", "aText")
    .text("Obesity (%)");

  var smokesLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .attr("class", "aText")
    .text("Smokes (%)");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("aText", true)
    .text("Poverty");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);


  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        circlesText = renderText(circlesText, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "smokes") {
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

}).catch(error => console.log(error));


