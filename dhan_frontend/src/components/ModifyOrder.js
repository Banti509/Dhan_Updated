
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const ModifyOrder = () => {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [newPrice, setNewPrice] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const handleModifyOrder = async () => {
    if (!orderId || !newPrice || !newQuantity) {
      setMessage("❌ Order ID, New Price, and New Quantity are required.");
      return;
    }

    setLoading(true);
    setMessage('');
    setShowPopup(false);

    try {
      const response = await axios.put('http://localhost:5000/modify-order', {
        symbol,
        orderId,
        new_price: parseFloat(newPrice),
        new_quantity: parseFloat(newQuantity),
      });

      setMessage(`✅ Order Modified Successfully! Order ID: ${response.data.response.orderId}`);
      setShowPopup(true); // Show success popup

      // Hide popup after 3 seconds
      setTimeout(() => setShowPopup(false), 3000);

      // Clear input fields
      setOrderId('');
      setNewPrice('');
      setNewQuantity('');
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.error || "Failed to modify order"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Modify Binance Order</h1>

      <label className="block text-sm mb-2">Order ID:</label>
      <input 
        type="text" 
        value={orderId} 
        onChange={(e) => setOrderId(e.target.value)}
        className="w-full p-2 rounded bg-gray-700 border border-gray-600 mb-3"
        placeholder="Enter Order ID"
      />

      <label className="block text-sm mb-2">Symbol:</label>
      <input 
        type="text" 
        value={symbol} 
        onChange={(e) => setSymbol(e.target.value)}
        className="w-full p-2 rounded bg-gray-700 border border-gray-600 mb-3"
      />

      <label className="block text-sm mb-2">New Price:</label>
      <input 
        type="number" 
        value={newPrice} 
        onChange={(e) => setNewPrice(e.target.value)}
        className="w-full p-2 rounded bg-gray-700 border border-gray-600 mb-3"
        placeholder="Enter New Price"
      />

      <label className="block text-sm mb-2">New Quantity:</label>
      <input 
        type="number" 
        value={newQuantity} 
        onChange={(e) => setNewQuantity(e.target.value)}
        className="w-full p-2 rounded bg-gray-700 border border-gray-600 mb-3"
        placeholder="Enter New Quantity"
      />

      <button 
        onClick={handleModifyOrder} 
        disabled={loading}
        className="w-full p-2 mt-3 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-600"
      >
        {loading ? 'Modifying Order...' : 'Modify Order'}
      </button>

      <button
        onClick={() => navigate("/")}
        className="w-full p-2 mt-3 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Back to Dashboard
      </button>

      {message && <div className="mt-4 p-2 bg-blue-600 text-white rounded">{message}</div>}

      {/* Popup Message */}
      {showPopup && (
        <div className="fixed top-10 right-10 bg-green-500 text-white p-3 rounded-lg shadow-lg">
          Order Modified Successfully!
        </div>
      )}
    </div>
  );
};

export default ModifyOrder;
