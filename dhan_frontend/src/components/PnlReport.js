

// import React, { useEffect, useState, useCallback } from "react";
// import { io } from "socket.io-client";

// const socket = io("http://127.0.0.1:5000", {
//     transports: ["websocket"],
//     reconnectionAttempts: 5,
//     reconnectionDelay: 2000,
//     forceNew: true,
// });

// const PnlReport = () => {
//     const [pnlData, setPnlData] = useState([]);
//     const [livePrices, setLivePrices] = useState({});
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // Fetch initial data from the API
//     const fetchInitialData = async () => {
//         try {
//             const response = await fetch("http://127.0.0.1:5000/api/pnl-report");
//             if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

//             const data = await response.json();
//             console.log("✅ Initial API Data:", JSON.stringify(data, null, 2));

//             if (data.status === "success") {
//                 const initialData = data.orders.map(order => ({
//                     ...order,
//                     latest_price: data.live_prices[order.security_id] ?? order.price,
//                 }));
//                 setPnlData(initialData);
//                 setLivePrices(data.live_prices || {});
//             } else {
//                 throw new Error("Invalid API response structure.");
//             }
//         } catch (err) {
//             console.error("Error fetching initial data:", err);
//             setError("Failed to fetch initial data.");
//         }
//         setLoading(false);
//     };

//     // Handle full PnL updates from WebSocket
//     const handlePnLUpdate = useCallback((data) => {
//         console.log("🔄 WebSocket PnL Update:", JSON.stringify(data, null, 2));

//         if (!data) {
//             console.warn("❌ WebSocket data is null or undefined");
//             setError("WebSocket connection issue, using last valid data.");
//             return;
//         }

//         if (data.status === "error") {
//             console.log("ℹ️ No orders available from server:", data.message);
//             setError(data.message || "No orders available, waiting for data.");
//             setPnlData([]);
//             return;
//         }

//         if (data.status === "success" && data.message === "Connected to server" && !data.pnl_report) {
//             console.log("ℹ️ Connection established, awaiting full update...");
//             setLivePrices(prev => ({ ...prev, ...data.prices }));
//             setError(null);
//             return;
//         }

//         if (data.status !== "success" || !data.pnl_report || !Array.isArray(data.pnl_report)) {
//             console.error("❌ Invalid WebSocket data structure:", data);
//             setError("Invalid WebSocket data received, using last valid data.");
//             return;
//         }

//         const updatedPrices = data.pnl_report.reduce((acc, order) => {
//             acc[order.security_id] = order.current_price;
//             return acc;
//         }, {});

//         setLivePrices(prev => ({ ...prev, ...updatedPrices }));

//         setPnlData(prev => {
//             const newData = data.pnl_report.map(order => ({
//                 order_id: order.order_id,
//                 security_id: order.security_id,
//                 transaction_type: order.transaction_type,
//                 product_type: order.product_type || "N/A",
//                 quantity: order.quantity,
//                 price: order.entry_price,
//                 latest_price: order.current_price ?? livePrices[order.security_id] ?? order.entry_price,
//             }));
//             console.log("✅ Updated PnL Data from PnL Update:", JSON.stringify(newData, null, 2));
//             return newData;
//         });

//         setError(null);
//     }, [livePrices]);

//     // Handle real-time LTP updates from WebSocket
//     const handleLtpUpdate = useCallback((data) => {
//         console.log("🔄 WebSocket LTP Update:", JSON.stringify(data, null, 2));

//         if (data.status !== "success" || !data.security_id || typeof data.ltp !== "number") {
//             console.warn("❌ Invalid LTP update data:", data);
//             return;
//         }

//         // Update livePrices
//         setLivePrices(prev => {
//             const newPrices = { ...prev, [data.security_id]: data.ltp };
//             console.log("✅ Updated Live Prices:", JSON.stringify(newPrices, null, 2));
//             return newPrices;
//         });

