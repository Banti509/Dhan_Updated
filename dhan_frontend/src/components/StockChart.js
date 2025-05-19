



// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import * as d3 from 'd3';

// const StockChart = () => {
//   const [requestData, setRequestData] = useState({
//     security_id: "4717",
//     exchange_segment: "NSE_EQ",
//     instrument_type: "EQUITY",
//     expiry_code: "0",
//     days: "2"
//   });
//   const [chartData, setChartData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const chartRef = useRef();

//   const fetchData = async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       // Convert days to number if needed
//       const params = {
//         ...requestData,
//         days: parseInt(requestData.days) || 5
//       };

//       const response = await axios.get('http://localhost:5000/api/chart_data', { params });
      
//       if (response.data.status === 'success') {
//         // Try both intraday and historical data
//         const data = response.data.data.intraday || response.data.data.historical || [];
//         setChartData(data.map(item => ({
//           date: new Date(item.date),
//           open: parseFloat(item.open),
//           high: parseFloat(item.high),
//           low: parseFloat(item.low),
//           close: parseFloat(item.close),
//           volume: parseFloat(item.volume)
//         })));
//       } else {
//         throw new Error(response.data.error || 'No data received');
//       }
//     } catch (err) {
//       setError(err.message);
//       console.error('API Error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [requestData]);

//   useEffect(() => {
//     if (!chartData || chartData.length === 0) return;

//     // Clear previous chart
//     d3.select(chartRef.current).selectAll("*").remove();

//     const margin = { top: 40, right: 30, bottom: 60, left: 50 };
//     const width = 800 - margin.left - margin.right;
//     const height = 500 - margin.top - margin.bottom;

//     const svg = d3.select(chartRef.current)
//       .append("svg")
//       .attr("width", width + margin.left + margin.right)
//       .attr("height", height + margin.top + margin.bottom)
//       .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);

//     // X scale
//     const x = d3.scaleBand()
//       .domain(chartData.map(d => d.date))
//       .range([0, width])
//       .padding(0.2);

//     // Y scale
//     const y = d3.scaleLinear()
//       .domain([d3.min(chartData, d => d.low) * 0.99, d3.max(chartData, d => d.high) * 1.01])
//       .range([height, 0]);

//     // X axis
//     svg.append("g")
//       .attr("transform", `translate(0,${height})`)
//       .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m-%d %H:%M")))
//       .selectAll("text")
//         .style("text-anchor", "end")
//         .attr("dx", "-.8em")
//         .attr("dy", ".15em")
//         .attr("transform", "rotate(-45)");

//     // Y axis
//     svg.append("g").call(d3.axisLeft(y));

//     // Candles
//     svg.selectAll(".candle")
//       .data(chartData)
//       .enter()
//       .append("rect")
//       .attr("x", d => x(d.date))
//       .attr("y", d => y(Math.max(d.open, d.close)))
//       .attr("width", x.bandwidth())
//       .attr("height", d => Math.abs(y(d.open) - y(d.close)))
//       .attr("fill", d => d.open > d.close ? "#ef4444" : "#10b981");

//     // Wicks
//     svg.selectAll(".wick")
//       .data(chartData)
//       .enter()
//       .append("line")
//       .attr("x1", d => x(d.date) + x.bandwidth() / 2)
//       .attr("x2", d => x(d.date) + x.bandwidth() / 2)
//       .attr("y1", d => y(d.high))
//       .attr("y2", d => y(d.low))
//       .attr("stroke", d => d.open > d.close ? "#dc2626" : "#059669");

//   }, [chartData]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setRequestData(prev => ({ ...prev, [name]: value }));
//   };

//   return (
//     <div className="p-4 max-w-4xl mx-auto">
//       <div className="bg-white p-4 rounded-lg shadow-md mb-4">
//         <h2 className="text-xl font-bold mb-4">Stock Data Request</h2>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Security ID</label>
//             <input
//               type="text"
//               name="security_id"
//               value={requestData.security_id}
//               onChange={handleInputChange}
//               className="w-full p-2 border rounded"
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium mb-1">Exchange Segment</label>
//             <select
//               name="exchange_segment"
//               value={requestData.exchange_segment}
//               onChange={handleInputChange}
//               className="w-full p-2 border rounded"
//             >
//               <option value="NSE_EQ">NSE Equity</option>
//               <option value="BSE_EQ">BSE Equity</option>
//               <option value="NSE_FO">NSE F&O</option>
//             </select>
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium mb-1">Instrument Type</label>
//             <select
//               name="instrument_type"
//               value={requestData.instrument_type}
//               onChange={handleInputChange}
//               className="w-full p-2 border rounded"
//             >
//               <option value="EQUITY">Equity</option>
//               <option value="FUTURE">Future</option>
//               <option value="OPTION">Option</option>
//             </select>
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium mb-1">Days</label>
//             <input
//               type="number"
//               name="days"
//               value={requestData.days}
//               onChange={handleInputChange}
//               className="w-full p-2 border rounded"
//               min="1"
//             />
//           </div>
//         </div>
        
//         <button
//           onClick={fetchData}
//           className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           disabled={loading}
//         >
//           {loading ? 'Loading...' : 'Fetch Data'}
//         </button>
//       </div>

//       {error && (
//         <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">
//           Error: {error}
//         </div>
//       )}

//       <div className="bg-white p-4 rounded-lg shadow-md">
//         <h2 className="text-xl font-bold mb-4">Candlestick Chart</h2>
//         <div ref={chartRef} className="w-full overflow-x-auto"></div>
//         {chartData.length === 0 && !loading && (
//           <div className="text-center py-8 text-gray-500">
//             No chart data available. Submit a request to fetch data.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default StockChart;






// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import * as d3 from 'd3';

// const StockChart = () => {
//   const [requestData, setRequestData] = useState({
//     security_id: "4717",
//     exchange_segment: "NSE_EQ",
//     instrument_type: "EQUITY",
//     expiry_code: "0",
//     days: "1"
//   });
//   const [chartData, setChartData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [hoverData, setHoverData] = useState(null);
//   const [timeframe, setTimeframe] = useState('1D');
//   const chartRef = useRef();
//   const svgRef = useRef();
//   const zoomRef = useRef();

//   const fetchData = async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       const params = {
//         ...requestData,
//         days: parseInt(requestData.days) || 5
//       };

//       const response = await axios.get('http://localhost:5000/api/chart_data', { params });
      
