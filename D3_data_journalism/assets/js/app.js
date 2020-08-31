// SVG wrapper dimensions are determined by the current width and height of the browser window.
// ============================================================================================
var svgWidth = 800;
var svgHeight = 600;

var margin = {
	top: 20,
	right: 40,
	bottom: 80,
	left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins
// ==================================================================================================================
// make wrapper
var svg = d3
	.select("#scatter")
	.append("svg")
	.attr("width", svgWidth)
	.attr("height", svgHeight);

// append an SVG group
var chartGroup = svg.append("g")
	.attr("transform", `translate(${margin.left}, ${margin.top})`);

// initial Params
var chosenXAxis = "healthcare";
var chosenYAxis = "poverty";

// add chart title
var chartTitle = svg.append("text")
	.attr("x", width - 200)             
	.attr("y", margin.top - 5)
	.attr("text-anchor", "middle")  
	.style("font-size", 5)
	.style("stroke-width", 2)
	.text("Selected Health Risks Facing Particular Demographics");

// Make function used for updating x-scale & y-scale var upon click on axis label
// =========================================================================
function xScale(timesData, chosenXAxis) {
	var xLinearScale = d3.scaleLinear()
		.domain([d3.min(timesData, d => d[chosenXAxis]) * 0.8,
		d3.max(timesData, d => d[chosenXAxis]) * 1.2
		])
		.range([0, width]);

	return xLinearScale;
}

function yScale(timesData, chosenYAxis) {
	var yLinearScale = d3.scaleLinear()
		.domain([d3.min(timesData, d => d[chosenYAxis]) * 0.8,
		d3.max(timesData, d => d[chosenYAxis]) * 1.1
		])
		.range([height, 0]);

	return yLinearScale;
}

// Make function used for updating x & y axes upon click on axis label
// =============================================================
function renderAxesX(newXScale, xAxis) {
	var bottomAxis = d3.axisBottom(newXScale);

	xAxis.transition()
		.duration(1000)
		.call(bottomAxis);

	return xAxis;
}

function renderAxesY(newYScale, yAxis) {
	var leftAxis = d3.axisLeft(newYScale);

	yAxis.transition()
		.duration(1000)
		.call(leftAxis);

	return yAxis;
}

// Make function used for updating circles group with a transition to new circles
// =========================================================================
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

	circlesGroup.transition()
		.duration(1000)
		.attr("cx", d => newXScale(d[chosenXAxis]))
		.attr("cy", d => newYScale(d[chosenYAxis]));

	return circlesGroup;
}

// Make function used for updating name group with a transition to new circles
// =========================================================================
function renderName(nameGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

	nameGroup.transition()
		.duration(1000)
		.attr("x", d => newXScale(d[chosenXAxis]))
		.attr("y", d => newYScale(d[chosenYAxis]));

	return nameGroup;
}

