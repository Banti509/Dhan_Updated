

// import React, { useEffect, useState, useCallback, memo } from "react";
// import { io } from "socket.io-client";

// // WebSocket connection
// const socket = io("http://127.0.0.1:5000", {
//   transports: ["websocket"],
//   reconnectionAttempts: 5,
//   reconnectionDelay: 2000,
//   forceNew: true,
// });

// // Helper function to safely format numbers
// const formatPrice = (value) => {
//   if (typeof value === 'number') {
//     return value.toFixed(2);
//   }
//   if (typeof value === 'string' && !isNaN(parseFloat(value))) {
//     return parseFloat(value).toFixed(2);
//   }
//   return "N/A";
// };

// // Memoized Row Component with enhanced UI
// const OrderRow = memo(({ order, onSellTrigger, index }) => {
//   const currentPrice = order.latest_price ?? order.price;
//   const multiplier = order.transaction_type === "BUY" ? 1 : -1;
//   const pnl = ((parseFloat(currentPrice) - parseFloat(order.price)) * parseFloat(order.quantity)) * multiplier;
//   const pnlPercentage = (((parseFloat(currentPrice) - parseFloat(order.price)) / parseFloat(order.price)) * 100) * multiplier;
//   const isProfit = pnl >= 0;
//   const profitLoss = isProfit ? "Profit" : "Loss";
//   const rowClass = index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700';

//   // Check PnL thresholds and trigger sell
//   useEffect(() => {
//     if (order.transaction_type === "BUY") {
//       if (pnlPercentage >= 300.0 || pnlPercentage <= -150.0) {
//         onSellTrigger(order, pnlPercentage);
//       }
//     }
//   }, [pnlPercentage, order, onSellTrigger]);

//   return (
//     <tr className={`${rowClass} hover:bg-gray-600 transition-colors`}>
//       <td className="px-4 py-3 text-sm">{order.order_id ?? "N/A"}</td>
//       <td className="px-4 py-3 font-medium">{order.security_id ?? "N/A"}</td>
//       <td className="px-4 py-3">
//         <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
//           order.transaction_type === "BUY" ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
//         }`}>
//           {order.transaction_type ?? "N/A"}
//         </span>
//       </td>
//       <td className="px-4 py-3 text-sm">{order.product_type ?? "N/A"}</td>
//       <td className="px-4 py-3">{order.quantity ?? "N/A"}</td>
//       <td className="px-4 py-3">₹{formatPrice(order.price)}</td>
//       <td className="px-4 py-3 font-semibold text-yellow-400">₹{formatPrice(currentPrice)}</td>
//       <td className={`px-4 py-3 font-medium ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
//         ₹{pnl.toFixed(2)}
//       </td>
//       <td className={`px-4 py-3 font-medium ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
//         {pnlPercentage.toFixed(2)}%
//       </td>
//       <td className="px-4 py-3">
//         <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
//           isProfit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//         }`}>
//           {profitLoss}
//         </span>
//       </td>
//     </tr>
//   );
// });

// const PnlReport = () => {
//   const [pnlData, setPnlData] = useState([]);
//   const [livePrices, setLivePrices] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [timeframe, setTimeframe] = useState('1d');
//   const [stats, setStats] = useState({
//     totalInvested: 0,
//     currentValue: 0,
//     totalPnL: 0,
//     totalPnLPercentage: 0,
//     winningTrades: 0,
//     losingTrades: 0
//   });

//   // Calculate statistics whenever pnlData changes
//   useEffect(() => {
//     if (pnlData.length === 0) return;

//     const calculatedStats = pnlData.reduce((acc, order) => {
//       const currentPrice = parseFloat(order.latest_price ?? order.price);
//       const orderPrice = parseFloat(order.price);
//       const quantity = parseFloat(order.quantity);
//       const multiplier = order.transaction_type === "BUY" ? 1 : -1;
//       const pnl = (currentPrice - orderPrice) * quantity * multiplier;
//       const pnlPercentage = ((currentPrice - orderPrice) / orderPrice) * 100 * multiplier;

//       acc.totalInvested += orderPrice * quantity;
//       acc.currentValue += currentPrice * quantity;
//       acc.totalPnL += pnl;
//       acc.totalPnLPercentage += pnlPercentage;
      
//       if (pnl >= 0) acc.winningTrades++;
//       else acc.losingTrades++;

//       return acc;
//     }, {
//       totalInvested: 0,
//       currentValue: 0,
//       totalPnL: 0,
//       totalPnLPercentage: 0,
//       winningTrades: 0,
//       losingTrades: 0
//     });

//     setStats({
//       totalInvested: calculatedStats.totalInvested.toFixed(2),
//       currentValue: calculatedStats.currentValue.toFixed(2),
//       totalPnL: calculatedStats.totalPnL.toFixed(2),
//       totalPnLPercentage: (calculatedStats.totalPnLPercentage / pnlData.length).toFixed(2),
//       winningTrades: calculatedStats.winningTrades,
//       losingTrades: calculatedStats.losingTrades
//     });
//   }, [pnlData]);

