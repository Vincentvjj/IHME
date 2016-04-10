var ONE_HUDRERD_PERCENT = 100;
var STROKE_DASH = "5";
var ADULT_AGE_GROUP = 38;

var dropDownPrimary
	,dropDownSecondary
	,optionsPrimary
	,optionsSecondary;

var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 1000 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// creates svg elements for the axes.
var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(20).tickFormat(d3.format("d"));
var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);
var line = d3.svg.line()
	.x(function(d) {return x(d.year);})
	.y(function(d) {return y(d.mean * ONE_HUDRERD_PERCENT);}) // to convey data in percentage
	.interpolate("cardinal"); 
	
// makes svg element inside .chart class in the body
var svg = d3.select(".chart")
	.append("svg")
		.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", 
            "translate(" + (margin.left + 35) + "," + 5 + ")");

var data; 

d3.csv("dataset.CSV", function(error, data) {
	$(".loader").hide();
	// shows error message 
	if(error) {
		console.log("Error found: " + error);
		document.getElementById("errorMessage").innerHtml = "Error: " + error;
		return;
	}

	this.data = data; // for later use

	// the first dropdown menu creation 
	// data join uses maps, because data is too big, and we only need the unique location name values
	dropDownPrimary = d3.select(".primary").append("select").on("change", change);
	optionsPrimary 	= dropDownPrimary.selectAll('option') 
		.data(d3.map(data, function(d) {return d.location_name;}).keys()) // data join
		.enter() // data enter
		.append("option")
			.text(function (d) {return d;}); 

    // the second drop down menu for comparisons
	dropDownSecondary = d3.select(".secondary").append("select").on("change", change);
	optionsSecondary  = dropDownSecondary.selectAll('option')
		.data(d3.map(data, function(d) {return d.location_name;}).keys()) // data join
		.enter() // data enter
		.append("option")
			.text(function (d) {return d;}); 

	var everyone = []
		,newDataMale = []
		,newDataFemale = [];

	// more data formation, as there are too many data in original data set. This is to filter out	
	data.forEach(function (d) {
		// starting dropdown menu for lands in Afganistan
		// This app just focuses on male and female in the age between 20 to 100.
		if(d.location_name == "Afghanistan" && d.age_group_id == ADULT_AGE_GROUP && d.metric == "obese" 
			&& (d.sex == "male" || d.sex == "female")) {
			everyone.push({
				year: parseInt(d.year),
				mean: d.mean
			});

			if(d.sex == "male") {
				newDataMale.push({
					year: parseInt(d.year),
					mean: d.mean
				});
			} else if(d.sex == "female") {
				newDataFemale.push({
					year: parseInt(d.year),
					mean: d.mean
				});
			}
		}
	});

	x.domain(d3.extent(everyone, function (d) {return d.year;}));
	y.domain(d3.extent(everyone, function (d) {return d.mean * ONE_HUDRERD_PERCENT;}));

	//creation of x axis
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
	   .append("text")
	    .attr("y", 30)
	    .attr("x", 450)
	    .attr("dy", ".71em")
	    .text("Year");

	// creation of y axis
	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
	   .append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("x", -250)
	    .attr("y", -75)
	    .attr("dy", ".71em")
	    .text("Percentage of prevalence");

	// line creation for male in primary country --> Afghanistan (default)
	svg.append("path")
        .attr("class", "line")
        .attr("class", "male")
        .attr("d", line(newDataMale))
        .style("stroke", "red");
	
	// line creation for female in primary country --> Afghanistan (default)
	svg.append("path")
        .attr("class", "line")
        .attr("class", "female")
        .attr("d", line(newDataFemale))
        .style("stroke", "steelblue");

    // line creation for male in secondary country --> Afghanistan (default)
    svg.append("path")
        .attr("class", "line")
        .attr("class", "maleSecondary")
        .attr("d", line(newDataMale))
        .style("stroke", "red")
        .style("stroke-dasharray", STROKE_DASH);
	
	// line creation for female in secondary country --> Afghanistan (default)
	svg.append("path")
        .attr("class", "line")
        .attr("class", "femaleSecondary")
        .attr("d", line(newDataFemale))
        .style("stroke", "steelblue")
        .style("stroke-dasharray", STROKE_DASH);
}).on("progress", function(e) {
	$(".loader").show();
});


// redraws the chart if menu is changed in either dropdown menus
function change() {
	//gets the index, and get the country name from the index for primary country
	var primaryIndex = dropDownPrimary.property("selectedIndex");
	var primaryCountry = optionsPrimary.filter(function (d, i) {return i === primaryIndex;}).datum();

		//gets the index, and get the country name from the index for secondary country
	var secondaryIndex = dropDownSecondary.property("selectedIndex");
	var secondaryCountry = optionsSecondary.filter(function (d, i) {return i === secondaryIndex;}).datum();

	
	var everyone = [],
		newDataMale = [],
		newDataFemale = [],
		newDataMaleSecondary = [],
		newDataFemaleSecondary = [];

	// more data formation
	data.forEach(function (d) {
		if(d.location_name == primaryCountry && d.age_group_id == ADULT_AGE_GROUP && d.metric == "obese"
			&& (d.sex == "male" || d.sex == "female")) {
			everyone.push({
				year: parseInt(d.year),
				mean: d.mean
			});

			if(d.sex == "male") {
				newDataMale.push({
					year: parseInt(d.year),
					mean: d.mean
				});
			} else if(d.sex == "female") {
				newDataFemale.push({
					year: parseInt(d.year),
					mean: d.mean
				});
			} 
		// now we start to care for the different selection of the secondary country
		} else if (d.location_name == secondaryCountry && d.age_group_id == ADULT_AGE_GROUP && d.metric == "obese") {
			everyone.push({
				year: parseInt(d.year),
				mean: d.mean
			});

			if(d.sex == "male") {
				newDataMaleSecondary.push({
					year: parseInt(d.year),
					mean: d.mean
				});
			} else if(d.sex == "female") {
				newDataFemaleSecondary.push({
					year: parseInt(d.year),
					mean: d.mean
				});
			} 
		}
	});
	
	// reinitialize the x and y range/domains
	x.domain(d3.extent(everyone, function (d) {return d.year;}));
	y.domain(d3.extent(everyone, function (d) {return d.mean * ONE_HUDRERD_PERCENT;}));

	var svg = d3.select(".chart").transition();

    svg.select(".x axis") // change the x axis
        .duration(750)
        .call(xAxis);
    svg.select(".y.axis") // change the y axis
        .duration(750)
        .call(yAxis);

    svg.select(".male")   // change the primary male line
        .duration(750)
        .attr("d", line(newDataMale));

    svg.select(".female")   // change the primary female line
        .duration(750)
        .attr("d", line(newDataFemale));

    svg.select(".maleSecondary")   // change the secondary male line
        .duration(750)
        .attr("d", line(newDataMaleSecondary));

    svg.select(".femaleSecondary")   // change the secondary female line
        .duration(750)
        .attr("d", line(newDataFemaleSecondary));
};