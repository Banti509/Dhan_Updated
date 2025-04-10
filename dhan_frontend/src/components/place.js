



// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const PlaceOrder = () => {
//   const navigate = useNavigate();
//   const [security_id, setSecurityId] = useState("");
//   const [exchange_segment, setExchangeSegment] = useState("NSE_EQ");
//   const [symbol_name, setSymbolName] = useState("");
//   const [side, setSide] = useState("BUY");
//   const [orderType, setOrderType] = useState("LIMIT");
//   const [quantity, setQuantity] = useState(1);
//   const [price, setPrice] = useState("");
//   const [triggerPrice, setTriggerPrice] = useState("");
//   const [productType, setProductType] = useState("INTRADAY");
//   const [timeInForce, setTimeInForce] = useState("GTC");
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [successMessage, setSuccessMessage] = useState(null);
//   const [showPopup, setShowPopup] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);

//   // Fetch search results
//   const handleSearch = async () => {
//     setError(null);
//     setSearchResults([]);

//     if (!searchQuery.trim()) {
//       setError("Please enter a search term.");
//       return;
//     }

//     try {
//       const response = await axios.get(`http://localhost:5000/api/search?query=${searchQuery}`);
//       setSearchResults(response.data.length > 0 ? response.data : []);
//     } catch (err) {
//       setError("Error fetching search results. Please try again.");
//     }
//   };

//   // Auto-fill form when selecting a search result
//   const handleSelectResult = (selectedData) => {
//     setSecurityId(selectedData?.Security_ID || "");
//     setExchangeSegment(selectedData?.Exchange_segment || "NSE_EQ");
//     setSymbolName(selectedData?.Symbol_Name || "");
//     setPrice(selectedData?.Price || "");
//     setQuantity(selectedData?.Lot_Size || 1);
//     setError(null);
//   };

//   // Place Order
//   const handlePlaceOrder = async () => {
//     setError(null);
//     setSuccessMessage(null);
//     if (quantity <= 0) {
//       setError("Quantity must be greater than 0.");
//       return;
//     }
//     if (["LIMIT", "STOP_LOSS"].includes(orderType) && price <= 0) {
//         setError("Price must be greater than 0 for LIMIT and STOP-LOSS orders.");
//         return;
//       }
//       if (["STOP_LOSS", "STOP_LOSS_MARKET"].includes(orderType) && triggerPrice <= 0) {
//         setError("Trigger price must be greater than 0 for STOP-LOSS orders.");
//         return;
//       }
//     setLoading(true);


//     let orderData = {
//       security_id,
//       exchange_segment,
//       transaction_type: side,
//       quantity,
//       order_type: orderType,
//       product_type: productType,
//       price: orderType === "LIMIT" ? parseFloat(price) : undefined,
//       trigger_price: orderType.includes("STOP_LOSS") ? parseFloat(triggerPrice) : undefined,
//       timeInForce: orderType === "LIMIT" ? timeInForce : undefined,
//     };
//     if (["LIMIT", "STOP_LOSS"].includes(orderType)) {
//       orderData.price = parseFloat(price);
//     }
//     if (["STOP_LOSS", "STOP_LOSS_MARKET"].includes(orderType)) {
//       orderData.trigger_price = parseFloat(triggerPrice);
//     }
//     if (orderType === "LIMIT") {
//       orderData.timeInForce = timeInForce;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post("http://localhost:5000/api/place-order", orderData, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       console.log("Order Response:", response.data, response.data.saved_data);
//       setOrders((prevOrders) => [...prevOrders, response.data]);
//     } catch (err) {
//       setError(`Error placing order: ${err.response?.data?.remarks?.error_message || err.message}`);
//         console.error("Order Error:", err);
//       } finally {
//         setLoading(false);
//       }
// };

//   return (
//     <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white max-w-3xl mx-auto">
//       <h2 className="text-2xl font-bold mb-4">Place Order</h2>

//       {/* Search Bar */}
//       <div className="mb-4 flex">
//         <input
//           type="text"
//           placeholder="Search..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="w-full p-2 rounded bg-gray-700 border border-gray-600"
//         />
//         <button onClick={handleSearch} className="ml-2 p-2 bg-green-500 text-black font-bold rounded hover:bg-green-600">
//           Search
//         </button>
//         </div>
//         {/* Search Results */}
//         {searchResults.length > 0 && (
//           <div className="mt-4">
//             <h3 className="text-xl font-bold mb-2">Search Results</h3>
//             <table className="w-full border-collapse border border-gray-600">
//               <thead>
//                 <tr className="bg-gray-700 text-white">
//                   <th className="border border-gray-600 p-2">Exchange</th>
//                   <th className="border border-gray-600 p-2">Security ID</th>
//                   <th className="border border-gray-600 p-2">Instrument Type</th>
//                   <th className="border border-gray-600 p-2">Symbol</th>
//                   <th className="border border-gray-600 p-2">Lot Size</th>
//                   <th className="border border-gray-600 p-2">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {searchResults.map((result, index) => (
//                   <tr key={index} className="bg-gray-800 text-white">
//                     <td className="border border-gray-600 p-2">{result?.Exchange_segment || "N/A"}</td>
//                     <td className="border border-gray-600 p-2">{result?.Security_ID || "N/A"}</td>
//                     <td className="border border-gray-600 p-2">{result?.Instrument_Type || "N/A"}</td>
//                     <td className="border border-gray-600 p-2">{result?.Symbol_Name || "N/A"}</td>
//                     <td className="border border-gray-600 p-2">{result?.Lot_Size || "N/A"}</td>
//                     <td className="border border-gray-600 p-2">
//                       <button onClick={() => handleSelectResult(result)} className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">
//                         Select
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