//   // Fetch initial data from the API
//   const fetchInitialData = async () => {
//     try {
//       const response = await fetch(`http://127.0.0.1:5000/api/pnl-report?timeframe=${timeframe}`);
//       if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

//       const data = await response.json();
//       console.log("✅ Initial API Data:", data);

//       if (data.status === "success") {
//         const initialData = data.orders.map(order => ({
//           ...order,
//           price: parseFloat(order.price),
//           quantity: parseFloat(order.quantity),
//           latest_price: parseFloat(data.live_prices[order.security_id] ?? order.price),
//         }));
        
//         setPnlData(initialData);
//         setLivePrices(data.live_prices || {});
//       } else {
//         throw new Error(data.message || "Invalid API response structure.");
//       }
//     } catch (err) {
//       console.error("Error fetching initial data:", err);
//       setError(err.message || "Failed to fetch initial data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Trigger sell API call
//   const triggerSellOrder = useCallback(async (order, pnlPercentage) => {
//     try {
//       const sellPayload = {
//         security_id: order.security_id,
//         exchange_segment: order.exchange_segment || "NSE_EQ",
//         quantity: order.quantity,
//         order_type: "MARKET",
//         product_type: order.product_type || "CNC",
//         price: order.latest_price,
//       };
//       console.log(`🚀 Triggering sell for ${order.security_id} at ${pnlPercentage}%:`, sellPayload);

//       const response = await fetch("http://127.0.0.1:5000/api/place_sell_order", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(sellPayload),
//       });

//       if (response.status === 403) {
//         const result = await response.json();
//         console.log('Sell rejected:', result.message);
//         setError(result.message);
//         return;
//       }
      
//       if (!response.ok) throw new Error(`Sell API error! Status: ${response.status}`);
//       const result = await response.json();
//       console.log(`✅ Sell response for ${order.security_id}:`, result);

//       if (result.status === "success" || result.status === "offline") {
//         // Remove sold order from pnlData
//         setPnlData(prev => prev.filter(o => o.order_id !== order.order_id));
//       } else {
//         throw new Error(result.message || "Sell order failed");
//       }
//     } catch (err) {
//       console.error(`❌ Error triggering sell for ${order.security_id}:`, err);
//       setError(`Failed to sell ${order.security_id}: ${err.message}`);
//     }
//   }, []);

//   // Handle full PnL updates from WebSocket
//   const handlePnLUpdate = useCallback((data) => {
//     console.log("🔄 WebSocket PnL Update:", data);

//     if (!data) {
//       console.warn("❌ WebSocket data is null or undefined");
//       setError("WebSocket connection issue, using last valid data.");
//       return;
//     }

//     if (data.status === "error") {
//       console.log("ℹ️ No orders available from server:", data.message);
//       setError(data.message || "No orders available, waiting for data.");
//       setPnlData([]);
//       return;
//     }

//     if (data.status === "success" && data.message === "Connected to server" && !data.pnl_report) {
//       console.log("ℹ️ Connection established, awaiting full update...");
//       setLivePrices(prev => ({ ...prev, ...data.prices }));
//       setError(null);
//       return;
//     }

//     if (data.status !== "success" || !data.pnl_report || !Array.isArray(data.pnl_report)) {
//       console.error("❌ Invalid WebSocket data structure:", data);
//       setError("Invalid WebSocket data received, using last valid data.");
//       return;
//     }

//     setLivePrices(prev => ({
//       ...prev,
//       ...data.pnl_report.reduce((acc, order) => {
//         acc[order.security_id] = parseFloat(order.current_price);
//         return acc;
//       }, {}),
//     }));

//     setPnlData(prev => {
//       const newData = data.pnl_report.map(order => ({
//         order_id: order.order_id,
//         security_id: order.security_id,
//         transaction_type: order.transaction_type,
//         product_type: order.product_type || "N/A",
//         quantity: parseFloat(order.quantity),
//         price: parseFloat(order.entry_price),
//         latest_price: parseFloat(order.current_price ?? prev.find(o => o.security_id === order.security_id)?.latest_price ?? order.entry_price),
//       }));
//       return newData;
//     });

//     setError(null);
//   }, [livePrices]);

//   // Handle real-time LTP updates from WebSocket
//   const handleLtpUpdate = useCallback((data) => {
//     console.log("🔄 WebSocket LTP Update:", data);

//     if (data.status !== "success" || !data.security_id || typeof data.ltp !== "number") {
//       console.warn("❌ Invalid LTP update data:", data);
//       return;
//     }

//     setLivePrices(prev => {
//       return { ...prev, [data.security_id]: parseFloat(data.ltp) };
//     });

//     setPnlData(prev => {
//       const existingOrderIndex = prev.findIndex(order => order.security_id === data.security_id);
//       if (existingOrderIndex !== -1) {
//         const newData = [...prev];
//         newData[existingOrderIndex] = {
//           ...newData[existingOrderIndex],
//           latest_price: parseFloat(data.ltp),
//         };
//         return newData;
//       }
//       return prev;
//     });
//   }, []);

//   // Set up WebSocket listeners
//   useEffect(() => {
//     fetchInitialData();