//         // Update or initialize pnlData
//         setPnlData(prev => {
//             const existingOrderIndex = prev.findIndex(order => order.security_id === data.security_id);
//             let newData;
//             if (existingOrderIndex !== -1) {
//                 // Update existing order
//                 newData = [...prev];
//                 newData[existingOrderIndex] = {
//                     ...newData[existingOrderIndex],
//                     latest_price: data.ltp,
//                 };
//             } else {
//                 // Initialize a new temporary order
//                 newData = [
//                     ...prev,
//                     {
//                         order_id: `temp-${data.security_id}`,
//                         security_id: data.security_id,
//                         transaction_type: "N/A",
//                         product_type: "N/A",
//                         quantity: 1, // Placeholder
//                         price: data.ltp, // Use LTP as initial price
//                         latest_price: data.ltp,
//                     },
//                 ];
//             }
//             console.log("✅ Updated PnL Data with LTP:", JSON.stringify(newData, null, 2));
//             return newData;
//         });
//     }, []);

//     // Set up WebSocket listeners and simulate LTP updates (for testing)
//     useEffect(() => {
//         fetchInitialData();

//         console.log("✅ Setting up WebSocket listeners...");
//         socket.on("connect", () => console.log("✅ WebSocket Connected!", socket.id));
//         socket.on("disconnect", () => console.log("❌ WebSocket Disconnected!"));
//         socket.on("connect_error", (err) => console.error("❌ WebSocket Connection Error:", err));
//         socket.on("price_update", handlePnLUpdate);
//         socket.on("ltp_update", handleLtpUpdate);

//         // Simulate LTP updates for testing (remove this in production if backend is sending data)
//         const simulateLtp = setInterval(() => {
//             const mockLtp = {
//                 status: "success",
//                 security_id: "123", // Replace with a real security_id from your data
//                 ltp: Math.random() * 100 + 100, // Random price between 100 and 200
//             };
//             handleLtpUpdate(mockLtp);
//         }, 2000);

//         return () => {
//             console.log("🛑 Cleaning up WebSocket listeners...");
//             socket.off("connect");
//             socket.off("disconnect");
//             socket.off("connect_error");
//             socket.off("price_update", handlePnLUpdate);
//             socket.off("ltp_update", handleLtpUpdate);
//             clearInterval(simulateLtp); // Clean up simulation
//         };
//     }, [handlePnLUpdate, handleLtpUpdate]);

//     // Calculate total PnL and percentage
//     const totalPnL = pnlData.reduce((sum, order) => {
//         const currentPrice = order.latest_price ?? order.price;
//         const multiplier = order.transaction_type === "BUY" ? 1 : -1;
//         return sum + (currentPrice - order.price) * order.quantity * multiplier;
//     }, 0).toFixed(2);

//     const totalPnLPercentage = pnlData.reduce((sum, order) => {
//         const currentPrice = order.latest_price ?? order.price;
//         const multiplier = order.transaction_type === "BUY" ? 1 : -1;
//         return sum + (((currentPrice - order.price) / order.price) * 100) * multiplier;
//     }, 0).toFixed(2);