//       if (response.data.status === 'success') {
//         const data = response.data.data.intraday || response.data.data.historical || [];
//         setChartData(data.map(item => ({
//           date: new Date(item.date),
//           open: parseFloat(item.open),
//           high: parseFloat(item.high),
//           low: parseFloat(item.low),
//           close: parseFloat(item.close),
//           volume: parseFloat(item.volume)
//         })));
//       } else {
//         throw new Error(response.data.error || 'No data received');
//       }
//     } catch (err) {
//       setError(err.message);
//       console.error('API Error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [requestData]);

//   useEffect(() => {
//     if (!chartData || chartData.length === 0) return;

//     // Clear previous chart
//     d3.select(chartRef.current).selectAll("*").remove();

//     const margin = { top: 20, right: 60, bottom: 50, left: 60 };
//     const width = 1200 - margin.left - margin.right;
//     const height = 500 - margin.top - margin.bottom;

//     const svg = d3.select(chartRef.current)
//       .append("svg")
//       .attr("width", width + margin.left + margin.right)
//       .attr("height", height + margin.top + margin.bottom)
//       .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);

//     svgRef.current = svg;

//     // X scale - changed to scaleTime
//     const x = d3.scaleTime()
//       .domain(d3.extent(chartData, d => d.date))
//       .range([0, width]);

//     // Y scale
//     const y = d3.scaleLinear()
//       .domain([d3.min(chartData, d => d.low) * 0.99, d3.max(chartData, d => d.high) * 1.01])
//       .range([height, 0]);

//     // Calculate candle width based on available space
//     const candleWidth = Math.min(
//       (width / chartData.length) * 0.8,
//       10 // max width
//     );

//     // Add chart background
//     svg.append("rect")
//       .attr("width", width)
//       .attr("height", height)
//       .attr("fill", "#0f172a")
//       .attr("rx", 4)
//       .attr("ry", 4);

//     // Add grid lines
//     svg.append("g")
//       .attr("class", "grid")
//       .call(d3.axisLeft(y)
//         .tickSize(-width)
//         .tickFormat("")
//       )
//       .call(g => g.select(".domain").remove())
//       .call(g => g.selectAll(".tick line")
//         .attr("stroke", "#1e293b")
//         .attr("stroke-width", 1)
//         .attr("x2", width));

//     // X axis
//     const xAxis = svg.append("g")
//       .attr("transform", `translate(0,${height})`)
//       .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %d %H:%M")))
//       .call(g => g.select(".domain").remove())
//       .call(g => g.selectAll(".tick line").remove());

//     // Y axis
//     svg.append("g")
//       .call(d3.axisLeft(y))
//       .call(g => g.select(".domain").remove())
//       .call(g => g.selectAll(".tick line").remove());

//     // Candles
//     const candles = svg.selectAll(".candle")
//       .data(chartData)
//       .enter()
//       .append("g")
//       .attr("class", "candle-group");

//     candles.append("rect")
//       .attr("x", d => x(d.date) - candleWidth/2) // Center the candle
//       .attr("y", d => y(Math.max(d.open, d.close)))
//       .attr("width", candleWidth)
//       .attr("height", d => Math.abs(y(d.open) - y(d.close)))
//       .attr("fill", d => d.open > d.close ? "#f87171" : "#4ade80")
//       .attr("rx", 1)
//       .attr("ry", 1)
//       .on("mouseover", (event, d) => {
//         setHoverData(d);
//         d3.select(event.currentTarget).attr("stroke", "#ffffff").attr("stroke-width", 1);
//       })
//       .on("mouseout", (event) => {
//         setHoverData(null);
//         d3.select(event.currentTarget).attr("stroke", null);
//       });

//     // Wicks
//     candles.append("line")
//       .attr("x1", d => x(d.date))
//       .attr("x2", d => x(d.date))
//       .attr("y1", d => y(d.high))
//       .attr("y2", d => y(d.low))
//       .attr("stroke", d => d.open > d.close ? "#ef4444" : "#22c55e")
//       .attr("stroke-width", 1);

//     // Add zoom functionality
//     const zoom = d3.zoom()
//       .scaleExtent([1, 40])
//       .translateExtent([[0, 0], [width, height]])
//       .extent([[0, 0], [width, height]])
//       .on("zoom", (event) => {
//         const newX = event.transform.rescaleX(x);
        
//         // Update x-axis with new scale
//         xAxis.call(d3.axisBottom(newX).tickFormat(d3.timeFormat("%b %d %H:%M")));
        
//         // Update candles position
//         svg.selectAll(".candle-group rect")
//           .attr("x", d => newX(d.date) - candleWidth/2)
//           .attr("width", candleWidth);
          
//         // Update wicks position
//         svg.selectAll(".candle-group line")
//           .attr("x1", d => newX(d.date))
//           .attr("x2", d => newX(d.date));
//       });

//     svg.call(zoom);
//     zoomRef.current = zoom;

//     // Add crosshair
//     const focus = svg.append("g")
//       .attr("class", "focus")
//       .style("display", "none");

//     focus.append("line")
//       .attr("class", "x-hair")
//       .attr("y1", 0)
//       .attr("y2", height)
//       .attr("stroke", "#94a3b8")
//       .attr("stroke-width", 1)
//       .attr("stroke-dasharray", "3,3");

//     focus.append("line")
//       .attr("class", "y-hair")
//       .attr("x1", 0)
//       .attr("x2", width)
//       .attr("stroke", "#94a3b8")
//       .attr("stroke-width", 1)
//       .attr("stroke-dasharray", "3,3");

//     // Create bisector for finding nearest data point
//     const bisectDate = d3.bisector(d => d.date).left;

//     svg.append("rect")
//       .attr("class", "overlay")
//       .attr("width", width)
//       .attr("height", height)
//       .style("fill", "none")
//       .style("pointer-events", "all")
//       .on("mouseover", () => focus.style("display", null))
//       .on("mouseout", () => {
//         focus.style("display", "none");
//         setHoverData(null);
//       })
//       .on("mousemove", (event) => {
//         const [xPos] = d3.pointer(event);
//         const date = x.invert(xPos); // Now works with scaleTime
        
//         // Find nearest data point
//         const i = bisectDate(chartData, date, 1);
//         const d0 = chartData[i - 1];
//         const d1 = chartData[i];
//         const d = date - d0.date > d1.date - date ? d1 : d0;
        
//         setHoverData(d);
        
//         // Position crosshair
//         focus.select(".x-hair")
//           .attr("x1", x(d.date))
//           .attr("x2", x(d.date));
          
//         focus.select(".y-hair")
//           .attr("y1", y(d.close))
//           .attr("y2", y(d.close));
//       });

