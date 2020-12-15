// parse function for hospitals.csv data file: given a row instance, return a
// dictionary of attribute values for that instance
function parseCsv(d) {
  return {
    name: d["NAME"],
    lat: +d.LATITUDE,
    lon: +d.LONGITUDE,
    type: d["TYPE"],
    city: d["CITY"],
    state: d["STATE"]
  };
}

// array of promises comprised of reading in data files
const promises = [
  d3.csv("./data/hospitals.csv", parseCsv),
  d3.json("./geojson/gz_2010_us_040_00_20m.json")
];

// read in data files
Promise.all(promises).then(function(data) {

  // store the data as a variables
  const hospitals = data[0];
  const geoData = data[1];

  // store values for chart dimensions
  const width = document.querySelector("#chart").clientWidth;
  const height = document.querySelector("#chart").clientHeight;

  // add chart svg to appropriate div with the same dimensions
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // configure geoData projection and presentation
  const projection = d3.geoMercator()
    .translate([width / 2, height / 2])
    .center([-83, 35])
    .scale(800);

  // visually render the geoData
  const path = d3.geoPath()
    .projection(projection);

  svg.selectAll("path")
    .data(geoData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", "state");

  // set color palette for points on map
  const colorScale = d3.scaleOrdinal(d3.schemeSet1)
    .domain(["LONG TERM CARE", "GENERAL ACUTE CARE", "PSYCHIATRIC", "CRITICAL ACCESS", "REHABILITATION", "CHILDREN", "MILITARY", "WOMEN", "SPECIAL", "CHRONIC DISEASE"]);

  // style checkmark boxes in options to be the color of the respective points in the map
  var all = document.getElementsByClassName('checkmark');
  for (var i = 0; i < all.length; i++) {
    let thisCheckMark = all[i];
    let optionName = thisCheckMark.parentNode.firstElementChild.value;
    let optionColor = colorScale(optionName);
    thisCheckMark.style.background = optionColor;
  }

  // bind hospital locations to data points rendered on the map, colored by
  // hospital type
  const points = svg.selectAll("circle")
    .data(hospitals)
    .enter().append("circle")
    .attr("cx", function(d) {
      var proj = projection([d.lon, d.lat]);
      return proj[0];
    }).attr("cy", function(d) {
      var proj = projection([d.lon, d.lat]);
      return proj[1];
    }).attr("r", 3)
    .attr("fill", function(d) {
      return colorScale(d.type);
    })
    .attr("fill-opacity", .5)

  // add a tooltip to the chart
  const tooltip = d3.select("#chart")
    .append("div")
    .attr("class", "tooltip");

  // set the tooltip to render in the general location of a given mapped data
  // point upon mouseover
  svg.selectAll("circle")
    .on("mouseover", function(e, d) {

      let cx = +d3.select(this).attr("cx") * k + tX + 20; // shift the tooltip slightly to make it easier to see data point
      let cy = +d3.select(this).attr("cy") * k + tY - 10;

      tooltip.style("visibility", "visible")
        .style("left", cx + "px")
        .style("top", cy + "px")
        .html(`<b>${d.name}</b><br>Type: ${d.type}<br>Location: ${d.city}, ${d.state}`);

      d3.select(this) // and make the data point on the map increase in radius size
        .attr("r", 10 / k)
        .attr("stroke", "white")
        .attr("stroke-width", 2 / k);

    }).on("mouseout", function() {

      tooltip.style("visibility", "hidden");

      d3.select(this)
        .attr("r", 3 / k)
        .attr("stroke", "none");
    });

  // filter the points rendered on the map by hospital type
  // (do this by either hiding or showing the relevant set of points upon
  // click of a filtering checkbox)
  d3.selectAll(".type--option").on("click", function() {

    let isChecked = d3.select(this).property("checked");
    let hospitalType = d3.select(this).property("value");

    let selection = points.filter(function(d) {
      return d.type === hospitalType;
    });

    if (isChecked == true) {
      selection.attr("opacity", 1);
    } else {
      selection.attr("opacity", 0);
    }

  });

  // add map zooming
  const zoom = d3.zoom()
    .scaleExtent([1, 110])
    .on('zoom', zoomed);

  svg.call(zoom);

  let k = 1;
  let tX = 0;
  let tY = 0;

  function zoomed(e) {

    k = e.transform.k;
    tX = e.transform.x;
    tY = e.transform.y;

    svg.selectAll("*").attr("transform", e.transform);

    svg.selectAll("circle").attr("r", 3 / k);
    svg.selectAll("path").attr("stroke-width", 1 / k);
  }
});