// Make function used for updating circles group with new tooltip
// =========================================================
function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis) {

	// x labels
	var xlabel;
	if (chosenXAxis === "poverty") {
		xlabel = "In Poverty(%)";
	}
	else if (chosenXAxis === "age") {
		xlabel = "Age (Median)";
	}
	else {
		xlabel = "Household Income";
	}

	// y labels
	var ylabel;
	if (chosenYAxis === "obesity") {
		ylabel = "Obesity(%)";
	}
	else if (chosenYAxis === "smokes") {
		ylabel = "Smokes(%)";
	}
	else {
		ylabel = "Healthcare";
	}

	// add tooltip
	var toolTip = d3.tip()
		.attr("class", "d3-tip")
		.offset([80, -60])
		.html(function (d) {
			// return d.abbr;
			return (`<strong>State: ${d.abbr}</strong><br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}`);
		});

	circlesGroup.call(toolTip);

	circlesGroup.on("mouseover", function (data) {
		toolTip.show(data);
	})
		// onmouseout event
		.on("mouseout", function (data, index) {
			toolTip.hide(data);
		});

	return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
// ============================================================
d3.csv("assets/data/data.csv").then(function (timesData, err) {
	if (err) throw err;
	console.log(timesData)

	// parse data
	timesData.forEach(function (data) {
		data.poverty = +data.poverty;
		data.age = +data.age;
		data.income = +data.income;
		data.obesity = +data.obesity;
		data.smokes = +data.smokes;
		data.healthcare = +data.healthcare;
	});

	// xLinearScale function above csv import. UNCOMMNET IF NEEDED!!!
	var xLinearScale = xScale(timesData, chosenXAxis);
	var yLinearScale = yScale(timesData, chosenYAxis);
	
	// Create initial axis functions
	var bottomAxis = d3.axisBottom(xLinearScale);
	var leftAxis = d3.axisLeft(yLinearScale);

	// append x axis
	var xAxis = chartGroup.append("g")
		.classed("x-axis", true)
		.attr("transform", `translate(0, ${height})`)
		.call(bottomAxis);

	// append y axis
	var yAxis = chartGroup.append("g")
		.classed("y-axis", true)
		// .attr("transform", `translate(0, ${height})`)
		.call(leftAxis);

	// append circles
	var circlesGroup = chartGroup.selectAll("circle")
		.data(timesData)
		.enter()
		.append("circle")
		.attr("cx", d => xLinearScale(d[chosenXAxis]))
		.attr("cy", d => yLinearScale(d[chosenYAxis]))
		.attr("r", 18)
		.attr("fill", "blue")
		.attr("opacity", ".4");

	// append text to circles
	var textGroup = chartGroup.selectAll("#circleText")
		.data(timesData)
		.enter()
		.append("text")
		.text(d => d.abbr)
		.attr("id", "circleText")
		.attr("x", d => xLinearScale(d[chosenXAxis]))
		.attr("y", d => yLinearScale(d[chosenYAxis]))
		.attr("text-anchor","middle")
		.attr("stroke-width", 1)
		.attr("fill", "white")
		.attr("font-size", 12);

	// Create group for three x-axis labels
	// =====================================
	var xlabelsGroup = chartGroup.append("g")
		.attr("transform", `translate(${width / 2}, ${height + 20})`);

	var povertyLabel = xlabelsGroup.append("text")
		.attr("x", 0)
		.attr("y", 20)
		.attr("value", "poverty") // value to grab for event listener
		.classed("active", true)
		.text("In Poverty(%)");

	var ageLabel = xlabelsGroup.append("text")
		.attr("x", 0)
		.attr("y", 40)
		.attr("value", "age") // value to grab for event listener
		.classed("inactive", true)
		.text("Age (Median)");

	var incomeLabel = xlabelsGroup.append("text")
		.attr("x", 0)
		.attr("y", 60)
		.attr("value", "income") // value to grab for event listener
		.classed("inactive", true)
		.text("Household Income");

	// Create group for three y-axis labels
	// ====================================
	var ylabelsGroup = chartGroup.append("g")
		.attr("transform", `translate(${0 - margin.left / 4.5}, ${height / 2})`);

	var obesityLabel = ylabelsGroup.append("text")
		.attr("x", 0)
		.attr("y", 0 - 20)
		.attr("value", "obesity") // value to grab for event listener
		.attr("transform", "rotate(-90)")
		.classed("active", true)
		.text("Obesity(%)");

	var smokeLabel = ylabelsGroup.append("text")
		.attr("x", 0)
		.attr("y", 0 - 40)
		.attr("value", "smokes") // value to grab for event listener
		.attr("transform", "rotate(-90)")
		.classed("inactive", true)
		.text("Smokes(%)");

	var healthcareLabel = ylabelsGroup.append("text")
		.attr("x", 0)
		.attr("y", 0 - 60)
		.attr("value", "healthcare") // value to grab for event listener
		.attr("transform", "rotate(-90)")
		.classed("inactive", true)
		.text("Healthcare");

	// updateToolTip function above csv import
	var circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

	// x axis labels event listener
	// ============================
	xlabelsGroup.selectAll("text")
		.on("click", function () {
			// get value of selection and create action when value isn't chosenXAxis
			var value = d3.select(this).attr("value");
			if (value !== chosenXAxis) {

				// replaces chosenXAxis with value, check that it went through
				chosenXAxis = value;
				console.log(chosenXAxis);

				// functions here found above csv import
				// updates x scale for new data
				xLinearScale = xScale(timesData, chosenXAxis);

				// updates x axis with transition
				xAxis = renderAxesX(xLinearScale, xAxis);

				// updates circles with new x values
				circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

				textGroup = renderName(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

				// updates tooltips with new info
				circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

				// changes classes to change bold text
				if (chosenXAxis === "poverty") {
					povertyLabel
						.classed("active", true)
						.classed("inactive", false);
					ageLabel
						.classed("active", false)
						.classed("inactive", true);
					incomeLabel
						.classed("active", false)
						.classed("inactive", true);
				}
				else if (chosenXAxis === "age") {
					povertyLabel
						.classed("active", false)
						.classed("inactive", true);
					ageLabel
						.classed("active", true)
						.classed("inactive", false);
					incomeLabel
						.classed("active", false)
						.classed("inactive", true);
				}
				else {
					povertyLabel
						.classed("active", false)
						.classed("inactive", true);
					ageLabel
						.classed("active", false)
						.classed("inactive", true);
					incomeLabel
						.classed("active", true)
						.classed("inactive", false);
				}
			}
		});

	// yaxis labels event listener
	// ===========================
	ylabelsGroup.selectAll("text")
		.on("click", function () {
			// get value of selection and create action when value isn't chosenYAxis
			var value = d3.select(this).attr("value");
			if (value !== chosenYAxis) {

				// replaces chosenYAxis with value & verify with console.log
				chosenYAxis = value;
				console.log(chosenYAxis);

				// functions here found above csv import
				// updates y scale for new data
				yLinearScale = yScale(timesData, chosenYAxis);

				// updates x axis with transition
				yAxis = renderAxesY(yLinearScale, yAxis);

				// updates circles with new y values
				circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

				// updates text with new x values
				textGroup = renderName(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

				// updates tooltips with new info
				circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

				// changes classes to change bold text
				if (chosenYAxis === "obesity") {
					obesityLabel
						.classed("active", true)
						.classed("inactive", false);
					smokeLabel
						.classed("active", false)
						.classed("inactive", true);
					healthcareLabel
						.classed("active", false)
						.classed("inactive", true);
				}
				else if (chosenYAxis === "smokes") {
					obesityLabel
						.classed("active", false)
						.classed("inactive", true);
					smokeLabel
						.classed("active", true)
						.classed("inactive", false);
					healthcareLabel
						.classed("active", false)
						.classed("inactive", true);
				}
				else {
					obesityLabel
						.classed("active", false)
						.classed("inactive", true);
					smokeLabel
						.classed("active", false)
						.classed("inactive", true);
					healthcareLabel
						.classed("active", true)
						.classed("inactive", false);
				}
			};
		});
}).catch(function (error) {
	// console.log(error);
});