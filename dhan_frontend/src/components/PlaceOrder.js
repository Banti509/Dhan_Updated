

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const PlaceOrder = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     security_id: "",
//     exchange_segment: "NSE_EQ",
//     transaction_type: "BUY",
//     order_type: "MARKET",
//     quantity: 1,
//     price: "",
//     trigger_price: "",
//     product_type: "CNC"
//   });
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [successMessage, setSuccessMessage] = useState(null);
//   const [orders, setOrders] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [searchType, setSearchType] = useState(""); // 'equity' or 'options'
//   const [optionFilters, setOptionFilters] = useState({
//     symbol: "",
//     expiry: "",
//     type: "",
//     strike: ""
//   });

//   // Update product type automatically for F&O segments
//   useEffect(() => {
//     if (formData.exchange_segment.includes("FNO")) {
//       setFormData(prev => ({ ...prev, product_type: "MARGIN" }));
//     }
//   }, [formData.exchange_segment]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleOptionFilterChange = (e) => {
//     const { name, value } = e.target;
//     setOptionFilters(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSearch = async () => {
//     setError(null);
//     setSearchResults([]);
    
//     try {
//       let response;
//       if (searchType === "equity") {
//         if (!searchQuery.trim()) {
//           setError("Please enter a search term.");
//           return;
//         }
//         response = await axios.get(`http://localhost:5000/api/search?query=${searchQuery}`);
//       } else {
//         // Options search
//         if (!optionFilters.symbol.trim()) {
//           setError("Please enter an underlying symbol.");
//           return;
//         }
//         const params = new URLSearchParams();
//         Object.entries(optionFilters).forEach(([key, value]) => {
//           if (value) params.append(key, value);
//         });
//         response = await axios.get(`http://localhost:5000/api/search-options?${params.toString()}`);
//       }

//       console.log("Search Results:", response.data);
//       if (Array.isArray(response.data) ? response.data.length > 0 : response.data.results?.length > 0) {
//         setSearchResults(Array.isArray(response.data) ? response.data : response.data.results);
//       } else {
//         setSearchResults([]);
//         setError("No matching instruments found.");
//       }
//     } catch (err) {
//       setSearchResults([]);
//       setError(err.response?.data?.message || "Error fetching search results");
//       console.error("Search Error:", err);
//     }
//   };

//   const handleRowClick = (result) => {
//     setFormData(prev => ({
//       ...prev,
//       security_id: result.Security_ID,
//       exchange_segment: result.Exchange_segment || "NSE_EQ",
//       quantity: result.Lot_Size || 1
//     }));
//   };

//   const handlePlaceOrder = async () => {
//     setError(null);
//     setSuccessMessage(null);

//     // Validation
//     if (!formData.security_id) {
//       setError("Security ID is required.");
//       return;
//     }
//     if (!formData.product_type) {
//       setError("Product type is required.");
//       return;
//     }
//     if (formData.quantity <= 0) {
//       setError("Quantity must be greater than 0.");
//       return;
//     }
//     if (["LIMIT", "STOP_LOSS"].includes(formData.order_type) && (!formData.price || parseFloat(formData.price) <= 0)) {
//       setError("Price must be greater than 0 for LIMIT and STOP-LOSS orders.");
//       return;
//     }
//     if (["STOP_LOSS", "STOP_LOSS_MARKET"].includes(formData.order_type) && (!formData.trigger_price || parseFloat(formData.trigger_price) <= 0)) {
//       setError("Trigger price must be greater than 0 for STOP-LOSS orders.");
//       return;
//     }

//     setLoading(true);

//     // Prepare payload
//     const payload = {
//       ...formData,
//       quantity: parseInt(formData.quantity),
//       ...(formData.price && { price: parseFloat(formData.price) }),
//       ...(formData.trigger_price && { trigger_price: parseFloat(formData.trigger_price) })
//     };

//     // Clean up payload based on order type
//     if (payload.order_type === "MARKET") {
//       delete payload.price;
//       delete payload.trigger_price;
//     } else if (!["STOP_LOSS", "STOP_LOSS_MARKET"].includes(payload.order_type)) {
//       delete payload.trigger_price;
//     }

//     console.log("Order Payload:", payload);