//     console.log("✅ Setting up WebSocket listeners...");
//     socket.on("connect", () => console.log("✅ WebSocket Connected!", socket.id));
//     socket.on("disconnect", () => console.log("❌ WebSocket Disconnected!"));
//     socket.on("connect_error", (err) => console.error("❌ WebSocket Connection Error:", err));
//     socket.on("price_update", handlePnLUpdate);
//     socket.on("ltp_update", handleLtpUpdate);

//     return () => {
//       console.log("🛑 Cleaning up WebSocket listeners...");
//       socket.off("connect");
//       socket.off("disconnect");
//       socket.off("connect_error");
//       socket.off("price_update", handlePnLUpdate);
//       socket.off("ltp_update", handleLtpUpdate);
//     };
//   }, [handlePnLUpdate, handleLtpUpdate, timeframe]);

//   // Summary cards data
//   const summaryCards = [
//     {
//       title: "Invested Value",
//       value: `₹${stats.totalInvested}`,
//       change: "",
//       icon: "💰",
//       bgColor: "bg-blue-600"
//     },
//     {
//       title: "Current Value",
//       value: `₹${stats.currentValue}`,
//       change: "",
//       icon: "💹",
//       bgColor: "bg-purple-600"
//     },
//     {
//       title: "Total P&L",
//       value: `₹${stats.totalPnL}`,
//       change: `${stats.totalPnLPercentage}%`,
//       isProfit: parseFloat(stats.totalPnL) >= 0,
//       icon: "📊",
//       bgColor: parseFloat(stats.totalPnL) >= 0 ? "bg-green-600" : "bg-red-600"
//     },
//     {
//       title: "Win Rate",
//       value: `${pnlData.length > 0 ? Math.round((stats.winningTrades / pnlData.length) * 100) : 0}%`,
//       change: `${stats.winningTrades}W / ${stats.losingTrades}L`,
//       icon: "🏆",
//       bgColor: "bg-yellow-600"
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         <header className="mb-8">
//           <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">📈 Trading Dashboard</h1>
//           <div className="flex flex-wrap items-center justify-between gap-4">
//             <div className="flex space-x-2">
//               <select 
//                 value={timeframe}
//                 onChange={(e) => setTimeframe(e.target.value)}
//                 className="bg-gray-700 text-white rounded-lg px-3 py-2"
//               >
//                 <option value="1d">Today</option>
//                 <option value="7d">Week</option>
//                 <option value="30d">Month</option>
//                 <option value="90d">Quarter</option>
//                 <option value="365d">Year</option>
//               </select>
//             </div>
//           </div>
//         </header>

//         {error && (
//           <div className="mb-6 p-4 bg-red-600 rounded-lg text-white flex items-center">
//             <span className="mr-2">⚠️</span>
//             <span>{error}</span>
//           </div>
//         )}

//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           {summaryCards.map((card, index) => (
//             <div key={index} className={`${card.bgColor} rounded-lg p-4 shadow-lg`}>
//               <div className="flex justify-between items-start">
//                 <div>
//                   <p className="text-sm opacity-80">{card.title}</p>
//                   <p className="text-2xl font-bold mt-1">{card.value}</p>
//                   {card.change && (
//                     <p className={`text-sm mt-1 ${card.isProfit !== undefined ? 
//                       (card.isProfit ? 'text-green-200' : 'text-red-200') : 'text-white'}`}
//                     >
//                       {card.change}
//                     </p>
//                   )}
//                 </div>
//                 <span className="text-2xl">{card.icon}</span>
//               </div>
//             </div>
//           ))}
//         </div>

//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//           </div>
//         ) : (
//           <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-700">
//                 <thead className="bg-gray-700">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order ID</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Symbol</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Product</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Qty</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Entry</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">LTP</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">P&L</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">P&L %</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-700">
//                   {pnlData.length > 0 ? (
//                     pnlData.map((order, index) => (
//                       <OrderRow 
//                         key={order.order_id} 
//                         order={order} 
//                         onSellTrigger={triggerSellOrder}
//                         index={index}
//                       />
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="10" className="px-4 py-6 text-center text-gray-400">
//                         No active positions found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PnlReport;










// import React, { useEffect, useState, useCallback, memo } from "react";
// import { io } from "socket.io-client";

// // WebSocket connection
// const socket = io("http://127.0.0.1:5000", {
//   transports: ["websocket"],
//   reconnectionAttempts: 5,
//   reconnectionDelay: 2000,
//   forceNew: true,
// });

// // Helper function to safely format numbers
// const formatPrice = (value) => {
//   if (typeof value === 'number') {
//     return value.toFixed(2);
//   }
//   if (typeof value === 'string' && !isNaN(parseFloat(value))) {
//     return parseFloat(value).toFixed(2);
//   }
//   return "N/A";
// };