//     return (
//         <div className="p-6 bg-gray-900 min-h-screen flex flex-col items-center text-white">
//             <h2 className="text-2xl font-bold mb-4">📊 Live P&L Report</h2>
//             {loading ? (
//                 <p className="text-gray-300">Fetching data...</p>
//             ) : (
//                 <>
//                     {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}
//                     {pnlData.length === 0 ? (
//                         <p className="text-gray-500">No orders available yet. Waiting for LTP or PnL updates...</p>
//                     ) : (
//                         <div className="w-full max-w-5xl bg-gray-800 shadow-md rounded-lg overflow-hidden">
//                             <div className="overflow-x-auto">
//                                 <table className="w-full text-sm text-gray-300">
//                                     <thead className="bg-blue-600 text-white uppercase text-xs">
//                                         <tr>
//                                             <th className="px-4 py-2">Order ID</th>
//                                             <th className="px-4 py-2">Security ID</th>
//                                             <th className="px-4 py-2">Transaction Type</th>
//                                             <th className="px-4 py-2">Product Type</th>
//                                             <th className="px-4 py-2">Quantity</th>
//                                             <th className="px-4 py-2">Entry Price</th>
//                                             <th className="px-4 py-2">Latest Price</th>
//                                             <th className="px-4 py-2">P&L</th>
//                                             <th className="px-4 py-2">P&L %</th>
//                                             <th className="px-4 py-2">Profit/Loss</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody className="divide-y divide-gray-700">
//                                         {pnlData.map((order) => {
//                                             const currentPrice = order.latest_price ?? order.price;
//                                             const multiplier = order.transaction_type === "BUY" ? 1 : -1;
//                                             const pnl = ((currentPrice - order.price) * order.quantity * multiplier).toFixed(2);
//                                             const pnlPercentage = (((currentPrice - order.price) / order.price) * 100 * multiplier).toFixed(2);
//                                             const profitLoss = pnl >= 0 ? "Profit" : "Loss";
//                                             return (
//                                                 <tr key={order.order_id} className="hover:bg-gray-700">
//                                                     <td className="px-4 py-2">{order.order_id ?? "N/A"}</td>
//                                                     <td className="px-4 py-2">{order.security_id ?? "N/A"}</td>
//                                                     <td className="px-4 py-2">{order.transaction_type ?? "N/A"}</td>
//                                                     <td className="px-4 py-2">{order.product_type ?? "N/A"}</td>
//                                                     <td className="px-4 py-2">{order.quantity ?? "N/A"}</td>
//                                                     <td className="px-4 py-2">{order.price ?? "N/A"}</td>
//                                                     <td className="px-4 py-2 text-yellow-400 font-semibold">{currentPrice}</td>
//                                                     <td className={`px-4 py-2 ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>{pnl}</td>
//                                                     <td className={`px-4 py-2 ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>{pnlPercentage}%</td>
//                                                     <td className={`px-4 py-2 ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>{profitLoss}</td>
//                                                 </tr>
//                                             );
//                                         })}
//                                     </tbody>
//                                     <tfoot className="bg-gray-700 text-white font-bold">
//                                         <tr>
//                                             <td colSpan="6" className="px-6 py-2 text-left">Total:</td>
//                                             <td className={`px-4 py-2 ${totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}>{totalPnL}</td>
//                                             <td className={`px-4 py-2 ${totalPnLPercentage >= 0 ? "text-green-500" : "text-red-500"}`}>{totalPnLPercentage}%</td>
//                                             <td className="px-4 py-2">—</td>
//                                         </tr>
//                                     </tfoot>
//                                 </table>
//                             </div>
//                         </div>
//                     )}
//                 </>
//             )}
//         </div>
//     );
// };

// export default PnlReport;














// import React, { useEffect, useState, useCallback, memo } from "react";
// import { io } from "socket.io-client";

// const socket = io("http://127.0.0.1:5000", {
//     transports: ["websocket"],
//     reconnectionAttempts: 5,
//     reconnectionDelay: 2000,
//     forceNew: true,
// });

// // Memoized Row Component
// const OrderRow = memo(({ order, onSellTrigger }) => {
//     const currentPrice = order.latest_price ?? order.price;
//     const multiplier = order.transaction_type === "BUY" ? 1 : -1;
//     const pnl = ((currentPrice - order.price) * order.quantity * multiplier).toFixed(2);
//     const pnlPercentage = (((currentPrice - order.price) / order.price) * 100 * multiplier).toFixed(2);
//     const profitLoss = pnl >= 0 ? "Profit" : "Loss";

//     // Check PnL thresholds and trigger sell
//     useEffect(() => {
//         if (order.transaction_type === "BUY") {
//             if (pnlPercentage >= 20.0 || pnlPercentage <= -10.0) {
//                 onSellTrigger(order, pnlPercentage);
//             }
//         }
//     }, [pnlPercentage, order, onSellTrigger]);

//     return (
//         <tr className="hover:bg-gray-700">
//             <td className="px-4 py-2">{order.order_id ?? "N/A"}</td>
//             <td className="px-4 py-2">{order.security_id ?? "N/A"}</td>
//             <td className="px-4 py-2">{order.transaction_type ?? "N/A"}</td>
//             <td className="px-4 py-2">{order.product_type ?? "N/A"}</td>
//             <td className="px-4 py-2">{order.quantity ?? "N/A"}</td>
//             <td className="px-4 py-2">{order.price ?? "N/A"}</td>
//             <td className="px-4 py-2 text-yellow-400 font-semibold">{currentPrice}</td>
//             <td className={`px-4 py-2 ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>{pnl}</td>
//             <td className={`px-4 py-2 ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>{pnlPercentage}%</td>
//             <td className={`px-4 py-2 ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>{profitLoss}</td>
//         </tr>
//     );
// }, (prevProps, nextProps) => {
//     return prevProps.order.latest_price === nextProps.order.latest_price &&
//            prevProps.order.price === nextProps.order.price &&
//            prevProps.order.quantity === nextProps.order.quantity &&
//            prevProps.order.transaction_type === nextProps.order.transaction_type;
// });