// {        {/* Order Form */}
//         <div className="mt-4">
//           <label className="block mb-1">Security ID:</label>
//           <input type="text" value={security_id} className="w-full p-2 rounded bg-gray-700 border border-gray-600" readOnly />
//         </div>
//         <div>
//             <label className="block mb-1">Exchange Segment:</label>
//             <select
//               value={exchange_segment}
//               onChange={(e) => setExchangeSegment(e.target.value)}
//               className="w-full p-2 rounded bg-gray-700 border border-gray-600"
//             >
//               <option value="NSE_EQ">NSE_EQ</option>
//               <option value="BSE_EQ">BSE_EQ</option>
//               <option value="BSE_EQ">MCX_EQ</option>
//               <option value="BSE_EQ">BSE_EQ</option>
//             </select>
//           </div>
//           <div>
//             <label className="block mb-1">Transaction Type:</label>
//             <select
//               value={side}
//               onChange={(e) => setSide(e.target.value)}
//               className="w-full p-2 rounded bg-gray-700 border border-gray-600"
//             >
//               <option value="BUY">BUY</option>
//               <option value="SELL">SELL</option>
//             </select>
//           </div>
//           <div>
//             <label className="block mb-1">Order Type:</label>
//             <select
//               value={orderType}
//               onChange={(e) => setOrderType(e.target.value)}
//               className="w-full p-2 rounded bg-gray-700 border border-gray-600"
//             >
//               <option value="LIMIT">LIMIT</option>
//               <option value="MARKET">MARKET</option>
//               <option value="STOP_LOSS">STOP-LOSS (SL)</option>
//               <option value="STOP_LOSS_MARKET">STOP-LOSS MARKET (SL-M)</option>
//             </select>
//           </div>
//           {orderType !== "MARKET" && (
//             <div>
//               <label className="block mb-1">Price:</label>
//               <input
//                 type="number"
//                 value={price}
//                 onChange={(e) => setPrice(e.target.value)}
//                 className="w-full p-2 rounded bg-gray-700 border border-gray-600"
//               />
//             </div>
//           )}
//           {["STOP_LOSS", "STOP_LOSS_MARKET"].includes(orderType) && (
//             <div>
//               <label className="block mb-1">Trigger Price:</label>
//               <input
//                 type="number"
//                 value={triggerPrice}
//                 onChange={(e) => setTriggerPrice(e.target.value)}
//                 className="w-full p-2 rounded bg-gray-700 border border-gray-600"
//               />
//             </div>
//           )}
//           <div>
//             <label className="block mb-1">Quantity:</label>
//             <input
//               type="number"
//               value={quantity}
//               onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
//               className="w-full p-2 rounded bg-gray-700 border border-gray-600"
//             />
//           </div>
//         </div>
//         <button
//           onClick={handlePlaceOrder}
//           disabled={loading}
//           className="w-full p-2 mt-4 bg-green-500 text-black font-bold rounded hover:bg-green-600"
//         >
//           {loading ? "Placing Order..." : "Place Order"}
//         </button>
//         <button
//           onClick={() => navigate("/")}        
//           className="w-full p-2 mt-3 bg-gray-500 text-white rounded hover:bg-gray-600"
//         >
//           Back to Dashboard
//         </button>}

//       {error && <p className="mt-4 p-2 bg-red-400 text-black rounded">{error}</p>}
//       {/* Order Table */
//       }
//       {orders.length > 0 && (
//         <div className="mt-6">
//           <h3 className="text-xl font-bold mb-2">Order History</h3>
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse border border-gray-600">
//               <thead>
//                 <tr className="bg-gray-700 text-white">
//                   <th className="border border-gray-600 p-2">Order ID</th>
//                   <th className="border border-gray-600 p-2">Security id</th>
//                   <th className="border border-gray-600 p-2">Side</th>
//                   <th className="border border-gray-600 p-2">Order Type</th>
//                   <th className="border border-gray-600 p-2">Quantity</th>
//                   <th className="border border-gray-600 p-2">Price</th>
//                   <th className="border border-gray-600 p-2">Product Type</th>
//                   <th className="border border-gray-600 p-2">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {orders.map((order, index) => (
//                   <tr key={index} className="bg-gray-800 text-white">
//                   <td className="border border-gray-600 p-2">{order?.test_order_id || order?.order_id || "N/A"}</td>
//                   <td className="border border-gray-600 p-2">{order?.saved_data?.[0]?.security_id || order?.symbol || "N/A"}</td>
//                   <td className="border border-gray-600 p-2">{order?.saved_data?.[0]?.transaction_type || order?.side || "N/A"}</td>
//                   <td className="border border-gray-600 p-2">{order?.saved_data?.[0]?.order_type || "N/A"}</td>
//                   <td className="border border-gray-600 p-2">{order?.saved_data?.[0]?.quantity || order?.origQty || "N/A"}</td>
//                   <td className="border border-gray-600 p-2">{order?.saved_data?.[0]?.price > 0 ? order?.saved_data?.[0]?.price : "-"}</td>
//                   <td className="border border-gray-600 p-2">{order?.saved_data?.[0]?.product_type || "N/A"}</td>
//                   <td className="border border-gray-600 p-2">{order?.status || "Pending"}</td>

//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//       {successMessage && <p className="mt-4 p-2 bg-green-600 text-white rounded">{successMessage}</p>}
//       {showPopup && (
//         <div className="fixed top-10 right-10 bg-green-500 text-white p-3 rounded-lg shadow-lg">
//           Order created successfully!
//         </div>
//       )}
//     </div>
//   );
// };

// export default PlaceOrder;