// // Memoized Row Component with enhanced UI
// const OrderRow = memo(({ order, onSellTrigger, index }) => {
//   const currentPrice = order.latest_price ?? order.price;
//   const multiplier = order.transaction_type === "BUY" ? 1 : -1;
//   const pnl = ((parseFloat(currentPrice) - parseFloat(order.price)) * parseFloat(order.quantity)) * multiplier;
//   const pnlPercentage = (((parseFloat(currentPrice) - parseFloat(order.price)) / parseFloat(order.price)) * 100) * multiplier;
//   const isProfit = pnl >= 0;
//   const profitLoss = isProfit ? "Profit" : "Loss";
//   const rowClass = index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700';

//   // Check PnL thresholds and trigger sell
//   useEffect(() => {
//     if (order.transaction_type === "BUY") {
//       if (pnlPercentage >= 300.0 || pnlPercentage <= -150.0) {
//         onSellTrigger(order, pnlPercentage);
//       }
//     }
//   }, [pnlPercentage, order, onSellTrigger]);

//   return (
//     <tr className={`${rowClass} hover:bg-gray-600 transition-colors`}>
//       <td className="px-4 py-3 text-sm">{order.order_id ?? "N/A"}</td>
//       <td className="px-4 py-3 text-sm">{order.order_symbol ?? "N/A"}</td>
//       <td className="px-4 py-3">
//         <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
//           order.transaction_type === "BUY" ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
//         }`}>
//           {order.transaction_type ?? "N/A"}
//         </span>
//       </td>
//       <td className="px-4 py-3 text-sm">{order.product_type ?? "N/A"}</td>
//       <td className="px-4 py-3">{order.quantity ?? "N/A"}</td>
//       <td className="px-4 py-3">₹{formatPrice(order.price)}</td>
//       <td className="px-4 py-3 font-semibold text-yellow-400">₹{formatPrice(currentPrice)}</td>
//       <td className={`px-4 py-3 font-medium ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
//         ₹{pnl.toFixed(2)}
//       </td>
//       <td className={`px-4 py-3 font-medium ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
//         {pnlPercentage.toFixed(2)}%
//       </td>
//       <td className="px-4 py-3">
//         <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
//           isProfit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//         }`}>
//           {profitLoss}
//         </span>
//       </td>
//     </tr>
//   );
// });

// const PnlReport = () => {
//   const [pnlData, setPnlData] = useState([]);
//   const [livePrices, setLivePrices] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [timeframe, setTimeframe] = useState('1d');
//   const [stats, setStats] = useState({
//     totalInvested: 0,
//     currentValue: 0,
//     totalPnL: 0,
//     totalPnLPercentage: 0,
//     winningTrades: 0,
//     losingTrades: 0
//   });

//   // Calculate statistics whenever pnlData changes
//   useEffect(() => {
//     if (pnlData.length === 0) return;

//     const calculatedStats = pnlData.reduce((acc, order) => {
//       const currentPrice = parseFloat(order.latest_price ?? order.price);
//       const orderPrice = parseFloat(order.price);
//       const quantity = parseFloat(order.quantity);
//       const multiplier = order.transaction_type === "BUY" ? 1 : -1;
//       const pnl = (currentPrice - orderPrice) * quantity * multiplier;
//       const pnlPercentage = ((currentPrice - orderPrice) / orderPrice) * 100 * multiplier;

//       acc.totalInvested += orderPrice * quantity;
//       acc.currentValue += currentPrice * quantity;
//       acc.totalPnL += pnl;
//       acc.totalPnLPercentage += pnlPercentage;
      
//       if (pnl >= 0) acc.winningTrades++;
//       else acc.losingTrades++;

//       return acc;
//     }, {
//       totalInvested: 0,
//       currentValue: 0,
//       totalPnL: 0,
//       totalPnLPercentage: 0,
//       winningTrades: 0,
//       losingTrades: 0
//     });

//     setStats({
//       totalInvested: calculatedStats.totalInvested.toFixed(2),
//       currentValue: calculatedStats.currentValue.toFixed(2),
//       totalPnL: calculatedStats.totalPnL.toFixed(2),
//       totalPnLPercentage: (calculatedStats.totalPnLPercentage / pnlData.length).toFixed(2),
//       winningTrades: calculatedStats.winningTrades,
//       losingTrades: calculatedStats.losingTrades
//     });
//   }, [pnlData]);

//   // Fetch initial data from the API
//   const fetchInitialData = async () => {
//     try {
//       const response = await fetch(`http://127.0.0.1:5000/api/pnl-report?timeframe=${timeframe}`);
//       if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

//       const data = await response.json();
//       console.log("✅ Initial API Data:", data);

//       if (data.status === "success") {
//         const initialData = data.orders.map(order => ({
//           ...order,
//           price: parseFloat(order.price),
//           quantity: parseFloat(order.quantity),
//           latest_price: parseFloat(data.live_prices[order.security_id] ?? order.price),
//         }));
        