//   }, [chartData]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setRequestData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleTimeframeChange = (tf) => {
//     setTimeframe(tf);
//     // Here you would typically fetch new data based on the timeframe
//     // For now we'll just update the state
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 p-4 md:p-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//             <div>
//               <h2 className="text-2xl font-bold text-white mb-1">Stock Analysis</h2>
//               <p className="text-gray-400">Real-time market data visualization</p>
//             </div>
//             <div className="mt-4 md:mt-0 flex space-x-2">
//               <button 
//                 onClick={() => handleTimeframeChange('1D')} 
//                 className={`px-4 py-2 rounded-md text-sm font-medium ${timeframe === '1D' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
//               >
//                 1D
//               </button>
//               <button 
//                 onClick={() => handleTimeframeChange('1W')} 
//                 className={`px-4 py-2 rounded-md text-sm font-medium ${timeframe === '1W' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
//               >
//                 1W
//               </button>
//               <button 
//                 onClick={() => handleTimeframeChange('1M')} 
//                 className={`px-4 py-2 rounded-md text-sm font-medium ${timeframe === '1M' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
//               >
//                 1M
//               </button>
//               <button 
//                 onClick={() => handleTimeframeChange('3M')} 
//                 className={`px-4 py-2 rounded-md text-sm font-medium ${timeframe === '3M' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
//               >
//                 3M
//               </button>
//               <button 
//                 onClick={() => handleTimeframeChange('1Y')} 
//                 className={`px-4 py-2 rounded-md text-sm font-medium ${timeframe === '1Y' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
//               >
//                 1Y
//               </button>
//             </div>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//             <div className="space-y-1">
//               <label className="block text-sm font-medium text-gray-300 mb-1">Security ID</label>
//               <input
//                 type="text"
//                 name="security_id"
//                 value={requestData.security_id}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="e.g. 4717"
//               />
//             </div>
            
//             <div className="space-y-1">
//               <label className="block text-sm font-medium text-gray-300 mb-1">Exchange</label>
//               <select
//                 name="exchange_segment"
//                 value={requestData.exchange_segment}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 <option value="NSE_EQ">NSE Equity</option>
//                 <option value="BSE_EQ">BSE Equity</option>
//                 <option value="NSE_FO">NSE F&O</option>
//               </select>
//             </div>
            
//             <div className="space-y-1">
//               <label className="block text-sm font-medium text-gray-300 mb-1">Instrument</label>
//               <select
//                 name="instrument_type"
//                 value={requestData.instrument_type}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 <option value="EQUITY">Equity</option>
//                 <option value="FUTURE">Future</option>
//                 <option value="OPTION">Option</option>
//               </select>
//             </div>
            
//             <div className="space-y-1">
//               <label className="block text-sm font-medium text-gray-300 mb-1">Days</label>
//               <input
//                 type="number"
//                 name="days"
//                 value={requestData.days}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 min="1"
//                 placeholder="e.g. 5"
//               />
//             </div>
            
//             <div className="flex items-end">
//               <button
//                 onClick={fetchData}
//                 disabled={loading}
//                 className={`w-full px-4 py-2 rounded-md font-medium flex items-center justify-center transition-all ${loading ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-500'}`}
//               >
//                 {loading ? (
//                   <>
//                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Loading...
//                   </>
//                 ) : (
//                   <>
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
//                     </svg>
//                     Fetch Data
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>

//         {error && (
//           <div className="p-4 mb-6 bg-red-900 bg-opacity-50 text-red-100 rounded-lg border border-red-700 flex items-start">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//             </svg>
//             <div>
//               <h3 className="font-medium">Error fetching data</h3>
//               <p className="text-sm opacity-90">{error}</p>
//             </div>
//           </div>
//         )}

//         <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-bold text-white">
//               {requestData.security_id} - {timeframe} Chart
//             </h2>
//             {hoverData && (
//               <div className="bg-gray-700 px-4 py-2 rounded-md border border-gray-600">
//                 <div className="grid grid-cols-4 gap-x-6 gap-y-1 text-sm">
//                   <span className="text-gray-400">Open:</span>
//                   <span className={hoverData.open > hoverData.close ? 'text-red-400' : 'text-green-400'}>{hoverData.open.toFixed(2)}</span>
//                   <span className="text-gray-400">High:</span>
//                   <span className="text-green-400">{hoverData.high.toFixed(2)}</span>
//                   <span className="text-gray-400">Close:</span>
//                   <span className={hoverData.close > hoverData.open ? 'text-green-400' : 'text-red-400'}>{hoverData.close.toFixed(2)}</span>
//                   <span className="text-gray-400">Low:</span>
//                   <span className="text-red-400">{hoverData.low.toFixed(2)}</span>
//                   <span className="text-gray-400">Date:</span>
//                   <span className="col-span-3">{d3.timeFormat("%Y-%m-%d %H:%M")(hoverData.date)}</span>
//                 </div>
//               </div>
//             )}
//           </div>
          
//           <div ref={chartRef} className="w-full overflow-x-auto"></div>
          
//           {chartData.length === 0 && !loading && (
//             <div className="text-center py-12 text-gray-400">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//               <h3 className="text-lg font-medium">No chart data available</h3>
//               <p className="mt-1">Submit a request to fetch market data</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StockChart;












// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import * as d3 from 'd3';

// const StockChart = () => {
//   // ... (keep your existing state declarations)
//   const [requestData, setRequestData] = useState({
//     security_id: "4717",
//     exchange_segment: "NSE_EQ",
//     instrument_type: "EQUITY",
//     expiry_code: "0",
//     days: "1"
//   });
//   const [chartData, setChartData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [hoverData, setHoverData] = useState(null);
//   const [timeframe, setTimeframe] = useState('1D');
//   const chartRef = useRef();
//   const svgRef = useRef();
//   const zoomRef = useRef();

//   const fetchData = async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       const params = {
//         ...requestData,
//         days: parseInt(requestData.days) || 5
//       };

//       const response = await axios.get('http://localhost:5000/api/chart_data', { params });
      
//       if (response.data.status === 'success') {
//         const data = response.data.data.intraday || response.data.data.historical || [];
//         setChartData(data.map(item => ({
//           date: new Date(item.date),
//           open: parseFloat(item.open),
//           high: parseFloat(item.high),
//           low: parseFloat(item.low),
//           close: parseFloat(item.close),
//           volume: parseFloat(item.volume)
//         })));
//       } else {
//         throw new Error(response.data.error || 'No data received');
//       }
//     } catch (err) {
//       setError(err.message);
//       console.error('API Error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [requestData]);

//   useEffect(() => {
//     if (!chartData || chartData.length === 0) return;

//     // Clear previous chart
//     d3.select(chartRef.current).selectAll("*").remove();

//     const margin = { top: 20, right: 60, bottom: 50, left: 60 };
//     const width = 1200 - margin.left - margin.right;
//     const height = 500 - margin.top - margin.bottom;