// const PnlReport = () => {
//     const [pnlData, setPnlData] = useState([]);
//     const [livePrices, setLivePrices] = useState({});
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // Fetch initial data from the API
//     const fetchInitialData = async () => {
//         try {
//             const response = await fetch("http://127.0.0.1:5000/api/pnl-report");
//             if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

//             const data = await response.json();
//             console.log("✅ Initial API Data:", JSON.stringify(data, null, 2));

//             if (data.status === "success") {
//                 const initialData = data.orders.map(order => ({
//                     ...order,
//                     latest_price: data.live_prices[order.security_id] ?? order.price,
//                 }));
//                 setPnlData(initialData);
//                 setLivePrices(data.live_prices || {});
//             } else {
//                 throw new Error("Invalid API response structure.");
//             }
//         } catch (err) {
//             console.error("Error fetching initial data:", err);
//             setError("Failed to fetch initial data.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Trigger sell API call
//     const triggerSellOrder = useCallback(async (order, pnlPercentage) => {
//         try {
//             const sellPayload = {
//                 security_id: order.security_id,
//                 exchange_segment: order.exchange_segment || "NSE_EQ",
//                 quantity: order.quantity,
//                 order_type: "MARKET",
//                 product_type: order.product_type || "CNC",
//                 price: order.latest_price,
//             };
//             console.log(`🚀 Triggering sell for ${order.security_id} at ${pnlPercentage}%:`, sellPayload);

//             const response = await fetch("http://127.0.0.1:5000/api/place_sell_order", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(sellPayload),
//             });

//             if (response.status === 403) {
//                 const result = await response.json();
//                 console.log('sell rejected:', result.message);
//                 setError(result.message);
//                 return;
//             }

//             if (!response.ok) throw new Error(`Sell API error! Status: ${response.status}`);
//             const result = await response.json();
//             console.log(`✅ Sell response for ${order.security_id}:`, result);

//             if (result.status === "success" || result.status === "offline") {
//                 // Remove sold order from pnlData
//                 setPnlData(prev => prev.filter(o => o.order_id !== order.order_id));
//             } else {
//                 throw new Error(result.message || "Sell order failed");
//             }
//         } catch (err) {
//             console.error(`❌ Error triggering sell for ${order.security_id}:`, err);
//             setError(`Failed to sell ${order.security_id}: ${err.message}`);
//         }
//     }, []);


//     // Handle full PnL updates from WebSocket
//     const handlePnLUpdate = useCallback((data) => {
//         console.log("🔄 WebSocket PnL Update:", JSON.stringify(data, null, 2));

//         if (!data) {
//             console.warn("❌ WebSocket data is null or undefined");
//             setError("WebSocket connection issue, using last valid data.");
//             return;
//         }

//         if (data.status === "error") {
//             console.log("ℹ️ No orders available from server:", data.message);
//             setError(data.message || "No orders available, waiting for data.");
//             setPnlData([]);
//             return;
//         }

//         if (data.status === "success" && data.message === "Connected to server" && !data.pnl_report) {
//             console.log("ℹ️ Connection established, awaiting full update...");
//             setLivePrices(prev => ({ ...prev, ...data.prices }));
//             setError(null);
//             return;
//         }

//         if (data.status !== "success" || !data.pnl_report || !Array.isArray(data.pnl_report)) {
//             console.error("❌ Invalid WebSocket data structure:", data);
//             setError("Invalid WebSocket data received, using last valid data.");
//             return;
//         }

//         setLivePrices(prev => ({
//             ...prev,
//             ...data.pnl_report.reduce((acc, order) => {
//                 acc[order.security_id] = order.current_price;
//                 return acc;
//             }, {}),
//         }));

//         setPnlData(prev => {
//             const newData = data.pnl_report.map(order => ({
//                 order_id: order.order_id,
//                 security_id: order.security_id,
//                 transaction_type: order.transaction_type,
//                 product_type: order.product_type || "N/A",
//                 quantity: order.quantity,
//                 price: order.entry_price,
//                 latest_price: order.current_price ?? prev.find(o => o.security_id === order.security_id)?.latest_price ?? order.entry_price,
//             }));
//             console.log("✅ Updated PnL Data from PnL Update:", JSON.stringify(newData, null, 2));
//             return newData;
//         });