//         setPnlData(initialData);
//         setLivePrices(data.live_prices || {});
//       } else {
//         throw new Error(data.message || "Invalid API response structure.");
//       }
//     } catch (err) {
//       console.error("Error fetching initial data:", err);
//       setError(err.message || "Failed to fetch initial data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Trigger sell API call
//   const triggerSellOrder = useCallback(async (order, pnlPercentage) => {
//     try {
//       const sellPayload = {
//         security_id: order.security_id,
//         exchange_segment: order.exchange_segment || "NSE_EQ",
//         quantity: order.quantity,
//         order_type: "MARKET",
//         product_type: order.product_type || "CNC",
//         price: order.latest_price,
//       };
//       console.log(`🚀 Triggering sell for ${order.security_id} at ${pnlPercentage}%:`, sellPayload);

//       const response = await fetch("http://127.0.0.1:5000/api/place_sell_order", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(sellPayload),
//       });

//       if (response.status === 403) {
//         const result = await response.json();
//         console.log('Sell rejected:', result.message);
//         setError(result.message);
//         return;
//       }
      
//       if (!response.ok) throw new Error(`Sell API error! Status: ${response.status}`);
//       const result = await response.json();
//       console.log(`✅ Sell response for ${order.security_id}:`, result);

//       if (result.status === "success" || result.status === "offline") {
//         // Remove sold order from pnlData
//         setPnlData(prev => prev.filter(o => o.order_id !== order.order_id));
//       } else {
//         throw new Error(result.message || "Sell order failed");
//       }
//     } catch (err) {
//       console.error(`❌ Error triggering sell for ${order.security_id}:`, err);
//       setError(`Failed to sell ${order.security_id}: ${err.message}`);
//     }
//   }, []);

//   // Handle full PnL updates from WebSocket
//   const handlePnLUpdate = useCallback((data) => {
//     console.log("🔄 WebSocket PnL Update:", data);

//     if (!data) {
//       console.warn("❌ WebSocket data is null or undefined");
//       setError("WebSocket connection issue, using last valid data.");
//       return;
//     }

//     if (data.status === "error") {
//       console.log("ℹ️ No orders available from server:", data.message);
//       setError(data.message || "No orders available, waiting for data.");
//       setPnlData([]);
//       return;
//     }

//     if (data.status === "success" && data.message === "Connected to server" && !data.pnl_report) {
//       console.log("ℹ️ Connection established, awaiting full update...");
//       setLivePrices(prev => ({ ...prev, ...data.prices }));
//       setError(null);
//       return;
//     }

//     if (data.status !== "success" || !data.pnl_report || !Array.isArray(data.pnl_report)) {
//       console.error("❌ Invalid WebSocket data structure:", data);
//       setError("Invalid WebSocket data received, using last valid data.");
//       return;
//     }

//     setLivePrices(prev => ({
//       ...prev,
//       ...data.pnl_report.reduce((acc, order) => {
//         acc[order.security_id] = parseFloat(order.current_price);
//         return acc;
//       }, {}),
//     }));

//     setPnlData(prev => {
//       const newData = data.pnl_report.map(order => ({
//         order_id: order.order_id,
//         security_id: order.security_id,
//         transaction_type: order.transaction_type,
//         product_type: order.product_type || "N/A",
//         quantity: parseFloat(order.quantity),
//         price: parseFloat(order.entry_price),
//         latest_price: parseFloat(order.current_price ?? prev.find(o => o.security_id === order.security_id)?.latest_price ?? order.entry_price),
//       }));
//       return newData;
//     });

//     setError(null);
//   }, [livePrices]);

//   // Handle real-time LTP updates from WebSocket
//   const handleLtpUpdate = useCallback((data) => {
//     console.log("🔄 WebSocket LTP Update:", data);

//     if (data.status !== "success" || !data.security_id || typeof data.ltp !== "number") {
//       console.warn("❌ Invalid LTP update data:", data);
//       return;
//     }

//     setLivePrices(prev => {
//       return { ...prev, [data.security_id]: parseFloat(data.ltp) };
//     });

//     setPnlData(prev => {
//       const existingOrderIndex = prev.findIndex(order => order.security_id === data.security_id);
//       if (existingOrderIndex !== -1) {
//         const newData = [...prev];
//         newData[existingOrderIndex] = {
//           ...newData[existingOrderIndex],
//           latest_price: parseFloat(data.ltp),
//         };
//         return newData;
//       }
//       return prev;
//     });
//   }, []);

//   // Set up WebSocket listeners
//   useEffect(() => {
//     fetchInitialData();

//     console.log("✅ Setting up WebSocket listeners...");
//     socket.on("connect", () => console.log("✅ WebSocket Connected!", socket.id));
//     socket.on("disconnect", () => console.log("❌ WebSocket Disconnected!"));
//     socket.on("connect_error", (err) => console.error("❌ WebSocket Connection Error:", err));
//     socket.on("price_update", handlePnLUpdate);
//     socket.on("ltp_update", handleLtpUpdate);

//     return () => {
//       console.log("🛑 Cleaning up WebSocket listeners...");
//       socket.off("connect");
//       socket.off("disconnect");
//       socket.off("connect_error");
//       socket.off("price_update", handlePnLUpdate);
//       socket.off("ltp_update", handleLtpUpdate);
//     };
//   }, [handlePnLUpdate, handleLtpUpdate, timeframe]);