//     const svg = d3.select(chartRef.current)
//       .append("svg")
//       .attr("width", width + margin.left + margin.right)
//       .attr("height", height + margin.top + margin.bottom)
//       .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);

//     // Add clip path to prevent elements from overflowing
//     svg.append("defs").append("clipPath")
//       .attr("id", "chart-clip")
//       .append("rect")
//       .attr("width", width)
//       .attr("height", height);

//     // X scale - using scaleTime for proper date handling
//     const x = d3.scaleTime()
//       .domain(d3.extent(chartData, d => d.date))
//       .range([0, width]);

//     // Y scale with padding
//     const y = d3.scaleLinear()
//       .domain([d3.min(chartData, d => d.low) * 0.99, d3.max(chartData, d => d.high) * 1.01])
//       .range([height, 0])
//       .nice();

//     // Dynamic candle width calculation
//     const calculateCandleWidth = () => {
//       const timeDiff = chartData.length > 1 ? 
//         chartData[1].date - chartData[0].date : 
//         1000 * 60 * 60; // default 1 hour if single data point
//       return Math.min(width / chartData.length * 2.6, timeDiff / (24 * 60 * 60 * 1000) * width * 2.6);
//     };

//     let candleWidth = calculateCandleWidth();

//     // Add chart background with clip path
//     svg.append("rect")
//       .attr("width", "100%")
//       .attr("height", "100%")
//       .attr("fill", "#0f172a")
//       .attr("rx", 4)
//       .attr("ry", 4)
//       .attr("clip-path", "url(#chart-clip)");

//     // Add grid lines
//     svg.append("g")
//       .attr("class", "grid")
//       .call(d3.axisLeft(y)
//         .tickSize(-width)
//         .tickFormat("")
//       )
//       .call(g => g.select(".domain").remove())
//       .call(g => g.selectAll(".tick line")
//         .attr("stroke", "#334155")
//         .attr("stroke-width", 1)
//         .attr("stroke-dasharray", "2,2")
//         .attr("x2", width));

//     // X axis
//     const xAxis = svg.append("g")
//       .attr("transform", `translate(0,${height})`)
//       .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %d %H:%M")))
//       .call(g => g.select(".domain").remove())
//       .call(g => g.selectAll(".tick line").remove());

//     // Y axis
//     svg.append("g")
//       .attr("class", "y-axis")
//       .call(d3.axisLeft(y).tickSize(-width))
//       .call(g => g.select(".domain").remove())
//       .call(g => g.selectAll(".tick line").remove());

//     // Create candle group with clip path
//     const candleGroup = svg.append("g")
//       .attr("clip-path", "url(#chart-clip)");

//     // Candles
//     const candles = candleGroup.selectAll(".candle")
//       .data(chartData)
//       .enter()
//       .append("g")
//       .attr("class", "candle-group");

//     // Draw candles
//   candles.append("rect")
//     .attr("x", d => x(d.date) - candleWidth/2)
//     .attr("y", d => y(Math.max(d.open, d.close)))
//     .attr("width", candleWidth)
//     .attr("height", d => Math.max(1, Math.abs(y(d.open) - y(d.close)))) // Ensure minimum height of 1px
//     .attr("fill", d => d.close >= d.open ? "#10B981" : "#EF4444") // Green for bullish, red for bearish
//     .attr("stroke", d => d.close >= d.open ? "#059669" : "#DC2626") // Darker border for contrast
//     .attr("stroke-width", 0.5) // Thin border
//     .attr("rx", 0) // No rounded corners
//     .attr("ry", 0)
//     .on("mouseover", function(event, d) {
//       setHoverData(d);
//       d3.select(this)
//         .attr("stroke", "#FFFFFF") // White border on hover
//         .attr("stroke-width", 1.5);
//     })
//     .on("mouseout", function() {
//       setHoverData(null);
//       d3.select(this)
//         .attr("stroke", d => d.close >= d.open ? "#059669" : "#DC2626")
//         .attr("stroke-width", 0.5);
//     });

//   // Wicks with updated styling
//   candles.append("line")
//     .attr("x1", d => x(d.date))
//     .attr("x2", d => x(d.date))
//     .attr("y1", d => y(d.high))
//     .attr("y2", d => y(d.low))
//     .attr("stroke", d => d.close >= d.open ? "#059669" : "#DC2626") // Match candle colors
//     .attr("stroke-width", 2) // Thicker wicks for better visibility
//     .attr("stroke-linecap", "round"); // Rounded ends for wicks


//     // Add zoom functionality
//     const zoom = d3.zoom()
//       .scaleExtent([1, 20])
//       .translateExtent([[0, 0], [width, height]])
//       .extent([[0, 0], [width, height]])
//       .on("zoom", (event) => {
//         const newX = event.transform.rescaleX(x); // Only rescale X axis
        
//         // Update x-axis with new scale
//         xAxis.call(d3.axisBottom(newX).tickFormat(d3.timeFormat("%b %d %H:%M")));
        
//         // Remove the candle width recalculation - keep original width
//         // const zoomedCandleWidth = Math.max(2, candleWidth / event.transform.k);
        
//         // Update candles - only modify x position (keep original width)
//         svg.selectAll(".candle-group rect")
//           .attr("x", d => newX(d.date) - candleWidth/2)
//           .attr("width", candleWidth); // Keep original width
          
//         // Update wicks - only modify x position
//         svg.selectAll(".candle-group line")
//           .attr("x1", d => newX(d.date))
//           .attr("x2", d => newX(d.date));
//       });
//     svg.call(zoom);

//     // Add crosshair
//     const focus = svg.append("g")
//       .attr("class", "focus")
//       .style("display", "none");

//     focus.append("line")
//       .attr("class", "x-hair")
//       .attr("y1", 0)
//       .attr("y2", height)
//       .attr("stroke", "#94a3b8")
//       .attr("stroke-width", 1)
//       .attr("stroke-dasharray", "3,3");

//     focus.append("line")
//       .attr("class", "y-hair")
//       .attr("x1", 0)
//       .attr("x2", width)
//       .attr("stroke", "#94a3b8")
//       .attr("stroke-width", 1)
//       .attr("stroke-dasharray", "3,3");

//     // Create bisector for finding nearest data point
//     const bisectDate = d3.bisector(d => d.date).left;

//     svg.append("rect")
//       .attr("class", "overlay")
//       .attr("width", width)
//       .attr("height", height)
//       .style("fill", "none")
//       .style("pointer-events", "all")
//       .on("mouseover", () => focus.style("display", null))
//       .on("mouseout", () => {
//         focus.style("display", "none");
//         setHoverData(null);
//       })
//       .on("mousemove", (event) => {
//         const [xPos] = d3.pointer(event);
//         const date = x.invert(xPos);
        