//         setError(null);
//     }, [livePrices]);

//     // Handle real-time LTP updates from WebSocket
//     const handleLtpUpdate = useCallback((data) => {
//         console.log("🔄 WebSocket LTP Update:", JSON.stringify(data, null, 2));

//         if (data.status !== "success" || !data.security_id || typeof data.ltp !== "number") {
//             console.warn("❌ Invalid LTP update data:", data);
//             return;
//         }

//         setLivePrices(prev => {
//             const newPrices = { ...prev, [data.security_id]: data.ltp };
//             console.log("✅ Updated Live Prices:", JSON.stringify(newPrices, null, 2));
//             return newPrices;
//         });

//         setPnlData(prev => {
//             const existingOrderIndex = prev.findIndex(order => order.security_id === data.security_id);
//             if (existingOrderIndex !== -1) {
//                 const newData = [...prev];
//                 newData[existingOrderIndex] = {
//                     ...newData[existingOrderIndex],
//                     latest_price: data.ltp,
//                 };
//                 console.log("✅ Updated PnL Data with LTP:", JSON.stringify(newData, null, 2));
//                 return newData;
//             } else {
//                 const newData = [
//                     ...prev,
//                     {
//                         order_id: `temp-${data.security_id}-${Date.now()}`, // Unique key
//                         security_id: data.security_id,
//                         transaction_type: "N/A",
//                         product_type: "N/A",
//                         quantity: 1,
//                         price: data.ltp,
//                         latest_price: data.ltp,
//                     },
//                 ];
//                 console.log("✅ Initialized PnL Data with LTP:", JSON.stringify(newData, null, 2));
//                 return newData;
//             }
//         });
//     }, []);

//     // Set up WebSocket listeners
//     useEffect(() => {
//         fetchInitialData();

//         console.log("✅ Setting up WebSocket listeners...");
//         socket.on("connect", () => console.log("✅ WebSocket Connected!", socket.id));
//         socket.on("disconnect", () => console.log("❌ WebSocket Disconnected!"));
//         socket.on("connect_error", (err) => console.error("❌ WebSocket Connection Error:", err));
//         socket.on("price_update", handlePnLUpdate);
//         socket.on("ltp_update", handleLtpUpdate);

//         return () => {
//             console.log("🛑 Cleaning up WebSocket listeners...");
//             socket.off("connect");
//             socket.off("disconnect");
//             socket.off("connect_error");
//             socket.off("price_update", handlePnLUpdate);
//             socket.off("ltp_update", handleLtpUpdate);
//         };
//     }, [handlePnLUpdate, handleLtpUpdate]);

//     // Calculate total PnL and percentage
//     const totalPnL = pnlData.reduce((sum, order) => {
//         const currentPrice = order.latest_price ?? order.price;
//         const multiplier = order.transaction_type === "BUY" ? 1 : -1;
//         return sum + (currentPrice - order.price) * order.quantity * multiplier;
//     }, 0).toFixed(2);

//     const totalPnLPercentage = pnlData.reduce((sum, order) => {
//         const currentPrice = order.latest_price ?? order.price;
//         const multiplier = order.transaction_type === "BUY" ? 1 : -1;
//         return sum + (((currentPrice - order.price) / order.price) * 100) * multiplier;
//     }, 0).toFixed(2);