//   // Summary cards data
//   const summaryCards = [
//     {
//       title: "Invested Value",
//       value: `₹${stats.totalInvested}`,
//       change: "",
//       icon: "💰",
//       bgColor: "bg-blue-600"
//     },
//     {
//       title: "Current Value",
//       value: `₹${stats.currentValue}`,
//       change: "",
//       icon: "💹",
//       bgColor: "bg-purple-600"
//     },
//     {
//       title: "Total P&L",
//       value: `₹${stats.totalPnL}`,
//       change: `${stats.totalPnLPercentage}%`,
//       isProfit: parseFloat(stats.totalPnL) >= 0,
//       icon: "📊",
//       bgColor: parseFloat(stats.totalPnL) >= 0 ? "bg-green-600" : "bg-red-600"
//     },
//     {
//       title: "Win Rate",
//       value: `${pnlData.length > 0 ? Math.round((stats.winningTrades / pnlData.length) * 100) : 0}%`,
//       change: `${stats.winningTrades}W / ${stats.losingTrades}L`,
//       icon: "🏆",
//       bgColor: "bg-yellow-600"
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         <header className="mb-8">
//           <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">📈 Trading Dashboard</h1>
//           <div className="flex flex-wrap items-center justify-between gap-4">
//             <div className="flex space-x-2">
//               <select 
//                 value={timeframe}
//                 onChange={(e) => setTimeframe(e.target.value)}
//                 className="bg-gray-700 text-white rounded-lg px-3 py-2"
//               >
//                 <option value="1d">Today</option>
//                 <option value="7d">Week</option>
//                 <option value="30d">Month</option>
//                 <option value="90d">Quarter</option>
//                 <option value="365d">Year</option>
//               </select>
//             </div>
//           </div>
//         </header>

//         {error && (
//           <div className="mb-6 p-4 bg-red-600 rounded-lg text-white flex items-center">
//             <span className="mr-2">⚠️</span>
//             <span>{error}</span>
//           </div>
//         )}

//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           {summaryCards.map((card, index) => (
//             <div key={index} className={`${card.bgColor} rounded-lg p-4 shadow-lg`}>
//               <div className="flex justify-between items-start">
//                 <div>
//                   <p className="text-sm opacity-80">{card.title}</p>
//                   <p className="text-2xl font-bold mt-1">{card.value}</p>
//                   {card.change && (
//                     <p className={`text-sm mt-1 ${card.isProfit !== undefined ? 
//                       (card.isProfit ? 'text-green-200' : 'text-red-200') : 'text-white'}`}
//                     >
//                       {card.change}
//                     </p>
//                   )}
//                 </div>
//                 <span className="text-2xl">{card.icon}</span>
//               </div>
//             </div>
//           ))}
//         </div>

//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//           </div>
//         ) : (
//           <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-700">
//                 <thead className="bg-gray-700">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order ID</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Symbol</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Product</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Qty</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Entry</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">LTP</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">P&L</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">P&L %</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-700">
//                   {pnlData.length > 0 ? (
//                     pnlData.map((order, index) => (
//                       <OrderRow 
//                         key={order.order_id} 
//                         order={order} 
//                         onSellTrigger={triggerSellOrder}
//                         index={index}
//                       />
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="10" className="px-4 py-6 text-center text-gray-400">
//                         No active positions found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PnlReport;






import React, { useEffect, useState, useCallback, memo } from "react";
import { io } from "socket.io-client";

// WebSocket connection
const socket = io("http://127.0.0.1:5000", {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  forceNew: true,
});

// Helper function to safely format numbers
const formatPrice = (value) => {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  if (typeof value === 'string' && !isNaN(parseFloat(value))) {
    return parseFloat(value).toFixed(2);
  }
  return "N/A";
};