//     try {
//       const response = await axios.post("http://localhost:5000/api/place-order", payload);
//       console.log("Order Response:", response.data);
      
//       setOrders(prev => [response.data, ...prev]);
      
//       if (response.data.status === "offline") {
//         setSuccessMessage("Market is closed. Order saved for execution when market opens.");
//       } else if (response.data.status === "success") {
//         setSuccessMessage(`Order placed successfully! Order ID: ${response.data.order_id}`);
//       } else {
//         setError(response.data.message || "Order placement failed.");
//       }
//     } catch (err) {
//       console.error("Order Error:", err);
//       setError(err.response?.data?.error || err.response?.data?.message || "Failed to place order");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white max-w-4xl mx-auto">
//       <h2 className="text-2xl font-bold mb-4">Place Order</h2>
      
//       {/* Search Section */}
//       <div className="mb-6 bg-gray-700 p-4 rounded-lg">
//         <div className="flex items-center mb-4">
//           <label className="mr-4">
//             <input
//               type="radio"
//               name="searchType"
//               checked={searchType === "equity"}
//               onChange={() => setSearchType("equity")}
//               className="mr-2"
//             />
//             Equity Search
//           </label>
//           <label>
//             <input
//               type="radio"
//               name="searchType"
//               checked={searchType === "options"}
//               onChange={() => setSearchType("options")}
//               className="mr-2"
//             />
//             Options Search
//           </label>
//         </div>

//         {searchType === "equity" ? (
//           <div className="flex items-center gap-2">
//             <input
//               type="text"
//               placeholder="Search by symbol or security ID..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="flex-1 p-2 rounded bg-gray-600 border border-gray-500"
//             />
//             <button
//               onClick={handleSearch}
//               className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//             >
//               Search
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div>
//               <label className="block text-sm mb-1">Underlying Symbol</label>
//               <select 
//                 className="w-full p-2 rounded bg-gray-600 border border-gray-500" 
//                 name="symbol"
//                 value={optionFilters.symbol}
//                 onChange={handleOptionFilterChange}
//               >
//                 <option value="">Select Symbol</option>
//                 <option value="NIFTY">NIFTY</option>
//                 <option value="BANKNIFTY">BANKNIFTY</option>
//                 <option value="MIDCPNIFTY">MIDCPNIFTY</option>
//                 <option value="FINNIFTY">FINNIFTY</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm mb-1">Expiry (YYYY-MM-DD)</label>
//               <select 
//                 className="w-full p-2 rounded bg-gray-600 border border-gray-500" 
//                 name="expiry"
//                 value={optionFilters.expiry}
//                 onChange={handleOptionFilterChange}
//                 disabled={!optionFilters.symbol}
//               >
//                 <option value="">Select Expiry</option>
//                 <option value="2025-04-09">2025-04-09</option>
//                 <option value="2025-04-17">2025-04-17</option>
//                 <option value="2025-04-24">2025-04-24</option>
//                 <option value="2025-04-30">2025-04-30</option>
//                 <option value="2025-05-08">2025-05-08</option>
//                 <option value="2025-05-15">2025-05-15</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm mb-1">Type</label>
//               <select
//                 name="type"
//                 value={optionFilters.type}
//                 onChange={handleOptionFilterChange}
//                 className="w-full p-2 rounded bg-gray-600 border border-gray-500"
//                 disabled={!optionFilters.expiry}
//               >
//                 <option value="">Select Type</option>
//                 <option value="CE">Call</option>
//                 <option value="PE">Put</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm mb-1">Strike Price</label>
//               <input
//                 type="number"
//                 name="strike"
//                 value={optionFilters.strike}
//                 onChange={handleOptionFilterChange}
//                 placeholder="22000"
//                 className="w-full p-2 rounded bg-gray-600 border border-gray-500"
//                 disabled={!optionFilters.type}
//               />
//             </div>
//             <div className="md:col-span-4 flex justify-end">
//               <button
//                 onClick={handleSearch}
//                 className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//                 disabled={!optionFilters.symbol}
//               >
//                 Search Options
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Search Results */}
//       {searchResults.length > 0 && (
//         <div className="mb-6 bg-gray-700 p-4 rounded-lg">
//           <h3 className="text-xl font-bold mb-2">Search Results</h3>
//           <div className="overflow-x-auto">
//             <div className="overflow-y-auto" style={{ maxHeight: 'calc(5 * 2.4rem)' }}> {/* Assuming each row is 2.5rem tall */}
//               <table className="w-full border-collapse">
//                 <thead>
//                   <tr className="bg-gray-600 sticky top-0"> {/* Made header sticky */}
//                     <th className="p-2 text-left">Exchange</th>
//                     <th className="p-2 text-left">Security ID</th>
//                     <th className="p-2 text-left">Instrument Type</th>
//                     <th className="p-2 text-left">Lot Size</th>
//                     <th className="p-2 text-left">Symbol</th>
//                     {searchType === "options" && <th className="p-2 text-left">Strike</th>}
//                     {searchType === "options" && <th className="p-2 text-left">Option Type</th>}
//                     {searchType === "options" && <th className="p-2 text-left">Expiry</th>}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {searchResults.map((result, index) => (
//                     <tr
//                       key={index}
//                       className="border-b border-gray-600 hover:bg-gray-600 cursor-pointer"
//                       onClick={() => handleRowClick(result)}
//                     >
//                       <td className="p-2">{result.Exchange_segment || "N/A"}</td>
//                       <td className="p-2">{result.Security_ID || "N/A"}</td>
//                       <td className="p-2">{result.Instrument_Type || "N/A"}</td>
//                       <td className="p-2">{result.Lot_Size || "N/A"}</td>
//                       <td className="p-2">{result.Symbol_Name || "N/A"}</td>
//                       {searchType === "options" && <td className="p-2">{result.Strike_Price || "N/A"}</td>}
//                       {searchType === "options" && <td className="p-2">{result.Option_Type || "N/A"}</td>}
//                       {searchType === "options" && <td className="p-2">{result.Expiry_Date || "N/A"}</td>}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Order Form */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//         <div>
//           <label className="block mb-1">Security ID</label>
//           <input
//             type="text"
//             name="security_id"
//             value={formData.security_id}
//             onChange={handleInputChange}
//             className="w-full p-2 rounded bg-gray-700 border border-gray-600"
//           />
//         </div>
        