//         // Find nearest data point
//         const i = bisectDate(chartData, date, 1);
//         const d0 = chartData[i - 1];
//         const d1 = chartData[i];
//         const d = date - d0.date > d1.date - date ? d1 : d0;
        
//         setHoverData(d);
        
//         // Position crosshair
//         focus.select(".x-hair")
//           .attr("x1", x(d.date))
//           .attr("x2", x(d.date));
          
//         focus.select(".y-hair")
//           .attr("y1", y(d.close))
//           .attr("y2", y(d.close));
//       });

//   }, [chartData]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setRequestData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleTimeframeChange = (tf) => {
//     setTimeframe(tf);
//     // Here you would typically fetch new data based on the timeframe
//     // For now we'll just update the state
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 p-4 md:p-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//             <div>
//               <h2 className="text-2xl font-bold text-white mb-1">Stock Analysis</h2>
//               <p className="text-gray-400">Real-time market data visualization</p>
//             </div>
//             <div className="mt-4 md:mt-0 flex space-x-2">
//               <button 
//                 onClick={() => handleTimeframeChange('1D')} 
//                 className={`px-4 py-2 rounded-md text-sm font-medium ${timeframe === '1D' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
//               >
//                 1D
//               </button>
//               <button 
//                 onClick={() => handleTimeframeChange('1W')} 
//                 className={`px-4 py-2 rounded-md text-sm font-medium ${timeframe === '1W' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
//               >
//                 1W
//               </button>
//               <button 
//                 onClick={() => handleTimeframeChange('1M')} 
//                 className={`px-4 py-2 rounded-md text-sm font-medium ${timeframe === '1M' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
//               >
//                 1M
//               </button>
//               <button 
//                 onClick={() => handleTimeframeChange('3M')} 
//                 className={`px-4 py-2 rounded-md text-sm font-medium ${timeframe === '3M' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
//               >
//                 3M
//               </button>
//               <button 
//                 onClick={() => handleTimeframeChange('1Y')} 
//                 className={`px-4 py-2 rounded-md text-sm font-medium ${timeframe === '1Y' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
//               >
//                 1Y
//               </button>
//             </div>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//             <div className="space-y-1">
//               <label className="block text-sm font-medium text-gray-300 mb-1">Security ID</label>
//               <input
//                 type="text"
//                 name="security_id"
//                 value={requestData.security_id}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="e.g. 4717"
//               />
//             </div>
            
//             <div className="space-y-1">
//               <label className="block text-sm font-medium text-gray-300 mb-1">Exchange</label>
//               <select
//                 name="exchange_segment"
//                 value={requestData.exchange_segment}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 <option value="NSE_EQ">NSE Equity</option>
//                 <option value="BSE_EQ">BSE Equity</option>
//                 <option value="NSE_FO">NSE F&O</option>
//               </select>
//             </div>
            
//             <div className="space-y-1">
//               <label className="block text-sm font-medium text-gray-300 mb-1">Instrument</label>
//               <select
//                 name="instrument_type"
//                 value={requestData.instrument_type}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 <option value="EQUITY">Equity</option>
//                 <option value="FUTURE">Future</option>
//                 <option value="OPTION">Option</option>
//               </select>
//             </div>
            
//             <div className="space-y-1">
//               <label className="block text-sm font-medium text-gray-300 mb-1">Days</label>
//               <input
//                 type="number"
//                 name="days"
//                 value={requestData.days}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 min="1"
//                 placeholder="e.g. 5"
//               />
//             </div>
            
//             <div className="flex items-end">
//               <button
//                 onClick={fetchData}
//                 disabled={loading}
//                 className={`w-full px-4 py-2 rounded-md font-medium flex items-center justify-center transition-all ${loading ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-500'}`}
//               >
//                 {loading ? (
//                   <>
//                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Loading...
//                   </>
//                 ) : (
//                   <>
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
//                     </svg>
//                     Fetch Data
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>

//         {error && (
//           <div className="p-4 mb-6 bg-red-900 bg-opacity-50 text-red-100 rounded-lg border border-red-700 flex items-start">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//             </svg>
//             <div>
//               <h3 className="font-medium">Error fetching data</h3>
//               <p className="text-sm opacity-90">{error}</p>
//             </div>
//           </div>
//         )}

//         <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-bold text-white">
//               {requestData.security_id} - {timeframe} Chart
//             </h2>
//             {hoverData && (
//               <div className="bg-gray-700 px-4 py-2 rounded-md border border-gray-600">
//                 <div className="grid grid-cols-4 gap-x-6 gap-y-1 text-sm">
//                   <span className="text-gray-400">Open:</span>
//                   <span className={hoverData.open > hoverData.close ? 'text-red-400' : 'text-green-400'}>{hoverData.open.toFixed(2)}</span>
//                   <span className="text-gray-400">High:</span>
//                   <span className="text-green-400">{hoverData.high.toFixed(2)}</span>
//                   <span className="text-gray-400">Close:</span>
//                   <span className={hoverData.close > hoverData.open ? 'text-green-400' : 'text-red-400'}>{hoverData.close.toFixed(2)}</span>
//                   <span className="text-gray-400">Low:</span>
//                   <span className="text-red-400">{hoverData.low.toFixed(2)}</span>
//                   <span className="text-gray-400">Date:</span>
//                   <span className="col-span-3">{d3.timeFormat("%Y-%m-%d %H:%M")(hoverData.date)}</span>
//                 </div>
//               </div>
//             )}
//           </div>
          
//           {/* <div ref={chartRef} className="w-full overflow-x-auto"></div> */}
//           <div 
//           ref={chartRef} 
//           className="w-full"
//           style={{ 
//             height: '600px',  // Increased fixed height
//             minHeight: '500px',
//             overflow: 'hidden' // Remove overflow-x-auto to prevent scrolling
//           }}
//         ></div>
          
//           {chartData.length === 0 && !loading && (
//             <div className="text-center py-12 text-gray-400">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//               <h3 className="text-lg font-medium">No chart data available</h3>
//               <p className="mt-1">Submit a request to fetch market data</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StockChart;






import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import * as d3 from 'd3';

