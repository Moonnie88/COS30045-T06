const drawScatterplot = (data) => {
    // T06-2 Step 2.2
    /// Set the dimensions and margins of the chart area

    /// Create an inner chart group with margins
    
    // T06-2 Step 2.3
    /// Set up x and y scales using data extents

    /// Map star ratings and screen sizes to positions within the chart area.

    // T06-2 Step 2.4
    /// (Corrected code) Set up colours for screen technologies
    const uniqueTechs = [...new Set(data.map(d => d.screenTech))];

    colorScale
        .domain(uniqueTechs)
        .range(d3.schemeCategory10);
    
    // T06-2 Step 2.5 Draw the circles

    // T06-2 Step 2.6 Add bottom and left axis
    /// Add axes

    // T06-2 Step 2.7 Add legend
    /// Add a legend on the right-hand side

    // Show each screen technology with its matching point colour.

};