//     return (
//         <div className="p-6 bg-gray-900 min-h-screen flex flex-col items-center text-white">
//             <h2 className="text-2xl font-bold mb-4">📊 Live P&L Report</h2>
//             {loading ? (
//                 <p className="text-gray-300">Fetching data...</p>
//             ) : (
//                 <>
//                     {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}
//                     {pnlData.length === 0 ? (
//                         <p className="text-gray-500">No orders available yet. Waiting for LTP or PnL updates...</p>
//                     ) : (
//                         <div className="w-full max-w-5xl bg-gray-800 shadow-md rounded-lg overflow-hidden">
//                             <div className="overflow-x-auto">
//                                 <table className="w-full text-sm text-gray-300">
//                                     <thead className="bg-blue-600 text-white uppercase text-xs">
//                                         <tr>
//                                             <th className="px-4 py-2">Order ID</th>
//                                             <th className="px-4 py-2">Security ID</th>
//                                             <th className="px-4 py-2">Transaction Type</th>
//                                             <th className="px-4 py-2">Product Type</th>
//                                             <th className="px-4 py-2">Quantity</th>
//                                             <th className="px-4 py-2">Entry Price</th>
//                                             <th className="px-4 py-2">Latest Price</th>
//                                             <th className="px-4 py-2">P&L</th>
//                                             <th className="px-4 py-2">P&L %</th>
//                                             <th className="px-4 py-2">Profit/Loss</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody className="divide-y divide-gray-700">
//                                         {pnlData.map((order) => (
//                                             <OrderRow key={order.order_id} order={order} onSellTrigger={triggerSellOrder} />
//                                         ))}
//                                     </tbody>
//                                     <tfoot className="bg-gray-700 text-white font-bold">
//                                         <tr>
//                                             <td colSpan="7" className="px-6 py-2 text-left">Total:</td>
//                                             <td className={`px-4 py-2 ${totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}>{totalPnL}</td>
//                                             <td className={`px-4 py-2 ${totalPnLPercentage >= 0 ? "text-green-500" : "text-red-500"}`}>{totalPnLPercentage}%</td>
//                                             <td className="px-4 py-2">—</td>
//                                         </tr>
//                                     </tfoot>
//                                 </table>
//                             </div>
//                         </div>
//                     )}
//                 </>
//             )}
//         </div>
//     );
// };

// export default PnlReport;










// import React, { useEffect, useState, useCallback, memo } from "react";
// import { io } from "socket.io-client";

// // Configure socket connection
// const socket = io("http://127.0.0.1:5000", {
//   transports: ["websocket"],
//   reconnectionAttempts: 5,
//   reconnectionDelay: 2000,
//   forceNew: true,
// });

// // Memoized Row Component
// const OrderRow = memo(({ order, onSellTrigger }) => {
//   const currentPrice = order.latest_price ?? order.price;
//   const multiplier = order.transaction_type === "BUY" ? 1 : -1;
//   const pnl = ((currentPrice - order.price) * order.quantity * multiplier).toFixed(2);
//   const pnlPercentage = (((currentPrice - order.price) / order.price) * 100 * multiplier).toFixed(2);
//   const profitLoss = pnl >= 0 ? "Profit" : "Loss";

//   // Auto-sell logic
//   useEffect(() => {
//     if (order.transaction_type === "BUY" && (pnlPercentage >= 20.0 || pnlPercentage <= -5.0)) {
//       onSellTrigger(order, pnlPercentage);
//     }
//   }, [pnlPercentage, order, onSellTrigger]);

//   return (
//     <tr className="hover:bg-gray-700">
//       <td className="px-4 py-2">{order.order_id ?? "N/A"}</td>
//       <td className="px-4 py-2">{order.security_id ?? "N/A"}</td>
//       <td className="px-4 py-2">{order.transaction_type ?? "N/A"}</td>
//       <td className="px-4 py-2">{order.product_type ?? "N/A"}</td>
//       <td className="px-4 py-2">{order.quantity ?? "N/A"}</td>
//       <td className="px-4 py-2">{order.price ?? "N/A"}</td>
//       <td className="px-4 py-2 text-yellow-400 font-semibold">{currentPrice}</td>
//       <td className={`px-4 py-2 ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>{pnl}</td>
//       <td className={`px-4 py-2 ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>{pnlPercentage}%</td>
//       <td className={`px-4 py-2 ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>{profitLoss}</td>
//     </tr>
//   );
// }, arePropsEqual);

// function arePropsEqual(prevProps, nextProps) {
//   return (
//     prevProps.order.latest_price === nextProps.order.latest_price &&
//     prevProps.order.price === nextProps.order.price &&
//     prevProps.order.quantity === nextProps.order.quantity &&
//     prevProps.order.transaction_type === nextProps.order.transaction_type
//   );
// }

// const PnlReport = () => {
//   const [pnlData, setPnlData] = useState([]);
//   const [livePrices, setLivePrices] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch initial data
//   const fetchInitialData = useCallback(async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:5000/api/pnl-report");
//       if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

//       const data = await response.json();
//       if (data.status === "success") {
//         const initialData = data.orders.map(order => ({
//           ...order,
//           latest_price: data.live_prices[order.security_id] ?? order.price,
//         }));
//         setPnlData(initialData);
//         setLivePrices(data.live_prices || {});
//       } else {
//         throw new Error(data.message || "Invalid API response");
//       }
//     } catch (err) {
//       console.error("Error fetching initial data:", err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Trigger sell order
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