const StockChart = () => {
  const [requestData, setRequestData] = useState({
    security_id: "4717",
    exchange_segment: "NSE_EQ",
    instrument_type: "EQUITY",
    expiry_code: "0",
    days: "1"
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoverData, setHoverData] = useState(null);
  const [timeframe, setTimeframe] = useState('1D');
  const [indicator, setIndicator] = useState('none'); // ['none', 'sma', 'ema', 'rsi']
  const [theme, setTheme] = useState('dark'); // ['dark', 'light']
  const [showVolume, setShowVolume] = useState(false);
  const chartRef = useRef();
  // const svgRef = useRef();
  // const zoomRef = useRef();

  // Sample watchlist for quick selection
  const watchlist = [
    { symbol: 'RELIANCE', security_id: '2885', name: 'Reliance Industries' },
    { symbol: 'TATASTEEL', security_id: '4717', name: 'Tata Steel' },
    { symbol: 'HDFCBANK', security_id: '1333', name: 'HDFC Bank' },
    { symbol: 'INFY', security_id: '1594', name: 'Infosys' },
    { symbol: 'ITC', security_id: '1660', name: 'ITC Limited' },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        ...requestData,
        days: parseInt(requestData.days) || 5
      };

      const response = await axios.get('http://localhost:5000/api/chart_data', { params });
      
      if (response.data.status === 'success') {
        let data = response.data.data.intraday || response.data.data.historical || [];
        
        // Process data to add technical indicators if needed
        data = data.map(item => ({
          date: new Date(item.date),
          open: parseFloat(item.open),
          high: parseFloat(item.high),
          low: parseFloat(item.low),
          close: parseFloat(item.close),
          volume: parseFloat(item.volume || 0)
        }));
        
        // Sort by date just in case
        data.sort((a, b) => a.date - b.date);
        
        // Add technical indicators
        if (indicator !== 'none') {
          data = addTechnicalIndicators(data, indicator);
        }
        
        setChartData(data);
      } else {
        throw new Error(response.data.error || 'No data received');
      }
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [requestData, indicator]);

  // Helper function to add technical indicators
  const addTechnicalIndicators = (data, type) => {
    const period = 14; // Common period for indicators

    // Custom SMA calculation
    const calculateSMA = (data, period) => {
      const sma = [];
      for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
          sma.push(null); // Not enough data points yet
        } else {
          const slice = data.slice(i - period + 1, i + 1);
          const avg = slice.reduce((sum, d) => sum + d.close, 0) / period;
          sma.push(avg);
        }
      }
      return sma;
    };

    // Custom EMA calculation
    const calculateEMA = (data, period) => {
      const k = 2 / (period + 1); // Smoothing factor
      const ema = [];
      let previousEMA;

      for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
          ema.push(null); // Not enough data points yet
        } else if (i === period - 1) {
          // Calculate initial SMA as the starting point for EMA
          const slice = data.slice(i - period + 1, i + 1);
          const sma = slice.reduce((sum, d) => sum + d.close, 0) / period;
          ema.push(sma);
          previousEMA = sma;
        } else {
          // EMA = (Close - Previous EMA) * k + Previous EMA
          const currentEMA = (data[i].close - previousEMA) * k + previousEMA;
          ema.push(currentEMA);
          previousEMA = currentEMA;
        }
      }
      return ema;
    };

    switch (type) {
      case 'sma':
        const smaValues = calculateSMA(data, period);
        return data.map((d, i) => ({ ...d, sma: smaValues[i] }));

      case 'ema':
        const emaValues = calculateEMA(data, period);
        return data.map((d, i) => ({ ...d, ema: emaValues[i] }));

      case 'rsi':
        // Relative Strength Index
        const rsi = (data) => {
          let gains = 0;
          let losses = 0;
          const rsiValues = [];

          for (let i = 1; i < data.length; i++) {
            const change = data[i].close - data[i - 1].close;
            if (change > 0) gains += change;
            else losses += Math.abs(change);

            if (i >= period) {
              const avgGain = gains / period;
              const avgLoss = losses / period;
              const rs = avgLoss > 0 ? avgGain / avgLoss : Infinity;
              rsiValues.push(rs === Infinity ? 100 : 100 - (100 / (1 + rs)));

              // Remove oldest change
              const oldestChange = data[i - period + 1].close - data[i - period].close;
              if (oldestChange > 0) gains -= oldestChange;
              else losses -= Math.abs(oldestChange);
            }
          }

          return rsiValues;
        };

        const rsiValues = rsi(data);
        return data.map((d, i) => ({
          ...d,
          rsi: i >= period ? rsiValues[i - period] : null
        }));

      default:
        return data;
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!chartData || chartData.length === 0) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 60, bottom: showVolume ? 80 : 50, left: 60 };
    const width = 1200 - margin.left - margin.right;
    const height = (showVolume ? 400 : 500) - margin.top - margin.bottom;
    const volumeHeight = showVolume ? 100 : 0;

    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + volumeHeight + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add clip path to prevent elements from overflowing
    svg.append("defs").append("clipPath")
      .attr("id", "chart-clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    // X scale - using scaleTime for proper date handling
    const x = d3.scaleTime()
      .domain(d3.extent(chartData, d => d.date))
      .range([0, width]);

    // Y scale with padding
    const y = d3.scaleLinear()
      .domain([d3.min(chartData, d => d.low) * 0.99, d3.max(chartData, d => d.high) * 1.01])
      .range([height, 0])
      .nice();

    // RSI Y scale (defined here to be accessible in zoom handler)
    let rsiY = null;
    if (indicator === 'rsi') {
      rsiY = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);
    }

    // Dynamic candle width calculation
    const calculateCandleWidth = () => {
      const timeDiff = chartData.length > 1 ? 
        chartData[1].date - chartData[0].date : 
        1000 * 60 * 60; // default 1 hour if single data point
      return Math.min(width / chartData.length * 2.6, timeDiff / (24 * 60 * 60 * 1000) * width * 2.6);
    };

    let candleWidth = calculateCandleWidth();

    // Add chart background with clip path
    svg.append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", theme === 'dark' ? "#0f172a" : "#f8fafc")
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("clip-path", "url(#chart-clip)");

    // Add grid lines
    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
      )
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line")
        .attr("stroke", theme === 'dark' ? "#334155" : "#e2e8f0")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2,2")
        .attr("x2", width));

    // X axis
    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %d %H:%M")))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").remove())
      .call(g => g.selectAll(".tick text")
        .attr("fill", theme === 'dark' ? "#94a3b8" : "#64748b"));

    // Y axis
    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).tickSize(-width))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").remove())
      .call(g => g.selectAll(".tick text")
        .attr("fill", theme === 'dark' ? "#94a3b8" : "#64748b"));

    // Create candle group with clip path
    const candleGroup = svg.append("g")
      .attr("clip-path", "url(#chart-clip)");

    // Candles
    const candles = candleGroup.selectAll(".candle")
      .data(chartData)
      .enter()
      .append("g")
      .attr("class", "candle-group");

    // Draw candles
    candles.append("rect")
      .attr("x", d => x(d.date) - candleWidth/2)
      .attr("y", d => y(Math.max(d.open, d.close)))
      .attr("width", candleWidth)
      .attr("height", d => Math.max(1, Math.abs(y(d.open) - y(d.close))))
      .attr("fill", d => d.close >= d.open ? "#10B981" : "#EF4444")
      .attr("stroke", d => d.close >= d.open ? "#059669" : "#DC2626")
      .attr("stroke-width", 0.5)
      .attr("rx", 0)
      .attr("ry", 0)
      .on("mouseover", function(event, d) {
        setHoverData(d);
        d3.select(this)
          .attr("stroke", "#FFFFFF")
          .attr("stroke-width", 1.5);
      })
      .on("mouseout", function() {
        setHoverData(null);
        d3.select(this)
          .attr("stroke", d => d.close >= d.open ? "#059669" : "#DC2626")
          .attr("stroke-width", 0.5);
      });

    // Wicks
    candles.append("line")
      .attr("x1", d => x(d.date))
      .attr("x2", d => x(d.date))
      .attr("y1", d => y(d.high))
      .attr("y2", d => y(d.low))
      .attr("stroke", d => d.close >= d.open ? "#059669" : "#DC2626")
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round");

    // Draw technical indicators
    if (indicator === 'sma' || indicator === 'ema') {
      const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d[indicator]))
        .curve(d3.curveMonotoneX);

      svg.append("path")
        .datum(chartData.filter(d => d[indicator] !== undefined))
        .attr("class", "indicator-line")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "#6366f1")
        .attr("stroke-width", 2);
    } else if (indicator === 'rsi' && rsiY) {
      const rsiLine = d3.line()
        .x(d => x(d.date))
        .y(d => rsiY(d.rsi))
        .defined(d => d.rsi !== null)
        .curve(d3.curveMonotoneX);

      svg.append("path")
        .datum(chartData)
        .attr("class", "rsi-line")
        .attr("d", rsiLine)
        .attr("fill", "none")
        .attr("stroke", "#8b5cf6")
        .attr("stroke-width", 2);

      // Add RSI thresholds
      [30, 70].forEach(level => {
        svg.append("line")
          .attr("x1", 0)
          .attr("x2", width)
          .attr("y1", rsiY(level))
          .attr("y2", rsiY(level))
          .attr("stroke", "#94a3b8")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "3,3");
      });
    }

    // Volume bars if enabled
    if (showVolume) {
      const volumeY = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.volume)])
        .range([volumeHeight, 0]);

      // const volumeX = d3.scaleBand()
      //   .domain(chartData.map(d => d.date))
      //   .range([0, width])
      //   .padding(0.2);

      svg.append("g")
        .attr("transform", `translate(0,${height + 10})`)
        .selectAll(".volume-bar")
        .data(chartData)
        .enter()
        .append("rect")
        .attr("class", "volume-bar")
        .attr("x", d => x(d.date) - candleWidth/2)
        .attr("y", d => volumeY(d.volume))
        .attr("width", candleWidth)
        .attr("height", d => volumeHeight - volumeY(d.volume))
        .attr("fill", d => d.close >= d.open ? "rgba(16, 185, 129, 0.5)" : "rgba(239, 68, 68, 0.5)");

      // Volume axis
      svg.append("g")
        .attr("transform", `translate(0,${height + volumeHeight + 10})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %d")))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick text")
          .attr("fill", theme === 'dark' ? "#94a3b8" : "#64748b"));
    }

    // Add zoom functionality
    const zoom = d3.zoom()
      .scaleExtent([1, 20])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", (event) => {
        const newX = event.transform.rescaleX(x);
        xAxis.call(d3.axisBottom(newX).tickFormat(d3.timeFormat("%b %d %H:%M")));
        
        svg.selectAll(".candle-group rect")
          .attr("x", d => newX(d.date) - candleWidth/2)
          .attr("width", candleWidth);
          
        svg.selectAll(".candle-group line")
          .attr("x1", d => newX(d.date))
          .attr("x2", d => newX(d.date));

        // Update indicator lines if present
        if (indicator === 'sma' || indicator === 'ema') {
          const line = d3.line()
            .x(d => newX(d.date))
            .y(d => y(d[indicator]))
            .curve(d3.curveMonotoneX);

          svg.select(".indicator-line")
            .attr("d", line);
        } else if (indicator === 'rsi' && rsiY) {
          const rsiLine = d3.line()
            .x(d => newX(d.date))
            .y(d => rsiY(d.rsi))
            .defined(d => d.rsi !== null)
            .curve(d3.curveMonotoneX);

          svg.select(".rsi-line")
            .attr("d", rsiLine);
        }

        // Update volume bars if present
        if (showVolume) {
          svg.selectAll(".volume-bar")
            .attr("x", d => newX(d.date) - candleWidth/2);
        }
      });
    
    svg.call(zoom);

    // Add crosshair
    const focus = svg.append("g")
      .attr("class", "focus")
      .style("display", "none");

    focus.append("line")
      .attr("class", "x-hair")
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", theme === 'dark' ? "#94a3b8" : "#64748b")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3");

    focus.append("line")
      .attr("class", "y-hair")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("stroke", theme === 'dark' ? "#94a3b8" : "#64748b")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3");

    // Create bisector for finding nearest data point
    const bisectDate = d3.bisector(d => d.date).left;

    svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", () => focus.style("display", null))
      .on("mouseout", () => {
        focus.style("display", "none");
        setHoverData(null);
      })
      .on("mousemove", (event) => {
        const [xPos] = d3.pointer(event);
        const date = x.invert(xPos);
        
        // Find nearest data point
        const i = bisectDate(chartData, date, 1);
        const d0 = chartData[i - 1];
        const d1 = chartData[i] || d0;
        const d = date - d0.date > d1.date - date ? d1 : d0;
        
        setHoverData(d);
        
        // Position crosshair
        focus.select(".x-hair")
          .attr("x1", x(d.date))
          .attr("x2", x(d.date));
          
        focus.select(".y-hair")
          .attr("y1", y(d.close))
          .attr("y2", y(d.close));
      });

  }, [chartData, indicator, showVolume, theme]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeframeChange = (tf) => {
    setTimeframe(tf);
    // Update days based on timeframe
    let days;
    switch(tf) {
      case '1D': days = 1; break;
      case '1W': days = 7; break;
      case '1M': days = 30; break;
      case '3M': days = 90; break;
      case '1Y': days = 365; break;
      default: days = 5;
    }
    setRequestData(prev => ({ ...prev, days: days.toString() }));
  };

  const handleWatchlistSelect = (item) => {
    setRequestData(prev => ({
      ...prev,
      security_id: item.security_id,
      exchange_segment: "NSE_EQ",
      instrument_type: "EQUITY"
    }));
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} p-4 md:p-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Header with theme toggle */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
              Stock Analisys
            </h1>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Advanced market data visualization and analysis
            </p>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        {/* Watchlist quick select */}
        <div className="mb-6">
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>QUICK SELECT</h3>
          <div className="flex flex-wrap gap-2">
            {watchlist.map(item => (
              <button
                key={item.security_id}
                onClick={() => handleWatchlistSelect(item)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${requestData.security_id === item.security_id 
                  ? 'bg-blue-600 text-white' 
                  : theme === 'dark' 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                {item.symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Control panel */}
        <div className={`rounded-lg shadow-lg p-6 mb-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold mb-1">
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Market Data</span>
                {loading && (
                  <span className="ml-3 text-sm font-normal text-blue-400 flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading data...
                  </span>
                )}
              </h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Configure and fetch market data for analysis
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {['1D', '1W', '1M', '3M', '1Y'].map(tf => (
                <button 
                  key={tf}
                  onClick={() => handleTimeframeChange(tf)} 
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${timeframe === tf 
                    ? 'bg-blue-600 text-white' 
                    : theme === 'dark' 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Security ID</label>
              <input
                type="text"
                name="security_id"
                value={requestData.security_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-md text-sm ${theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'} border`}
                placeholder="e.g. 4717"
              />
            </div>
            
            <div className="space-y-1">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Exchange</label>
              <select
                name="exchange_segment"
                value={requestData.exchange_segment}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-md text-sm ${theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'} border`}
              >
                <option value="NSE_EQ">NSE Equity</option>
                <option value="BSE_EQ">BSE Equity</option>
                <option value="NSE_FO">NSE F&O</option>
                <option value="BSE_FO">BSE F&O</option>
                <option value="MCX_FO">MCX Commodity</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Instrument</label>
              <select
                name="instrument_type"
                value={requestData.instrument_type}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-md text-sm ${theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'} border`}
              >
                <option value="EQUITY">Equity</option>
                <option value="FUTURE">Future</option>
                <option value="OPTION">Option</option>
                <option value="INDEX">Index</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Days</label>
              <input
                type="number"
                name="days"
                value={requestData.days}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-md text-sm ${theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'} border`}
                min="1"
                placeholder="e.g. 5"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={fetchData}
                disabled={loading}
                className={`w-full px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-all ${loading 
                  ? 'bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                Fetch Data
              </button>
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className={`p-4 mb-6 rounded-lg border flex items-start ${theme === 'dark' 
            ? 'bg-red-900 bg-opacity-50 text-red-100 border-red-700' 
            : 'bg-red-50 text-red-800 border-red-200'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-medium">Error fetching data</h3>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Chart display */}
        <div className={`rounded-lg shadow-lg p-6 mb-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div>
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {watchlist.find(item => item.security_id === requestData.security_id)?.symbol || requestData.security_id} - {timeframe} Chart
              </h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {watchlist.find(item => item.security_id === requestData.security_id)?.name || ''}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                value={indicator}
                onChange={(e) => setIndicator(e.target.value)}
                className={`px-3 py-1.5 rounded-md text-sm border ${theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="none">No Indicator</option>
                <option value="sma">SMA (14)</option>
                <option value="ema">EMA (14)</option>
                <option value="rsi">RSI (14)</option>
              </select>
              
              <button
                onClick={() => setShowVolume(!showVolume)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border ${showVolume 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : theme === 'dark' 
                    ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
              >
                {showVolume ? 'Hide Volume' : 'Show Volume'}
              </button>
            </div>
          </div>
          
          {/* Hover data display */}
          {hoverData && (
            <div className={`mb-4 p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <div className="grid grid-cols-4 gap-x-6 gap-y-1 text-sm">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Open:</span>
                <span className={hoverData.open > hoverData.close ? 'text-red-500' : 'text-green-500'}>
                  {hoverData.open.toFixed(2)}
                </span>
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>High:</span>
                <span className="text-green-500">{hoverData.high.toFixed(2)}</span>
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Close:</span>
                <span className={hoverData.close > hoverData.open ? 'text-green-500' : 'text-red-500'}>
                  {hoverData.close.toFixed(2)}
                </span>
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Low:</span>
                <span className="text-red-500">{hoverData.low.toFixed(2)}</span>
                {hoverData.volume && (
                  <>
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Volume:</span>
                    <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>
                      {hoverData.volume.toLocaleString()}
                    </span>
                  </>
                )}
                {hoverData[indicator] && (
                  <>
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{indicator.toUpperCase()}:</span>
                    <span className={indicator === 'rsi' 
                      ? (hoverData.rsi > 70 ? 'text-red-500' : hoverData.rsi < 30 ? 'text-green-500' : theme === 'dark' ? 'text-purple-400' : 'text-purple-600')
                      : theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>
                      {hoverData[indicator]?.toFixed(2)}
                    </span>
                  </>
                )}
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Date:</span>
                <span className="col-span-3">
                  {d3.timeFormat("%Y-%m-%d %H:%M")(hoverData.date)}
                </span>
              </div>
            </div>
          )}
          
          {/* Chart container */}
          <div 
            ref={chartRef} 
            className="w-full"
            style={{ 
              height: showVolume ? '600px' : '500px',
              minHeight: '500px',
              overflow: 'hidden'
            }}
          ></div>
          
          {chartData.length === 0 && !loading && (
            <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium">No chart data available</h3>
              <p className="mt-1">Submit a request to fetch market data</p>
            </div>
          )}
        </div>

        {/* Key statistics */}
        {chartData.length > 0 && (
          <div className={`rounded-lg shadow-lg p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Key Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-3 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Current Price</div>
                <div className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {chartData[chartData.length - 1].close.toFixed(2)}
                </div>
              </div>
              <div className={`p-3 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Today's Change</div>
                <div className={`text-xl font-semibold ${
                  chartData[chartData.length - 1].close >= chartData[chartData.length - 1].open 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`}>
                  {((chartData[chartData.length - 1].close - chartData[chartData.length - 1].open) / chartData[chartData.length - 1].open * 100).toFixed(2)}%
                </div>
              </div>
              <div className={`p-3 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Period High</div>
                <div className="text-xl font-semibold text-green-500">
                  {d3.max(chartData, d => d.high).toFixed(2)}
                </div>
              </div>
              <div className={`p-3 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Period Low</div>
                <div className="text-xl font-semibold text-red-500">
                  {d3.min(chartData, d => d.low).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockChart;