const drawScatterplot = (data) => {
    // T06-2 Step 2.2
    /// Set the dimensions and margins of the chart area
    const svg = d3.select("#scatterplot")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`); // Responsive SVG

    /// Create an inner chart group with margins
    /// (innerChartS is declared in shared-constants.js, so no const here)
    innerChartS = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // T06-2 Step 2.3
    /// Set up x and y scales using data extents
    const xExtent = d3.extent(data, d => d.star);
    const yExtent = d3.extent(data, d => d.energyConsumption);

    /// Map star ratings and energy consumption to positions within the chart area.
    /// (Brief's code uses screenSize for y, but its aim and target image plot energy;
    /// screen size is shown in the tooltip instead.)
    xScaleS
        .domain([xExtent[0] - 0.5, xExtent[1] + 0.5])
        .range([0, innerWidth]);

    yScaleS
        .domain([yExtent[0], yExtent[1]])
        .range([innerHeight, 0])
        .nice();

    // T06-2 Step 2.4
    /// (Corrected code) Set up colours for screen technologies
    /// Colours come from techColors in shared-constants.js, so every chart and button matches
    const uniqueTechs = [...new Set(data.map(d => d.screenTech))];

    colorScale
        .domain(uniqueTechs)
        .range(uniqueTechs.map(tech => techColors[tech]));

    // Light horizontal gridlines first, so the dots are drawn on top of them
    const leftAxis = d3.axisLeft(yScaleS)
        .tickSize(-innerWidth);

    innerChartS.append("g")
        .attr("class", "y-axis")
        .call(leftAxis);

    // T06-2 Step 2.5 Draw the circles
    innerChartS.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("class", "dot")
        .attr("cx", d => xScaleS(d.star))
        .attr("cy", d => yScaleS(d.energyConsumption))
        .attr("r", 4)
        .attr("fill", d => colorScale(d.screenTech))
        .attr("opacity", 0.5);

    // T06-2 Step 2.6 Add bottom and left axis
    /// Add axes (left axis is drawn above, as gridlines behind the dots)
    const bottomAxis = d3.axisBottom(xScaleS);

    innerChartS.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(bottomAxis);

    svg.append("text")
        .text("Star Rating")
        .attr("text-anchor", "end")
        .attr("x", width - 20)
        .attr("y", height - 5)
        .attr("class", "axis-label");

    svg.append("text")
        .text("Labeled Energy Consumption (kWh/year)")
        .attr("x", 30)
        .attr("y", 20)
        .attr("class", "axis-label");

    // T06-2 Step 2.7 Add legend
    /// Add a legend on the right-hand side
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 140}, ${margin.top})`);

    // Show each screen technology with its matching point colour.
    // (A circle rather than the brief's square, so the key looks like the dots it explains)
    uniqueTechs.forEach((tech, i) => {
        const g = legend.append("g").attr("transform", `translate(0, ${i * 22})`);
        g.append("circle")
            .attr("cx", 6)
            .attr("cy", 6)
            .attr("r", 6)
            .attr("fill", colorScale(tech));
        g.append("text")
            .attr("x", 18)
            .attr("y", 10)
            .text(tech)
            .attr("class", "axis-label");
    });
};
