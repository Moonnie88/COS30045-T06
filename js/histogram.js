const drawHistogram = (data) => {
    // Step 6.1 Set the dimensions and margins of the chart area
    const svg = d3.select("#histogram")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`); // Responsive SVG

    // Create an inner chart group with margins
    const innerChart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Step 6.2 Set up bins
    // First, in shared-constants.js, create a bin generator using d3.bin
    // Second, Generate the bins
    const bins = binGenerator(data); // Save the bins into an array

    console.log(bins); // Log the bins to the console for debugging

    // Step 6.3 Get the lower and upper bounds of bins
    const minEng = bins[0].x0; // Lower bound of the first bin
    const maxEng = bins[bins.length - 1].x1; // Upper bound of the last bin
    const binsMaxLength = d3.max(bins, d => d.length); // Get the maximum length of the bins

    // Define scales (from shared constants)
    xScale
        .domain([minEng, maxEng])
        .range([0, innerWidth]);

    yScale
        .domain([0, binsMaxLength])
        .range([innerHeight, 0])
        .nice(); // Use the nice() method to round the y-axis values

    // Step 6.4 Draw the bars of the histogram
    // (class "bar" lets updateHistogram pick only these rects, not the hover layer)
    innerChart
        .selectAll("rect.bar")
        .data(bins)
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.x0))
        .attr("y", d => yScale(d.length))
        .attr("width", d => xScale(d.x1) - xScale(d.x0))
        .attr("height", d => innerHeight - yScale(d.length))
        .attr("fill", barColor)
        .attr("stroke", bodyBackgroundColor) // Set the stroke color gives appearance of gap
        .attr("stroke-width", 2);

    // Step 6.5 Add axes
    const bottomAxis = d3.axisBottom(xScale);

    // Add the x-axis to the bottom of the inner chart
    innerChart
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(bottomAxis);

    // Add the x-axis label
    svg
        .append("text")
        .text("Labeled Energy Consumption (kWh/year)")
        .attr("text-anchor", "end")
        .attr("x", width - 20)
        .attr("y", height - 5)
        .attr("class", "axis-label"); // Set the color of the label in visualisations.css

    // Step 6.6 Add left axis
    // Long ticks (tickSize) double as light gridlines; styled in visualisations.css
    const leftAxis = d3.axisLeft(yScale)
        .tickSize(-innerWidth);

    // Add the y-axis to the inner chart, inserted before the bars so gridlines sit behind them
    innerChart
        .insert("g", "rect.bar")
        .attr("class", "y-axis")
        .call(leftAxis);

    svg
        .append("text")
        .text("Frequency")
        .attr("x", 30)
        .attr("y", 20)
        .attr("class", "axis-label");

    // Extension: hover readout in the top-right corner (count + kWh range),
    // filled in by handleHistogramHover. A fixed spot never overlaps bars or the axis title.
    const barLabel = innerChart.append("text")
        .attr("class", "bar-label")
        .attr("x", innerWidth)
        .attr("y", -16)
        .attr("text-anchor", "end")
        .style("opacity", 0)
        .style("pointer-events", "none");
    barLabel.append("tspan").attr("class", "bar-label-count");
    barLabel.append("tspan").attr("class", "bar-label-range");

    // Extension: an invisible layer over the plot, so the whole column above a bar is hoverable
    // (thin bars like 1,600–1,800 kWh are too small to hit on their own)
    innerChart.append("rect")
        .attr("class", "hover-layer")
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .attr("fill", "transparent");
};
