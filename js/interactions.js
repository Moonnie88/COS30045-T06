// Build the screen-technology buttons and connect them to histogram filtering.
const populateFilters = (data) => {
    // Step 7.3 Set up buttons and event listeners
    d3.select("#filters_screen")
        .selectAll(".filter")
        .data(filters_screen)
        .join("button")
        .attr("class", d => `filter ${d.isActive ? "active" : ""}`)
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
                    .classed("active", filter => filter.id === d.id ? true : false);

                updateHistogram(data);
            }
        });
};

// Extension: build the screen-size buttons in the same way as populateFilters
const populateSizeFilters = (data) => {
    d3.select("#filters_size")
        .selectAll(".filter")
        .data(filters_size)
        .join("button")
        .attr("class", d => `filter ${d.isActive ? "active" : ""}`)
        .text(d => d.label)
        .on("click", (e, d) => {
            if (!d.isActive) {

                // make sure only the clicked size is active
                filters_size.forEach(filter => {
                    filter.isActive = d.id === filter.id;
                });

                // update the size buttons based on which one was clicked
                d3.selectAll("#filters_size .filter")
                    .classed("active", filter => filter.id === d.id);

                updateHistogram(data);
            }
        });
};

const updateHistogram = (data) => {
    // Step 7.4 Update the histogram
    // Extension: read the active button from BOTH rows, so tech and size filters combine
    const techId = filters_screen.find(filter => filter.isActive).id;
    const sizeId = filters_size.find(filter => filter.isActive).id;

    const updatedData = data.filter(tv =>
        (techId === "all" || tv.screenTech === techId) &&
        (sizeId === "all" || tv.screenSize === sizeId)
    );

    const updatedBins = binGenerator(updatedData);

    d3.selectAll("#histogram rect")
        .data(updatedBins)
        .transition()
        .duration(500)
        .ease(d3.easeCubicInOut)
        .attr("y", d => yScale(d.length))
        .attr("height", d => innerHeight - yScale(d.length));

    updateCount(updatedBins);
};

// Extension: tell the user how many TVs are in the chart (some combinations have none)
const updateCount = (bins) => {
    const total = d3.sum(bins, d => d.length);

    d3.select("#tv_count")
        .text(total === 0
            ? "No TVs match this combination of filters."
            : `Showing ${d3.format(",")(total)} TVs.`);
};

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
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("fill", barColor)
        .attr("fill-opacity", 0.75);

    // Step 3.4 Apped tooltip text
    tooltip
        .append("text")
        .text("NA")
        .attr("x", tooltipWidth / 2)
        .attr("y", tooltipHeight / 2 + 2)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("fill", "white")
        .style("font-weight", 900);
};

// T06-2 Step 3.5 Add functions to react to mouse events
const handleMouseEvents = () => {
    const tooltip = innerChartS.select(".tooltip");

    // Step 3.6 Select all circles in scatter plot
    // Step 3.7 Attach event listeners to mouseenter and mouseleave events
    innerChartS.selectAll("circle")
        .on("mouseenter", (e, d) => {
            console.log("Mouse entered circle", d);

            tooltip.select("text")
                .text(`${d.screenSize} inches`);

            // Get the hovered circle's position
            const cx = +e.target.getAttribute("cx");
            const cy = +e.target.getAttribute("cy");

            // Centre the tooltip above the circle
            tooltip
                .interrupt()
                .attr(
                    "transform",
                    `translate(${cx - 0.5 * tooltipWidth},
                               ${cy - 1.5 * tooltipHeight})`
                )
                .transition()
                .duration(200)
                .style("opacity", 1);
        })
        .on("mouseleave", (e, d) => {
            console.log("Mouse left circle", d);

            tooltip
                .interrupt()
                .style("opacity", 0)
                .attr("transform", "translate(0, 500)");
        });
};