//         <div>
//           <label className="block mb-1">Exchange Segment</label>
//           <select
//             name="exchange_segment"
//             value={formData.exchange_segment}
//             onChange={handleInputChange}
//             className="w-full p-2 rounded bg-gray-700 border border-gray-600"
//           >
//             <option value="NSE_EQ">NSE_EQ</option>
//             <option value="BSE_EQ">BSE_EQ</option>
//             <option value="NSE_FNO">NSE F&O</option>
//             <option value="BSE_FNO">BSE F&O</option>
//             <option value="MCX_COM">MCX Commodity</option>
//           </select>
//         </div>
        
//         <div>
//           <label className="block mb-1">Transaction Type</label>
//           <select
//             name="transaction_type"
//             value={formData.transaction_type}
//             onChange={handleInputChange}
//             className="w-full p-2 rounded bg-gray-700 border border-gray-600"
//           >
//             <option value="BUY">BUY</option>
//             <option value="SELL">SELL</option>
//           </select>
//         </div>
        
//         <div>
//           <label className="block mb-1">Product Type</label>
//           <select
//             name="product_type"
//             value={formData.product_type}
//             onChange={handleInputChange}
//             className="w-full p-2 rounded bg-gray-700 border border-gray-600"
//             disabled={formData.exchange_segment.includes("FNO")}
//           >
//             <option value="CNC">CNC (Delivery)</option>
//             <option value="INTRADAY">INTRADAY</option>
//             <option value="MARGIN">MARGIN</option>
//           </select>
//           {formData.exchange_segment.includes("FNO") && (
//             <p className="text-xs text-gray-400 mt-1">F&O orders automatically use MARGIN product type</p>
//           )}
//         </div>
        
//         <div>
//           <label className="block mb-1">Order Type</label>
//           <select
//             name="order_type"
//             value={formData.order_type}
//             onChange={handleInputChange}
//             className="w-full p-2 rounded bg-gray-700 border border-gray-600"
//           >
//             <option value="MARKET">MARKET</option>
//             <option value="LIMIT">LIMIT</option>
//             <option value="STOP_LOSS">STOP_LOSS (SL)</option>
//             <option value="STOP_LOSS_MARKET">STOP_LOSS_MARKET (SL-M)</option>
//           </select>
//         </div>
        
//         <div>
//           <label className="block mb-1">Quantity (in lots for F&O)</label>
//           <input
//             type="number"
//             name="quantity"
//             value={formData.quantity}
//             onChange={handleInputChange}
//             className="w-full p-2 rounded bg-gray-700 border border-gray-600"
//           />
//         </div>
        
//         {formData.order_type !== "MARKET" && (
//           <div>
//             <label className="block mb-1">Price</label>
//             <input
//               type="number"
//               name="price"
//               value={formData.price}
//               onChange={handleInputChange}
//               className="w-full p-2 rounded bg-gray-700 border border-gray-600"
//               step="0.05"
//             />
//           </div>
//         )}
        
//         {["STOP_LOSS", "STOP_LOSS_MARKET"].includes(formData.order_type) && (
//           <div>
//             <label className="block mb-1">Trigger Price</label>
//             <input
//               type="number"
//               name="trigger_price"
//               value={formData.trigger_price}
//               onChange={handleInputChange}
//               className="w-full p-2 rounded bg-gray-700 border border-gray-600"
//               step="0.05"
//             />
//           </div>
//         )}
//       </div>

//       {/* Action Buttons */}
//       <div className="flex flex-col space-y-3">
//         <button
//           onClick={handlePlaceOrder}
//           disabled={loading}
//           className="w-full p-3 bg-green-600 text-white font-bold rounded hover:bg-green-700 disabled:bg-gray-600"
//         >
//           {loading ? "Placing Order..." : "Place Order"}
//         </button>
        
//         <button
//           onClick={() => navigate("/")}
//           className="w-full p-3 bg-gray-600 text-white rounded hover:bg-gray-700"
//         >
//           Back to Dashboard
//         </button>
//       </div>

//       {/* Messages */}
//       {error && (
//         <div className="mt-4 p-3 bg-red-600 text-white rounded">
//           {error}
//         </div>
//       )}
      
//       {successMessage && (
//         <div className="mt-4 p-3 bg-green-700 text-white rounded">
//           {successMessage}
//         </div>
//       )}

//       {/* Order History */}
//       {orders.length > 0 && (
//         <div className="mt-8">
//           <h3 className="text-xl font-bold mb-3">Recent Orders</h3>
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="bg-gray-700">
//                   <th className="p-2 text-left">Order ID</th>
//                   <th className="p-2 text-left">Security</th>
//                   <th className="p-2 text-left">Type</th>
//                   <th className="p-2 text-left">Qty</th>
//                   <th className="p-2 text-left">Price</th>
//                   <th className="p-2 text-left">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {orders.map((order, index) => (
//                   <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
//                     <td className="p-2">{order.order_id || order.test_order_id || "N/A"}</td>
//                     <td className="p-2">{order.saved_data?.security_id || "N/A"}</td>
//                     <td className="p-2">
//                       {order.saved_data?.transaction_type || "N/A"} {order.saved_data?.order_type || ""}
//                     </td>
//                     <td className="p-2">{order.saved_data?.quantity || "N/A"}</td>
//                     <td className="p-2">
//                       {order.saved_data?.price > 0 ? order.saved_data.price : "MARKET"}
//                     </td>
//                     <td className="p-2">
//                       <span className={`px-2 py-1 rounded text-xs ${
//                         order.status === "success" ? "bg-green-800" :
//                         order.status === "offline" ? "bg-yellow-800" :
//                         "bg-gray-600"
//                       }`}>
//                         {order.status || "PENDING"}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PlaceOrder;









import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    security_id: "",
    exchange_segment: "NSE_EQ",
    transaction_type: "BUY",
    order_type: "MARKET",
    quantity: 1,
    price: "",
    trigger_price: "",
    product_type: "CNC",
    order_symbol: "" // Added
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState("equity");
  const [optionFilters, setOptionFilters] = useState({
    symbol: "",
    expiry: "",
    type: "",
    strike: ""
  });

  // Auto-set product_type for F&O
  useEffect(() => {
    if (formData.exchange_segment.includes("FNO")) {
      setFormData(prev => ({ ...prev, product_type: "MARGIN" }));
    }
  }, [formData.exchange_segment]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionFilterChange = (e) => {
    const { name, value } = e.target;
    setOptionFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    setError(null);
    setSearchResults([]);
    
    try {
      let response;
      if (searchType === "equity") {
        if (!searchQuery.trim()) {
          setError("Please enter a search term.");
          return;
        }
        response = await axios.get(`http://localhost:5000/api/search?query=${searchQuery}`);
      } else {
        if (!optionFilters.symbol.trim()) {
          setError("Please enter an underlying symbol.");
          return;
        }
        const params = new URLSearchParams();
        Object.entries(optionFilters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
        response = await axios.get(`http://localhost:5000/api/search-options?${params.toString()}`);
      }

      console.log("Search Results:", response.data);
      const results = Array.isArray(response.data) ? response.data : response.data.results || [];
      if (results.length > 0) {
        setSearchResults(results);
      } else {
        setSearchResults([]);
        setError("No matching instruments found.");
      }
    } catch (err) {
      setSearchResults([]);
      setError(err.response?.data?.message || err.message || "Error fetching search results");
      console.error("Search Error:", err);
    }
  };

  const handleRowClick = (result) => {
    setFormData(prev => ({
      ...prev,
      security_id: result.Security_ID || "",
      exchange_segment: result.Exchange_segment || "NSE_EQ",
      quantity: result.Lot_Size ? parseInt(result.Lot_Size) : 1,
      order_symbol: result.Symbol_Name || "" // Added
    }));
  };

  const handlePlaceOrder = async () => {
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!formData.security_id) {
      setError("Security ID is required.");
      return;
    }
    if (!formData.product_type) {
      setError("Product type is required.");
      return;
    }
    if (formData.quantity <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }
    if (["LIMIT", "STOP_LOSS"].includes(formData.order_type)) {
      if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
        setError("Price must be greater than 0 for LIMIT and STOP-LOSS orders.");
        return;
      }
    }
    if (["STOP_LOSS", "STOP_LOSS_MARKET"].includes(formData.order_type)) {
      if (!formData.trigger_price || isNaN(formData.trigger_price) || parseFloat(formData.trigger_price) <= 0) {
        setError("Trigger price must be greater than 0 for STOP-LOSS orders.");
        return;
      }
    }
    if (!["NSE_EQ", "BSE_EQ", "NSE_FNO", "BSE_FNO"].includes(formData.exchange_segment)) {
      setError("Invalid exchange segment. Choose NSE_EQ, BSE_EQ, NSE_FNO, or BSE_FNO.");
      return;
    }

    setLoading(true);

    // Prepare payload
    const payload = {
      security_id: formData.security_id,
      exchange_segment: formData.exchange_segment,
      transaction_type: formData.transaction_type,
      order_type: formData.order_type,
      quantity: parseInt(formData.quantity),
      product_type: formData.product_type,
      ...(formData.order_symbol && { order_symbol: formData.order_symbol }),
      ...(formData.order_type !== "MARKET" && formData.price && !isNaN(formData.price) && {
        price: parseFloat(formData.price)
      }),
      ...(["STOP_LOSS", "STOP_LOSS_MARKET"].includes(formData.order_type) && 
          formData.trigger_price && !isNaN(formData.trigger_price) && {
        trigger_price: parseFloat(formData.trigger_price)
      })
    };

    console.log("Order Payload:", payload);

    try {
      const response = await axios.post("http://localhost:5000/api/place-order", payload);
      console.log("Order Response:", response.data);
      
      setOrders(prev => [response.data, ...prev]);
      
      if (response.data.status === "offline") {
        setSuccessMessage("Market is closed. Order saved for execution when market opens.");
      } else if (response.data.status === "success") {
        setSuccessMessage(`Order placed successfully! Order ID: ${response.data.order_id}`);
      } else {
        setError(response.data.message || response.data.error || "Order placement failed.");
      }
    } catch (err) {
      console.error("Order Error:", err);
      console.error("Error Response:", err.response?.data);
      const errorMessage = err.response?.data?.error || 
                           err.response?.data?.message || 
                           err.message || 
                           "Failed to place order. Please check your input and try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Place Order</h2>
      
      {/* Search Section */}
      <div className="mb-6 bg-gray-700 p-4 rounded-lg">
        <div className="flex items-center mb-4">
          <label className="mr-4">
            <input
              type="radio"
              name="searchType"
              checked={searchType === "equity"}
              onChange={() => setSearchType("equity")}
              className="mr-2"
            />
            Equity Search
          </label>
          <label>
            <input
              type="radio"
              name="searchType"
              checked={searchType === "options"}
              onChange={() => setSearchType("options")}
              className="mr-2"
            />
            Options Search
          </label>
        </div>

        {searchType === "equity" ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search by symbol or security ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-2 rounded bg-gray-600 border border-gray-500"
            />
            <button
              onClick={handleSearch}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm mb-1">Underlying Symbol</label>
              <select 
                className="w-full p-2 rounded bg-gray-600 border border-gray-500" 
                name="symbol"
                value={optionFilters.symbol}
                onChange={handleOptionFilterChange}
              >
                <option value="">Select Symbol</option>
                <option value="NIFTY">NIFTY</option>
                <option value="BANKNIFTY">BANKNIFTY</option>
                <option value="MIDCPNIFTY">MIDCPNIFTY</option>
                <option value="FINNIFTY">FINNIFTY</option>
                <option value="NIFTYNXT50">NIFTYNXT50</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Expiry (YYYY-MM-DD)</label>
              <select 
                className="w-full p-2 rounded bg-gray-600 border border-gray-500" 
                name="expiry"
                value={optionFilters.expiry}
                onChange={handleOptionFilterChange}
                disabled={!optionFilters.symbol}
              >
                <option value="">Select Expiry</option>
                <option value="2025-05-08">2025-05-08</option>
                <option value="2025-05-15">2025-05-15</option>
                <option value="2025-05-22">2025-05-22</option>
                <option value="2025-05-29">2025-05-29</option>
                {/* <option value="2025-05-08">2025-05-08</option>
                <option value="2025-05-15">2025-05-15</option> */}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Type</label>
              <select
                name="type"
                value={optionFilters.type}
                onChange={handleOptionFilterChange}
                className="w-full p-2 rounded bg-gray-600 border border-gray-500"
                disabled={!optionFilters.expiry}
              >
                <option value="">Select Type</option>
                <option value="CE">Call</option>
                <option value="PE">Put</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Strike Price</label>
              <input
                type="number"
                name="strike"
                value={optionFilters.strike}
                onChange={handleOptionFilterChange}
                placeholder="22000"
                className="w-full p-2 rounded bg-gray-600 border border-gray-500"
                disabled={!optionFilters.type}
              />
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button
                onClick={handleSearch}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={!optionFilters.symbol}
              >
                Search Options
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-6 bg-gray-700 p-4 rounded-lg">
          <h3 className="text-xl font-bold mb-2">Search Results</h3>
          <div className="overflow-x-auto">
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(5 * 2.4rem)' }}>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-600 sticky top-0">
                    <th className="p-2 text-left">Exchange</th>
                    <th className="p-2 text-left">Security ID</th>
                    <th className="p-2 text-left">Instrument Type</th>
                    <th className="p-2 text-left">Lot Size</th>
                    <th className="p-2 text-left">Symbol</th>
                    {searchType === "options" && <th className="p-2 text-left">Strike</th>}
                    {searchType === "options" && <th className="p-2 text-left">Option Type</th>}
                    {searchType === "options" && <th className="p-2 text-left">Expiry</th>}
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((result, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-600 hover:bg-gray-600 cursor-pointer"
                      onClick={() => handleRowClick(result)}
                    >
                      <td className="p-2">{result.Exchange_segment || "N/A"}</td>
                      <td className="p-2">{result.Security_ID || "N/A"}</td>
                      <td className="p-2">{result.Instrument_Type || "N/A"}</td>
                      <td className="p-2">{result.Lot_Size || "N/A"}</td>
                      <td className="p-2">{result.Symbol_Name || "N/A"}</td>
                      {searchType === "options" && <td className="p-2">{result.Strike_Price || "N/A"}</td>}
                      {searchType === "options" && <td className="p-2">{result.Option_Type || "N/A"}</td>}
                      {searchType === "options" && <td className="p-2">{result.Expiry_Date || "N/A"}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Order Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-1">Security ID</label>
          <input
            type="text"
            name="security_id"
            value={formData.security_id}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
            placeholder="e.g., 48337"
          />
        </div>
        
        <div>
          <label className="block mb-1">Exchange Segment</label>
          <select
            name="exchange_segment"
            value={formData.exchange_segment}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
          >
            <option value="NSE_EQ">NSE Equity</option>
            <option value="BSE_EQ">BSE Equity</option>
            <option value="NSE_FNO">NSE F&O</option>
            <option value="BSE_FNO">BSE F&O</option>
          </select>
        </div>
        
        <div>
          <label className="block mb-1">Transaction Type</label>
          <select
            name="transaction_type"
            value={formData.transaction_type}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
          >
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
          </select>
        </div>
        
        <div>
          <label className="block mb-1">Product Type</label>
          <select
            name="product_type"
            value={formData.product_type}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
            disabled={formData.exchange_segment.includes("FNO")}
          >
            <option value="CNC">CNC (Delivery)</option>
            <option value="INTRADAY">Intraday</option>
            <option value="MARGIN">Margin</option>
          </select>
          {formData.exchange_segment.includes("FNO") && (
            <p className="text-xs text-gray-400 mt-1">F&O orders use MARGIN product type</p>
          )}
        </div>
        
        <div>
          <label className="block mb-1">Order Type</label>
          <select
            name="order_type"
            value={formData.order_type}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
          >
            <option value="MARKET">Market</option>
            <option value="LIMIT">Limit</option>
            <option value="STOP_LOSS">Stop-Loss (SL)</option>
            <option value="STOP_LOSS_MARKET">Stop-Loss Market (SL-M)</option>
          </select>
        </div>
        
        <div>
          <label className="block mb-1">Quantity (in lots for F&O)</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
            min="1"
          />
        </div>
        
        {formData.order_type !== "MARKET" && (
          <div>
            <label className="block mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600"
              step="0.05"
              min="0.01"
              placeholder="e.g., 100.50"
            />
          </div>
        )}
        
        {["STOP_LOSS", "STOP_LOSS_MARKET"].includes(formData.order_type) && (
          <div>
            <label className="block mb-1">Trigger Price</label>
            <input
              type="number"
              name="trigger_price"
              value={formData.trigger_price}
              onChange={handleInputChange}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600"
              step="0.05"
              min="0.01"
              placeholder="e.g., 99.50"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-3">
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full p-3 bg-green-600 text-white font-bold rounded hover:bg-green-700 disabled:bg-gray-600"
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>
        
        <button
          onClick={() => navigate("/")}
          className="w-full p-3 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mt-4 p-3 bg-red-600 text-white rounded">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mt-4 p-3 bg-green-700 text-white rounded">
          {successMessage}
        </div>
      )}

      {/* Order History */}
      {orders.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-3">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-2 text-left">Order ID</th>
                  <th className="p-2 text-left">Order Symbol</th>
                  <th className="p-2 text-left">Security</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Qty</th>
                  <th className="p-2 text-left">Price</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="p-2">{order.order_id || order.test_order_id || "N/A"}</td>
                    <td className="p-2">{order.order_symbol || "N/A"}</td>
                    <td className="p-2">{order.saved_data?.security_id || "N/A"}</td>
                    <td className="p-2">
                      {order.saved_data?.transaction_type || "N/A"} {order.saved_data?.order_type || ""}
                    </td>
                    <td className="p-2">{order.saved_data?.quantity || "N/A"}</td>
                    <td className="p-2">
                      {order.saved_data?.price > 0 ? order.saved_data.price : "MARKET"}
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.status === "success" ? "bg-green-800" :
                        order.status === "offline" ? "bg-yellow-800" :
                        "bg-gray-600"
                      }`}>
                        {order.status || "PENDING"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;