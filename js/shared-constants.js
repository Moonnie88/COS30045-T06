// Set up dimensions and margins
const margin = { top: 40, right: 30, bottom: 50, left: 70 };
const width = 800; // Total width of the chart
const height = 400; // Total height of the chart
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

/* Make the colours accessible globally */
/****************************************/
const barColor = "#606464";
const bodyBackgroundColor = "#fbf2e8"; // Matches --bg in base.css so bar gaps blend in

// Set up the scales
const xScale = d3.scaleLinear();
const yScale = d3.scaleLinear();

// T06-1 Step 6.2 Create a bin generator using d3.bin
const binGenerator = d3.bin()
    .value(d => d.energyConsumption) // Accessor for energyConsumption
    .domain([0, 1800]) // Only TVs under 1,800 kWh/year (drops one 2,652 kWh outlier)
    .thresholds(d3.range(200, 1800, 200)); // Bin edges every 200 kWh, as in the target chart

// T06-1 Step 7.2 Make the filter options accessible globally

// T06-2 Step 1.4 Set up shared constant

// T06-2 Step 3.3 Add tooltipWidth and tooltipHeight