//       const response = await fetch("http://127.0.0.1:5000/api/place_sell_order", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(sellPayload),
//       });

//       if (response.status === 403) {
//         const result = await response.json();
//         throw new Error(result.message);
//       }

//       if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

//       const result = await response.json();
//       if (result.status === "success" || result.status === "offline") {
//         setPnlData(prev => prev.filter(o => o.order_id !== order.order_id));
//       } else {
//         throw new Error(result.message);
//       }
//     } catch (err) {
//       console.error("Error triggering sell:", err);
//       setError(err.message);
//     }
//   }, []);

//   // Handle WebSocket updates
//   const handleSocketUpdates = useCallback((data) => {
//     if (!data) return;
    
//     if (data.status === "error") {
//       setError(data.message);
//       return;
//     }

//     if (data.pnl_report) {
//       setLivePrices(prev => ({
//         ...prev,
//         ...data.pnl_report.reduce((acc, order) => {
//           acc[order.security_id] = order.current_price;
//           return acc;
//         }, {}),
//       }));

//       setPnlData(data.pnl_report.map(order => ({
//         order_id: order.order_id,
//         security_id: order.security_id,
//         transaction_type: order.transaction_type,
//         product_type: order.product_type || "N/A",
//         quantity: order.quantity,
//         price: order.entry_price,
//         latest_price: order.current_price ?? order.entry_price,
//       })));
//     }

//     if (data.ltp) {
//       setLivePrices(prev => ({ ...prev, [data.security_id]: data.ltp }));
//     }
//   }, [livePrices]);

//   // Setup WebSocket listeners
//   useEffect(() => {
//     fetchInitialData();

//     socket.on("connect", () => console.log("Connected to WebSocket"));
//     socket.on("disconnect", () => console.log("Disconnected from WebSocket"));
//     socket.on("price_update", handleSocketUpdates);
//     socket.on("ltp_update", handleSocketUpdates);

//     return () => {
//       socket.off("connect");
//       socket.off("disconnect");
//       socket.off("price_update", handleSocketUpdates);
//       socket.off("ltp_update", handleSocketUpdates);
//     };
//   }, [fetchInitialData, handleSocketUpdates]);

//   // Calculate totals
//   const { totalPnL, totalPnLPercentage } = pnlData.reduce((acc, order) => {
//     const currentPrice = order.latest_price ?? order.price;
//     const multiplier = order.transaction_type === "BUY" ? 1 : -1;
//     const pnl = (currentPrice - order.price) * order.quantity * multiplier;
//     const pnlPct = ((currentPrice - order.price) / order.price) * 100 * multiplier;
    
//     return {
//       totalPnL: acc.totalPnL + pnl,
//       totalPnLPercentage: acc.totalPnLPercentage + pnlPct
//     };
//   }, { totalPnL: 0, totalPnLPercentage: 0 });

//   return (
//     <div className="p-6 bg-gray-900 min-h-screen">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-2xl font-bold text-white mb-6">📊 Profit & Loss Report</h1>
        
//         {error && (
//           <div className="bg-red-900/50 text-red-300 p-3 rounded-lg mb-4">
//             {error}
//           </div>
//         )}

//         {loading ? (
//           <div className="text-center py-8">
//             <p className="text-gray-300">Loading data...</p>
//           </div>
//         ) : pnlData.length === 0 ? (
//           <div className="text-center py-8">
//             <p className="text-gray-400">No orders found</p>
//           </div>
//         ) : (
//           <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-700 text-gray-300">
//                   <tr>
//                     <th className="px-4 py-3 text-left">Order ID</th>
//                     <th className="px-4 py-3 text-left">Symbol</th>
//                     <th className="px-4 py-3 text-left">Type</th>
//                     <th className="px-4 py-3 text-left">Product</th>
//                     <th className="px-4 py-3 text-right">Quantity</th>
//                     <th className="px-4 py-3 text-right">Entry</th>
//                     <th className="px-4 py-3 text-right">LTP</th>
//                     <th className="px-4 py-3 text-right">P&L</th>
//                     <th className="px-4 py-3 text-right">P&L %</th>
//                     <th className="px-4 py-3 text-right">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-700">
//                   {pnlData.map(order => (
//                     <OrderRow key={order.order_id} order={order} onSellTrigger={triggerSellOrder} />
//                   ))}
//                 </tbody>
//                 <tfoot className="bg-gray-700">
//                   <tr>
//                     <td colSpan="7" className="px-4 py-3 font-bold text-left">Total:</td>
//                     <td className={`px-4 py-3 font-bold text-right ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
//                       {totalPnL.toFixed(2)}
//                     </td>
//                     <td className={`px-4 py-3 font-bold text-right ${totalPnLPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
//                       {totalPnLPercentage.toFixed(2)}%
//                     </td>
//                     <td className="px-4 py-3"></td>
//                   </tr>
//                 </tfoot>
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

