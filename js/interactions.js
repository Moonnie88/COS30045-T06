// Build the screen-technology buttons and connect them to the charts.
const populateFilters = (data) => {
    // Step 7.3 Set up buttons and event listeners
    d3.select("#filters_screen")
        .selectAll(".filter")
        .data(filters_screen)
        .join("button")
        .attr("class", d => `filter ${d.isActive ? "active" : ""}`)
        .attr("aria-pressed", d => d.isActive) // Tells screen readers which button is on
        .text(d => d.label)
        .on("click", (e, d) => {

            console.log("Clicked filter:", e);
            console.log("Clicked filter data:", d);

            if (!d.isActive) {

                // make sure button clicked is not already active
                filters_screen.forEach(filter => {
                    filter.isActive = d.id === filter.id ? true : false;
                });

                // update the filter buttons based on which one was clicked
                // (brief has "#filter_screen" — fixed to match the div id "filters_screen")
                d3.selectAll("#filters_screen .filter")
                    .classed("active", filter => filter.id === d.id ? true : false)
                    .attr("aria-pressed", filter => filter.id === d.id);

                updateCharts(data);
            }
        });

    // Extension: a colour dot on each technology button, matching the scatterplot legend
    d3.selectAll("#filters_screen .filter")
        .filter(d => d.id !== "all")
        .insert("span", function () { return this.firstChild; }) // Put the dot before the label
        .attr("class", "swatch")
        .style("background-color", d => techColors[d.id]);
};

// Extension: build the screen-size buttons in the same way as populateFilters
const populateSizeFilters = (data) => {
    d3.select("#filters_size")
        .selectAll(".filter")
        .data(filters_size)
        .join("button")
        .attr("class", d => `filter ${d.isActive ? "active" : ""}`)
        .attr("aria-pressed", d => d.isActive)
        .text(d => d.label)
        .on("click", (e, d) => {
            if (!d.isActive) {

                // make sure only the clicked size is active
                filters_size.forEach(filter => {
                    filter.isActive = d.id === filter.id;
                });

                // update the size buttons based on which one was clicked
                d3.selectAll("#filters_size .filter")
                    .classed("active", filter => filter.id === d.id)
                    .attr("aria-pressed", filter => filter.id === d.id);

                updateCharts(data);
            }
        });
};

// Extension: the one filter bar scopes BOTH charts and the summary numbers,
// so every part of the page always describes the same TVs.
const updateCharts = (data) => {
    // Read the active button from both rows, so tech and size filters combine
    const techId = filters_screen.find(filter => filter.isActive).id;
    const sizeId = filters_size.find(filter => filter.isActive).id;

    const updatedData = data.filter(tv =>
        (techId === "all" || tv.screenTech === techId) &&
        (sizeId === "all" || tv.screenSize === sizeId)
    );

    updateHistogram(updatedData, techId);
    updateScatterplot(updatedData);
    updateStats(updatedData, data.length);
};

const updateHistogram = (updatedData, techId) => {
    // Step 7.4 Update the histogram
    // (the filtering itself now happens in updateCharts)
    const updatedBins = binGenerator(updatedData);

    // Extension: rescale the y-axis so small groups (e.g. OLED + 65") stay readable
    const maxCount = d3.max(updatedBins, d => d.length);
    yScale.domain([0, Math.max(maxCount, 5)]).nice();

    d3.select("#histogram .y-axis")
        .transition()
        .duration(500)
        .call(d3.axisLeft(yScale)
            .tickSize(-innerWidth)
            .ticks(Math.min(10, yScale.domain()[1]))); // No half-TV ticks on tiny groups

    d3.selectAll("#histogram rect.bar")
        .data(updatedBins)
        .transition()
        .duration(500)
        .ease(d3.easeCubicInOut)
        .attr("y", d => yScale(d.length))
        .attr("height", d => innerHeight - yScale(d.length))
        // Extension: bars take the selected technology's colour (grey for All)
        .attr("fill", techId === "all" ? barColor : techColors[techId]);
};

// Extension: matching TVs keep their colour; the rest fade to grey and ignore the mouse
const updateScatterplot = (updatedData) => {
    const matches = new Set(updatedData);
    const dots = innerChartS.selectAll("circle");

    dots
        .style("pointer-events", d => matches.has(d) ? null : "none")
        .transition()
        .duration(500)
        .attr("fill", d => matches.has(d) ? colorScale(d.screenTech) : fadedColor)
        .attr("opacity", d => matches.has(d) ? 0.5 : 0.35);

    // Draw matching dots above the faded ones, and keep the tooltip above everything
    dots.filter(d => matches.has(d)).raise();
    innerChartS.select(".tooltip").raise();
};