// Memoized Row Component
const OrderRow = memo(({ order, onSellTrigger, index }) => {
  const currentPrice = order.latest_price ?? order.price;
  const multiplier = order.transaction_type === "BUY" ? 1 : -1;
  const pnl = ((parseFloat(currentPrice) - parseFloat(order.price)) * parseFloat(order.quantity)) * multiplier;
  const pnlPercentage = (((parseFloat(currentPrice) - parseFloat(order.price)) / parseFloat(order.price)) * 100) * multiplier;
  const isProfit = pnl >= 0;
  const profitLoss = isProfit ? "Profit" : "Loss";
  const rowClass = index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700';

  useEffect(() => {
    if (order.transaction_type === "BUY") {
      if (pnlPercentage >= 300.0 || pnlPercentage <= -150.0) {
        onSellTrigger(order, pnlPercentage);
      }
    }
  }, [pnlPercentage, order, onSellTrigger]);

  return (
    <tr className={`${rowClass} hover:bg-gray-600 transition-colors`}>
      <td className="px-4 py-3 text-sm">{order.order_id ?? "N/A"}</td>
      <td className="px-4 py-3 text-sm">{order.order_symbol ?? "N/A"}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
          order.transaction_type === "BUY" ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
        }`}>
          {order.transaction_type ?? "N/A"}
        </span>
      </td>
      <td className="px-4 py-3 text-sm">{order.product_type ?? "N/A"}</td>
      <td className="px-4 py-3">{order.quantity ?? "N/A"}</td>
      <td className="px-4 py-3">₹{formatPrice(order.price)}</td>
      <td className="px-4 py-3 font-semibold text-yellow-400">₹{formatPrice(currentPrice)}</td>
      <td className={`px-4 py-3 font-medium ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
        ₹{pnl.toFixed(2)}
      </td>
      <td className={`px-4 py-3 font-medium ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
        {pnlPercentage.toFixed(2)}%
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
          isProfit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {profitLoss}
        </span>
      </td>
    </tr>
  );
});

const PnlReport = () => {
  const [pnlData, setPnlData] = useState([]);
  const [livePrices, setLivePrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('1d');
  const [stats, setStats] = useState({
    totalInvested: 0,
    currentValue: 0,
    totalPnL: 0,
    totalPnLPercentage: 0,
    winningTrades: 0,
    losingTrades: 0
  });

  useEffect(() => {
    if (pnlData.length === 0) return;

    const calculatedStats = pnlData.reduce((acc, order) => {
      const currentPrice = parseFloat(order.latest_price ?? order.price);
      const orderPrice = parseFloat(order.price);
      const quantity = parseFloat(order.quantity);
      const multiplier = order.transaction_type === "BUY" ? 1 : -1;
      const pnl = (currentPrice - orderPrice) * quantity * multiplier;
      const pnlPercentage = ((currentPrice - orderPrice) / orderPrice) * 100 * multiplier;

      acc.totalInvested += orderPrice * quantity;
      acc.currentValue += currentPrice * quantity;
      acc.totalPnL += pnl;
      acc.totalPnLPercentage += pnlPercentage;
      
      if (pnl >= 0) acc.winningTrades++;
      else acc.losingTrades++;

      return acc;
    }, {
      totalInvested: 0,
      currentValue: 0,
      totalPnL: 0,
      totalPnLPercentage: 0,
      winningTrades: 0,
      losingTrades: 0
    });

    setStats({
      totalInvested: calculatedStats.totalInvested.toFixed(2),
      currentValue: calculatedStats.currentValue.toFixed(2),
      totalPnL: calculatedStats.totalPnL.toFixed(2),
      totalPnLPercentage: (calculatedStats.totalPnLPercentage / pnlData.length).toFixed(2),
      winningTrades: calculatedStats.winningTrades,
      losingTrades: calculatedStats.losingTrades
    });
  }, [pnlData]);

  const fetchInitialData = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/pnl-report?timeframe=${timeframe}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      console.log("✅ Initial API Data:", data);

      if (data.status === "success") {
        const initialData = data.orders.map(order => ({
          order_id: order.order_id,
          security_id: order.security_id,
          order_symbol: order.order_symbol,  // Add order_symbol
          transaction_type: order.transaction_type,
          product_type: order.product_type || "N/A",
          price: parseFloat(order.price),
          quantity: parseFloat(order.quantity),
          latest_price: parseFloat(data.live_prices[order.security_id] ?? order.price),
        }));
        
        setPnlData(initialData);
        setLivePrices(data.live_prices || {});
      } else {
        throw new Error(data.message || "Invalid API response structure.");
      }
    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError(err.message || "Failed to fetch initial data.");
    } finally {
      setLoading(false);
    }
  };

  const triggerSellOrder = useCallback(async (order, pnlPercentage) => {
    try {
      const sellPayload = {
        security_id: order.security_id,
        exchange_segment: order.exchange_segment || "NSE_EQ",
        quantity: order.quantity,
        order_type: "MARKET",
        product_type: order.product_type || "CNC",
        price: order.latest_price,
        order_symbol: order.order_symbol  // Include order_symbol for consistency
      };
      console.log(`🚀 Triggering sell for ${order.order_symbol} at ${pnlPercentage}%:`, sellPayload);

      const response = await fetch("http://127.0.0.1:5000/api/place_sell_order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sellPayload),
      });

      if (response.status === 403) {
        const result = await response.json();
        console.log('Sell rejected:', result.message);
        setError(result.message);
        return;
      }
      
      if (!response.ok) throw new Error(`Sell API error! Status: ${response.status}`);
      const result = await response.json();
      console.log(`✅ Sell response for ${order.order_symbol}:`, result);

      if (result.status === "success" || result.status === "offline") {
        setPnlData(prev => prev.filter(o => o.order_id !== order.order_id));
      } else {
        throw new Error(result.message || "Sell order failed");
      }
    } catch (err) {
      console.error(`❌ Error triggering sell for ${order.order_symbol}:`, err);
      setError(`Failed to sell ${order.order_symbol}: ${err.message}`);
    }
  }, []);

  const handlePnLUpdate = useCallback((data) => {
    console.log("🔄 WebSocket PnL Update:", data);

    if (!data) {
      console.warn("❌ WebSocket data is null or undefined");
      setError("WebSocket connection issue, using last valid data.");
      return;
    }

    if (data.status === "error") {
      console.log("ℹ️ No orders available from server:", data.message);
      setError(data.message || "No orders available, waiting for data.");
      setPnlData([]);
      return;
    }

    if (data.status === "success" && data.message === "Connected to server" && !data.pnl_report) {
      console.log("ℹ️ Connection established, awaiting full update...");
      setLivePrices(prev => ({ ...prev, ...data.prices }));
      setError(null);
      return;
    }

    if (data.status !== "success" || !data.pnl_report || !Array.isArray(data.pnl_report)) {
      console.error("❌ Invalid WebSocket data structure:", data);
      setError("Invalid WebSocket data received, using last valid data.");
      return;
    }

    setLivePrices(prev => ({
      ...prev,
      ...data.pnl_report.reduce((acc, order) => {
        acc[order.security_id] = parseFloat(order.current_price);
        return acc;
      }, {}),
    }));

    setPnlData(prev => {
      const newData = data.pnl_report.map(order => ({
        order_id: order.order_id,
        security_id: order.security_id,
        order_symbol: order.order_symbol,  // Add order_symbol
        transaction_type: order.transaction_type,
        product_type: order.product_type || "N/A",
        quantity: parseFloat(order.quantity),
        price: parseFloat(order.entry_price),
        latest_price: parseFloat(order.current_price ?? prev.find(o => o.security_id === order.security_id)?.latest_price ?? order.entry_price),
      }));
      return newData;
    });

    setError(null);
  }, []);

  const handleLtpUpdate = useCallback((data) => {
    console.log("🔄 WebSocket LTP Update:", data);

    if (data.status !== "success" || !data.security_id || typeof data.ltp !== "number") {
      console.warn("❌ Invalid LTP update data:", data);
      return;
    }

    setLivePrices(prev => ({
      ...prev,
      [data.security_id]: parseFloat(data.ltp)
    }));

    setPnlData(prev => {
      const existingOrderIndex = prev.findIndex(order => order.security_id === data.security_id);
      if (existingOrderIndex !== -1) {
        const newData = [...prev];
        newData[existingOrderIndex] = {
          ...newData[existingOrderIndex],
          latest_price: parseFloat(data.ltp),
        };
        return newData;
      }
      return prev;
    });
  }, [livePrices]);

  useEffect(() => {
    fetchInitialData();

    console.log("✅ Setting up WebSocket listeners...");
    socket.on("connect", () => console.log("✅ WebSocket Connected!", socket.id));
    socket.on("disconnect", () => console.log("❌ WebSocket Disconnected!"));
    socket.on("connect_error", (err) => console.error("❌ WebSocket Connection Error:", err));
    socket.on("price_update", handlePnLUpdate);
    socket.on("ltp_update", handleLtpUpdate);

    return () => {
      console.log("🛑 Cleaning up WebSocket listeners...");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("price_update", handlePnLUpdate);
      socket.off("ltp_update", handleLtpUpdate);
    };
  }, [handlePnLUpdate, handleLtpUpdate, timeframe]);

  const summaryCards = [
    {
      title: "Invested Value",
      value: `₹${stats.totalInvested}`,
      change: "",
      icon: "💰",
      bgColor: "bg-blue-600"
    },
    {
      title: "Current Value",
      value: `₹${stats.currentValue}`,
      change: "",
      icon: "💹",
      bgColor: "bg-purple-600"
    },
    {
      title: "Total P&L",
      value: `₹${stats.totalPnL}`,
      change: `${stats.totalPnLPercentage}%`,
      isProfit: parseFloat(stats.totalPnL) >= 0,
      icon: "📊",
      bgColor: parseFloat(stats.totalPnL) >= 0 ? "bg-green-600" : "bg-red-600"
    },
    {
      title: "Win Rate",
      value: `${pnlData.length > 0 ? Math.round((stats.winningTrades / pnlData.length) * 100) : 0}%`,
      change: `${stats.winningTrades}W / ${stats.losingTrades}L`,
      icon: "🏆",
      bgColor: "bg-yellow-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">📈 Trading Dashboard</h1>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex space-x-2">
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="bg-gray-700 text-white rounded-lg px-3 py-2"
              >
                <option value="1d">Today</option>
                <option value="7d">Week</option>
                <option value="30d">Month</option>
                <option value="90d">Quarter</option>
                <option value="365d">Year</option>
              </select>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-600 rounded-lg text-white flex items-center">
            <span className="mr-2">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryCards.map((card, index) => (
            <div key={index} className={`${card.bgColor} rounded-lg p-4 shadow-lg`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-80">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                  {card.change && (
                    <p className={`text-sm mt-1 ${card.isProfit !== undefined ? 
                      (card.isProfit ? 'text-green-200' : 'text-red-200') : 'text-white'}`}
                    >
                      {card.change}
                    </p>
                  )}
                </div>
                <span className="text-2xl">{card.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Symbol</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Entry</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">LTP</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">P&L</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">P&L %</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {pnlData.length > 0 ? (
                    pnlData.map((order, index) => (
                      <OrderRow 
                        key={order.order_id} 
                        order={order} 
                        onSellTrigger={triggerSellOrder}
                        index={index}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="px-4 py-6 text-center text-gray-400">
                        No active positions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PnlReport;