// Memoized Row Component with enhanced UI
const OrderRow = memo(({ order, onSellTrigger, index }) => {
  const currentPrice = order.latest_price ?? order.price;
  const multiplier = order.transaction_type === "BUY" ? 1 : -1;
  const pnl = ((parseFloat(currentPrice) - parseFloat(order.price)) * parseFloat(order.quantity)) * multiplier;
  const pnlPercentage = (((parseFloat(currentPrice) - parseFloat(order.price)) / parseFloat(order.price)) * 100) * multiplier;
  const isProfit = pnl >= 0;
  const profitLoss = isProfit ? "Profit" : "Loss";
  const rowClass = index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700';

  // Check PnL thresholds and trigger sell
  useEffect(() => {
    if (order.transaction_type === "BUY") {
      if (pnlPercentage >= 30.0 || pnlPercentage <= -15.0) {
        onSellTrigger(order, pnlPercentage);
      }
    }
  }, [pnlPercentage, order, onSellTrigger]);

  return (
    <tr className={`${rowClass} hover:bg-gray-600 transition-colors`}>
      <td className="px-4 py-3 text-sm">{order.order_id ?? "N/A"}</td>
      <td className="px-4 py-3 font-medium">{order.security_id ?? "N/A"}</td>
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

  // Calculate statistics whenever pnlData changes
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

  // Fetch initial data from the API
  const fetchInitialData = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/pnl-report?timeframe=${timeframe}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      console.log("✅ Initial API Data:", data);

      if (data.status === "success") {
        const initialData = data.orders.map(order => ({
          ...order,
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

  // Trigger sell API call
  const triggerSellOrder = useCallback(async (order, pnlPercentage) => {
    try {
      const sellPayload = {
        security_id: order.security_id,
        exchange_segment: order.exchange_segment || "NSE_EQ",
        quantity: order.quantity,
        order_type: "MARKET",
        product_type: order.product_type || "CNC",
        price: order.latest_price,
      };
      console.log(`🚀 Triggering sell for ${order.security_id} at ${pnlPercentage}%:`, sellPayload);

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
      console.log(`✅ Sell response for ${order.security_id}:`, result);

      if (result.status === "success" || result.status === "offline") {
        // Remove sold order from pnlData
        setPnlData(prev => prev.filter(o => o.order_id !== order.order_id));
      } else {
        throw new Error(result.message || "Sell order failed");
      }
    } catch (err) {
      console.error(`❌ Error triggering sell for ${order.security_id}:`, err);
      setError(`Failed to sell ${order.security_id}: ${err.message}`);
    }
  }, []);

  // Handle full PnL updates from WebSocket
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
        transaction_type: order.transaction_type,
        product_type: order.product_type || "N/A",
        quantity: parseFloat(order.quantity),
        price: parseFloat(order.entry_price),
        latest_price: parseFloat(order.current_price ?? prev.find(o => o.security_id === order.security_id)?.latest_price ?? order.entry_price),
      }));
      return newData;
    });

    setError(null);
  }, [livePrices]);

  // Handle real-time LTP updates from WebSocket
  const handleLtpUpdate = useCallback((data) => {
    console.log("🔄 WebSocket LTP Update:", data);

    if (data.status !== "success" || !data.security_id || typeof data.ltp !== "number") {
      console.warn("❌ Invalid LTP update data:", data);
      return;
    }

    setLivePrices(prev => {
      return { ...prev, [data.security_id]: parseFloat(data.ltp) };
    });

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
  }, []);

  // Set up WebSocket listeners
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

  // Summary cards data
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

        {/* Summary Cards */}
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