// Extension: the three summary numbers at the top of the page, plus the status line
const updateStats = (updatedData, totalCount) => {
    const count = updatedData.length;
    const formatCount = d3.format(",");

    d3.select("#stat_count").text(formatCount(count));
    d3.select("#stat_median").text(count
        ? formatCount(Math.round(d3.median(updatedData, d => d.energyConsumption)))
        : "–");
    d3.select("#stat_stars").text(count
        ? d3.mean(updatedData, d => d.star).toFixed(1)
        : "–");

    d3.select("#tv_count")
        .classed("empty", count === 0)
        .text(count === 0
            ? "No TVs match this combination. Try another size or technology."
            : `Showing ${formatCount(count)} of ${formatCount(totalCount)} TVs`);
};

// Extension: hover anywhere in a histogram column to read its exact count
const handleHistogramHover = () => {
    const label = d3.select("#histogram .bar-label");
    const formatCount = d3.format(",");

    d3.select("#histogram .hover-layer")
        .on("mousemove", e => {
            const [mx] = d3.pointer(e);
            const bars = d3.selectAll("#histogram rect.bar");
            const bin = bars.data().find(b => mx >= xScale(b.x0) && mx < xScale(b.x1));
            if (!bin) return;

            bars.classed("dimmed", b => b !== bin);
            label.select(".bar-label-count")
                .text(`${formatCount(bin.length)} TV${bin.length === 1 ? "" : "s"}`);
            label.select(".bar-label-range")
                .text(` use ${formatCount(bin.x0)}–${formatCount(bin.x1)} kWh a year`);
            label.style("opacity", 1);
        })
        .on("mouseleave", () => {
            d3.selectAll("#histogram rect.bar").classed("dimmed", false);
            label.style("opacity", 0);
        });
};

// Shorten long model names so they fit in the tooltip
const shorten = (text, maxLength) =>
    text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;

// T06-2 Step 3: Creating a tooltip and adding function call to load-data.js
const createTooltip = () => {
    // Step 3.2 Append (a hidden) tooltip to innerChart
    const tooltip = innerChartS
        .append("g")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("pointer-events", "none"); // Let the mouse "see through" it to nearby circles

    // Step 3.3 Append tooltip background rectangle
    tooltip
        .append("rect")
        .attr("width", tooltipWidth)
        .attr("height", tooltipHeight)
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("fill", tooltipColor)
        .attr("fill-opacity", 0.92);

    // Step 3.4 Apped tooltip text
    // Extension: three lines instead of one (the brief's "if you are really ambitious"):
    // screen size leads, then brand + model, then technology, energy and stars
    tooltip.append("text").attr("class", "tooltip-size").attr("x", 12).attr("y", 22);
    tooltip.append("text").attr("class", "tooltip-model").attr("x", 12).attr("y", 39);
    tooltip.append("circle").attr("class", "tooltip-swatch").attr("cx", 16).attr("cy", 51).attr("r", 4);
    tooltip.append("text").attr("class", "tooltip-details").attr("x", 25).attr("y", 55);
};

// T06-2 Step 3.5 Add functions to react to mouse events
const handleMouseEvents = () => {
    const tooltip = innerChartS.select(".tooltip");
    const formatCount = d3.format(",");

    // Step 3.6 Select all circles in scatter plot
    // Step 3.7 Attach event listeners to mouseenter and mouseleave events
    innerChartS.selectAll("circle")
        .on("mouseenter", (e, d) => {
            console.log("Mouse entered circle", d);

            // Step 3.8 (1) Give the tooltip text the screen size (and the extra details)
            tooltip.select(".tooltip-size").text(`${d.screenSize} inches`);
            tooltip.select(".tooltip-model").text(shorten(`${d.brand.toUpperCase()} ${d.model}`, 30));
            tooltip.select(".tooltip-swatch").attr("fill", colorScale(d.screenTech));
            tooltip.select(".tooltip-details")
                .text(`${d.screenTech} · ${formatCount(d.energyConsumption)} kWh/yr · ${d.star} stars`);

            // (2) Get the hovered circle's position
            const cx = +e.target.getAttribute("cx");
            const cy = +e.target.getAttribute("cy");

            // (3) Centre the tooltip above the circle, but keep it inside the chart:
            // slide it sideways at the edges, and flip it below dots near the top
            const x = Math.max(-margin.left + 4,
                Math.min(cx - 0.5 * tooltipWidth, innerWidth + margin.right - tooltipWidth - 4));
            const above = cy - tooltipHeight - 12;
            const y = above < -margin.top + 4 ? cy + 12 : above;

            // Extension: lift the hovered dot (bigger, solid, white ring)
            d3.select(e.target)
                .attr("r", 6)
                .attr("opacity", 1)
                .attr("stroke", bodyBackgroundColor)
                .attr("stroke-width", 2);

            tooltip
                .interrupt()
                .attr("transform", `translate(${x}, ${y})`)
                .transition()
                .duration(200)
                .style("opacity", 1);
        })
        .on("mouseleave", (e, d) => {
            console.log("Mouse left circle", d);

            d3.select(e.target)
                .attr("r", 4)
                .attr("opacity", 0.5)
                .attr("stroke", null);

            // (4) Hide the tooltip and move it out of the way
            tooltip
                .interrupt()
                .style("opacity", 0)
                .attr("transform", "translate(0, 500)");
        });
};
