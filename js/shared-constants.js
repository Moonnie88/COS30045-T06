// Set up dimensions and margins
const margin = { top: 40, right: 30, bottom: 50, left: 70 };
const width = 800; // Total width of the chart
const height = 400; // Total height of the chart
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

/* Make the colours accessible globally */
/****************************************/
const barColor = "#7d7066"; // Warm grey for "All" (matches the cream/brown page theme)
const bodyBackgroundColor = "#ffffff"; // Matches the white chart cards so bar gaps blend in
const fadedColor = "#ddd3c7"; // Scatter dots that don't match the filters
const tooltipColor = "#3b2a1f"; // Dark brown tooltip background

// One colour per screen technology, used by the scatterplot, legend, buttons and histogram.
// Checked for colour-blind separation (blue / orange / aqua).
const techColors = { LED: "#2a78d6", LCD: "#eb6834", OLED: "#1baf7a" };

// Set up the scales
const xScale = d3.scaleLinear();
const yScale = d3.scaleLinear();

// T06-1 Step 6.2 Create a bin generator using d3.bin
const binGenerator = d3.bin()
    .value(d => d.energyConsumption) // Accessor for energyConsumption
    .domain([0, 1800]) // Only TVs under 1,800 kWh/year (drops one 2,652 kWh outlier)
    .thresholds(d3.range(200, 1800, 200)); // Bin edges every 200 kWh, as in the target chart

// T06-1 Step 7.2 Make the filter options accessible globally
const filters_screen = [
    { id: "all", label: "All", isActive: true },
    { id: "LED", label: "LED", isActive: false },
    { id: "LCD", label: "LCD", isActive: false },
    { id: "OLED", label: "OLED", isActive: false }
];

// Extension: screen-size filters (most frequent sizes, plus 98" as the biggest common size)
const filters_size = [
    { id: "all", label: "All Sizes", isActive: true },
    { id: 24, label: '24"', isActive: false },
    { id: 32, label: '32"', isActive: false },
    { id: 55, label: '55"', isActive: false },
    { id: 65, label: '65"', isActive: false },
    { id: 98, label: '98"', isActive: false }
];

// T06-2 Step 1.4 Set up shared constant
let innerChartS; // Inner chart for the scatterplot (kept separate from the histogram's)

const xScaleS = d3.scaleLinear();
const yScaleS = d3.scaleLinear();
const colorScale = d3.scaleOrdinal();

// T06-2 Step 3.3 Add tooltipWidth and tooltipHeight
const tooltipWidth = 210; // Wider than the brief's 65 to fit size, brand/model and energy
const tooltipHeight = 64;
