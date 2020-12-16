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
  d3.json("./geojson/gz_2010_us_040_00_20m.json"),
  d3.json("./geojson/gz_2010_us_050_00_500k.json")
];

// read in data files
Promise.all(promises).then(function(data) {

  // store the data as a variables
  const hospitals = data[0];
  const geoData = data[1];
  const geoData2 = data[2];

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
    .data(geoData.features.concat(geoData2.features))
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", function(d) {
      return d.featureType;
    });

  // set color palette for points on map

  const colorScale = d3.scaleOrdinal()
    .domain(["LONG TERM CARE", "GENERAL ACUTE CARE", "PSYCHIATRIC", "CRITICAL ACCESS", "REHABILITATION", "CHILDREN", "MILITARY", "WOMEN", "SPECIAL", "CHRONIC DISEASE"])
    .range([d3.schemeSet1[0], d3.schemeSet1[1], d3.schemeSet1[2], d3.schemeSet1[3], d3.schemeSet1[4], "magenta", d3.schemeSet1[6], d3.schemeSet1[7], d3.schemeSet1[8], d3.schemeSet1[9]]);

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
    }).attr("r", 2.2)
    .attr("fill", function(d) {
      return colorScale(d.type);
    })
    .attr("fill-opacity", .55)

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
        .attr("r", 2.2 / k)
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
    .scaleExtent([1, 50])
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

    svg.selectAll("circle").attr("r", 2.2 / k);
    svg.selectAll("path").attr("stroke-width", 1 / k);
  }
});

const width = document.querySelector("#lineChart").clientWidth;
const height = document.querySelector("#lineChart").clientHeight;
const margin = {
  top: 25,
  left: 175,
  right: 100,
  bottom: 75
};

const svg = d3.select("#lineChart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const federalData = [{
    year: 1998,
    production: 384000
  },
  {
    year: 1999,
    production: 396000
  },
  {
    year: 2000,
    production: 413000
  },
  {
    year: 2001,
    production: 567000
  },
  {
    year: 2002,
    production: 623000
  },
  {
    year: 2003,
    production: 581000
  },
  {
    year: 2004,
    production: 408000
  },
  {
    year: 2005,
    production: 546000
  },
  {
    year: 2006,
    production: 336000
  },
  {
    year: 2007,
    production: 320000
  },
  {
    year: 2008,
    production: 330000
  },
  {
    year: 2009,
    production: 245000
  },
  {
    year: 2010,
    production: 260000
  },
  {
    year: 2011,
    production: 172000
  },
  {
    year: 2012,
    production: 240000
  }
];

const nonFederalData = [{
    year: 1998,
    production: 260000
  },
  {
    year: 1999,
    production: 308000
  },
  {
    year: 2000,
    production: 231000
  },
  {
    year: 2001,
    production: 220000
  },
  {
    year: 2002,
    production: 451000
  },
  {
    year: 2003,
    production: 264000
  },
  {
    year: 2004,
    production: 217000
  },
  {
    year: 2005,
    production: 208000
  },
  {
    year: 2006,
    production: 253000
  },
  {
    year: 2007,
    production: 234000
  },
  {
    year: 2008,
    production: 294000
  },
  {
    year: 2009,
    production: 300000
  },
  {
    year: 2010,
    production: 205000
  },
  {
    year: 2011,
    production: 120000
  },
  {
    year: 2012,
    production: 136000
  }
];

const xScale = d3.scaleLinear()
  .domain([1998, 2012])
  .range([margin.left, width - margin.right]);

const yScale = d3.scaleLinear()
  .domain([0, 700000])
  .range([height - margin.bottom, margin.top]);

const line = d3.line()
  .x(function(d) {
    return xScale(d.year);
  })
  .y(function(d) {
    return yScale(d.production);
  })
  .curve(d3.curveLinear);

const xAxis = svg.append("g")
  .attr("class", "axis")
  .attr("transform", `translate(0,${height-margin.bottom})`)
  .call(d3.axisBottom().scale(xScale).tickFormat(d3.format("Y")));

const yAxis = svg.append("g")
  .attr("class", "axis")
  .attr("transform", `translate(${margin.left},0)`)
  .call(d3.axisLeft().scale(yScale));

let path = svg.append("path")
  .datum(federalData)
  .attr("d", function(d) {
    return line(d);
  })
  .attr("stroke", "steelblue")
  .attr("fill", "none")
  .attr("stroke-width", 2);

let circle = svg.selectAll("circle")
  .data(federalData)
  .enter()
  .append("circle")
  .attr("cx", function(d) {
    return xScale(d.year);
  })
  .attr("cy", function(d) {
    return yScale(d.production);
  })
  .attr("r", 10)
  .attr("fill", "steelblue");

svg.append("text")
  .attr("class", "axisLabel")
  .attr("x", width / 2)
  .attr("y", height - 10)
  .attr("text-anchor", "middle")
  .text("Year");

svg.append("text")
  .attr("class", "axisLabel")
  .attr("x", -height / 2)
  .attr("y", 50)
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text("Total Production (lbs)");

const tooltip = d3.select("#lineChart")
  .append("div")
  .attr("class", "tooltip");

circle.on("mouseover", function(e, d) {

  console.log(d);

  let cx = +d3.select(this).attr("cx");
  let cy = +d3.select(this).attr("cy");

  tooltip.style("visibility", "visible")
    .style("left", `${cx}px`)
    .style("top", `${cy}px`)
    .html(`<b>Year:</b> ${d.year}<br><b>Production:</b> ${d.production} lbs`);

  d3.select(this)
    .attr("stroke", "#F6C900")
    .attr("stroke-width", 3);

}).on("mouseout", function() {

  tooltip.style("visibility", "hidden");

  d3.select(this)
    .attr("stroke", "none")
    .attr("stroke-width", 0);

});

d3.select("#federal").on("click", function() {

  path.datum(federalData)
    .transition()
    .duration(1500)
    .attr("d", line);

  let c = svg.selectAll("circle")
    .data(federalData, function(d) {
      return d.year;
    });

  c.enter().append("circle")
    .attr("cx", function(d) {
      return xScale(d.year);
    })
    .attr("cy", function(d) {
      return yScale(d.production);
    })
    .attr("r", 10)
    .attr("fill", "steelblue")
    .merge(c)
    .transition()
    .duration(1500)
    .attr("cx", function(d) {
      return xScale(d.year);
    })
    .attr("cy", function(d) {
      return yScale(d.production);
    })
    .attr("r", 10)
    .attr("fill", "steelblue");

  c.exit()
    .transition()
    .duration(1500)
    .attr("r", 0)
    .remove();
});


d3.select("#nonfederal").on("click", function() {

  path.datum(nonFederalData)
    .transition()
    .duration(1500)
    .attr("d", line);

  let c = svg.selectAll("circle")
    .data(nonFederalData, function(d) {
      return d.year;
    });

  c.enter().append("circle")
    .attr("cx", function(d) {
      return xScale(d.year);
    })
    .attr("cy", function(d) {
      return yScale(d.production);
    })
    .attr("r", 10)
    .attr("fill", "steelblue")
    .merge(c)
    .transition()
    .duration(1500)
    .attr("cx", function(d) {
      return xScale(d.year);
    })
    .attr("cy", function(d) {
      return yScale(d.production);
    })
    .attr("r", 10)
    .attr("fill", "steelblue");

  c.exit()
    .transition()
    .duration(1500)
    .attr("r", 0)
    .remove();
});